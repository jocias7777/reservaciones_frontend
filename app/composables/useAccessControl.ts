import type { FetchOptions } from 'ofetch'
import type { ApiClient } from '~/plugins/api'

/**
 * Qué puede ver de verdad el usuario que ha iniciado sesión.
 *
 * Hay dos formas de averiguarlo y se intentan en este orden:
 *
 * 1. Preguntárselo al backend, si publica sus permisos en
 *    `GET /auth/me/permissions`. Es una sola petición y trae TODAS las acciones
 *    de cada módulo, así que también se sabe quién puede crear o borrar.
 *
 * 2. Si ese endpoint no existe, deducirlo probando: una consulta mínima
 *    (`QUERY` con `limit: 1`) a cada módulo, mirando si contesta o si responde
 *    403. Sale más caro —una petición por módulo— y solo averigua quién puede
 *    listar, que es lo que hace falta para decidir si se entra a una pantalla.
 *
 *    `restore`, `bulk_restore` y `create`/`update`/`delete`/`bulk_delete` se
 *    prueban también, aparte: no hay un `GET` barato para ninguno de esos, así
 *    que se manda la petición real de escritura contra un id que no puede
 *    existir (o un cuerpo vacío, para `create`). Ninguno de los desenlaces
 *    posibles —403 sin permiso, 404/400 "no encontrado"/"datos incompletos"
 *    con permiso— toca una fila de la base: se comprobó, con las cuatro
 *    validaciones de alta del backend (usuario, rol, acción, categoría) antes
 *    de escribir nada, que un cuerpo vacío nunca pasa a crear un registro real.
 *
 * Las dos vías miden lo mismo: el resultado de `require_permission`, con lo que
 * da el rol, las excepciones de ese usuario y el bypass del superadmin ya
 * aplicados. Calcularlo por nuestra cuenta seria reimplementar esas tres reglas
 * y arriesgarse a que digan cosas distintas.
 *
 * Esto NO es la barrera de seguridad: la barrera es el backend, que vuelve a
 * comprobarlo en cada petición. Aquí solo se evita ofrecer y abrir pantallas que
 * van a responder 403 en cuanto pidan sus datos.
 *
 * La decisión de qué se puede hacer con ese estado —`can`, `canVisit`— es pura
 * y vive en `app/utils/access.ts` (`resolveCan` y compañía); este composable
 * solo junta el estado reactivo y las llamadas de red. Así la decisión se
 * puede probar sin Nuxt de por medio.
 */

/** Lo publica el backend como `{ "users": ["read", "list"], ... }`. */
const PERMISSIONS_ENDPOINT = '/auth/me/permissions'

/**
 * Id con el que se prueban `restore`, `update` y `delete` (uno a uno o en
 * lote) sin tocar ninguna fila de verdad.
 *
 * No existe fila con este id —ningún generador de ids reales va a
 * producirlo—, así que cualquier petición contra él —sola o dentro de un
 * `{ ids: [...] }`— siempre llega vacía al repositorio. Lo único que decide la
 * respuesta es el permiso.
 */
const PROBE_ID = '00000000-0000-0000-0000-000000000000'

export function useAccessControl() {
  const api = useApi()
  const session = useAuthSession()
  const config = useRuntimeConfig()

  /** `{ 'users::list': true, 'roles::list': false, ... }` */
  const granted = useState<Record<string, boolean>>('access:granted', () => ({}))
  const loaded = useState<boolean>('access:loaded', () => false)
  const source = useState<AccessSource | null>('access:source', () => null)

  /**
   * Una llamada al backend, hecha de la forma que funciona en cada lado.
   *
   * En el navegador va por `/api`, como todo lo demás. En el servidor NO puede
   * ir por ahí: el proxy de `/api` tiene que leer a mano el cuerpo de los
   * métodos que h3 no conoce —y `QUERY` es uno—, y en una petición interna ese
   * cuerpo no se deja leer («Readable.asyncIterator is not implemented yet»).
   * Así que durante el render se habla directamente con el backend, que es
   * exactamente a donde apunta el proxy.
   *
   * Se hace este esfuerzo para poder decidir ANTES de pintar. Dejándolo solo
   * para el navegador, la pantalla prohibida se llegaba a ver un segundo y
   * medio largo antes de que el redirect la quitara de en medio.
   */
  function request<T>(endpoint: string, options: FetchOptions<'json'> = {}): Promise<T> {
    if (!import.meta.server) return api<T>(endpoint, options)

    const target = config.apiProxyTarget.replace(/\/+$/, '')

    // Igual que en `plugins/api.ts`: la unión de métodos de Nitro no incluye
    // `QUERY`, así que se usa la firma de `ofetch`, que sí lo admite.
    const http = $fetch as unknown as ApiClient

    return http<T>(`${target}${config.public.apiBase}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken.value}`,
        ...options.headers
      }
    })
  }

  /** Consulta de una sola fila: lo más barato que comprueba el permiso de listar. */
  function queryOne(endpoint: string) {
    const body = { page: 1, limit: 1 }

    return request(endpoint, {
      method: 'QUERY',
      // `ofetch` solo serializa el cuerpo de los métodos que conoce, y `QUERY`
      // no está en su lista; en el navegador de eso ya se encarga el plugin.
      body: import.meta.server ? JSON.stringify(body) : body
    })
  }

  /**
   * Convierte lo que publica el backend en el mapa que se usa aquí.
   *
   * Se acepta tanto con el envoltorio `{ data }` como sin él, porque es un
   * endpoint nuevo y no conviene atarse a un detalle de forma. Si lo que llega
   * no encaja —o llega vacío— se devuelve `null` y se pasa a deducirlo
   * probando: más vale una vuelta de más que dejar a alguien fuera de su
   * aplicación por una respuesta que no supimos leer.
   */
  function toGrantedMap(payload: unknown): Record<string, boolean> | null {
    const envelope = payload as { data?: unknown } | null
    const raw = (envelope && typeof envelope === 'object' && 'data' in envelope ? envelope.data : payload)

    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

    const map: Record<string, boolean> = {}

    for (const [module, actions] of Object.entries(raw as Record<string, unknown>)) {
      if (!Array.isArray(actions)) return null

      for (const action of actions) {
        if (typeof action !== 'string') return null
        map[accessKey(module, action)] = true
      }
    }

    return Object.keys(map).length ? map : null
  }

  /** Vía 1: el backend los publica. */
  async function fetchDeclared(): Promise<Record<string, boolean> | null> {
    try {
      return toGrantedMap(await request(PERMISSIONS_ENDPOINT))
    } catch {
      // 404 mientras el backend no lo tenga; cualquier otro fallo tampoco debe
      // impedir que se resuelva por la otra vía.
      return null
    }
  }

  /**
   * Corre la petición real de prueba y la traduce a "puede" / "no puede".
   *
   * Solo un 403 cuenta como "no puede". Si falla por cualquier otra razón —el
   * backend caído, la red, un 404/400 porque el id de prueba no es de nadie o
   * el cuerpo vacío no pasa la validación— se concede: dejar a alguien fuera
   * de su propia aplicación por un fallo pasajero es peor que dejarle entrar a
   * algo que, si de verdad no le corresponde, el backend le va a negar igual.
   *
   * Todas las pruebas de abajo comparten esta forma; solo cambia qué endpoint
   * y qué método golpean.
   */
  async function probeWrite(run: () => Promise<unknown>): Promise<boolean> {
    try {
      await run()
      return true
    } catch (error) {
      return apiErrorStatus(error) !== 403
    }
  }

  /** `probeWrite`, pero resuelto solo si el módulo tiene endpoint conocido. */
  function probeModuleAction(module: string, run: (endpoint: string) => Promise<unknown>): Promise<boolean> {
    const endpoint = MODULE_ENDPOINTS[module]
    return endpoint ? probeWrite(() => run(endpoint)) : Promise.resolve(true)
  }

  /** ¿Contesta este módulo a una consulta de listado? */
  const probe = (module: string) => probeModuleAction(module, endpoint => queryOne(endpoint))

  /**
   * ¿Puede restaurar una fila de este módulo?
   *
   * No hay un `GET` barato para `restore`, así que se manda el `POST` real
   * contra `PROBE_ID`. Sin permiso, el decorador del backend corta con
   * 403 antes de llegar al repositorio; con permiso, llega y responde 404
   * porque el id no es de nadie. Ninguno de los dos casos escribe nada.
   */
  const probeRestore = (module: string) => probeModuleAction(
    module,
    endpoint => request(`${endpoint}/${PROBE_ID}/restore`, { method: 'POST' })
  )

  /**
   * ¿Puede restaurar en lote en este módulo?
   *
   * Es un permiso aparte de `restore` en el backend (`require_permission(modulo,
   * 'bulk_restore')`): alguien puede tener uno sin el otro. Mismo truco que
   * `probeRestore`, contra `POST .../bulk/restore` con `PROBE_ID` como
   * único id de la lista.
   */
  const probeBulkRestore = (module: string) => probeModuleAction(
    module,
    endpoint => request(`${endpoint}/bulk/restore`, { method: 'POST', body: { ids: [PROBE_ID] } })
  )

  /**
   * ¿Puede dar de alta en este módulo?
   *
   * El `POST` de creación con el cuerpo vacío `{}`: si el permiso falta, el
   * decorador corta con 403 antes de leerlo; si está, la validación de alta
   * de los cuatro módulos con formulario (usuario, rol, acción, categoría)
   * rechaza el cuerpo vacío con 400 ANTES de que el servicio toque la base
   * —todas exigen al menos un campo—, así que nunca se llega a crear nada.
   */
  const probeCreate = (module: string) => probeModuleAction(
    module,
    endpoint => request(endpoint, { method: 'POST', body: {} })
  )

  /**
   * ¿Puede editar una fila de este módulo?
   *
   * `PUT .../<id>` con `PROBE_ID` y cuerpo vacío. Mismo doble cierre
   * que `create`: sin permiso, 403 antes de leer el cuerpo; con permiso, la
   * validación de actualización rechaza el cuerpo vacío con 400 antes de
   * buscar la fila, así que ni siquiera llega a comprobar que el id no existe.
   */
  const probeUpdate = (module: string) => probeModuleAction(
    module,
    endpoint => request(`${endpoint}/${PROBE_ID}`, { method: 'PUT', body: {} })
  )

  /**
   * ¿Puede eliminar una fila de este módulo?
   *
   * `DELETE .../<id>` con `PROBE_ID`. Sin permiso, 403; con permiso,
   * el servicio busca la fila, no la encuentra y responde 404 sin borrar nada.
   */
  const probeDelete = (module: string) => probeModuleAction(
    module,
    endpoint => request(`${endpoint}/${PROBE_ID}`, { method: 'DELETE' })
  )

  /**
   * ¿Puede eliminar en lote en este módulo?
   *
   * `DELETE .../bulk` con `PROBE_ID` como único id. Sin permiso, 403;
   * con permiso, no hay ninguna fila activa con ese id y no se borra nada.
   */
  const probeBulkDelete = (module: string) => probeModuleAction(
    module,
    endpoint => request(`${endpoint}/bulk`, { method: 'DELETE', body: { ids: [PROBE_ID] } })
  )

  /**
   * Junta en un solo mapa el resultado de probar una acción en una lista de
   * módulos. Lo usa `probeAll` una vez por acción, en vez de repetir el mismo
   * `Promise.all` + `accessKey` para cada una.
   */
  async function probeAction(
    modules: readonly string[],
    action: string,
    run: (module: string) => Promise<boolean>
  ): Promise<Array<readonly [string, boolean]>> {
    return Promise.all(modules.map(async module => [accessKey(module, action), await run(module)] as const))
  }

  /**
   * Vía 2: se deduce módulo por módulo. `list` en todos los módulos guardados;
   * `restore`/`bulk_restore` y `create`/`update`/`delete`/`bulk_delete` solo en
   * los que tienen papelera y formulario de alta, respectivamente.
   */
  async function probeAll(): Promise<Record<string, boolean>> {
    const results = await Promise.all([
      probeAction(GUARDED_MODULES, 'list', probe),
      probeAction(RESTORABLE_MODULES, 'restore', probeRestore),
      probeAction(RESTORABLE_MODULES, 'bulk_restore', probeBulkRestore),
      probeAction(MANAGED_MODULES, 'create', probeCreate),
      probeAction(MANAGED_MODULES, 'update', probeUpdate),
      probeAction(MANAGED_MODULES, 'delete', probeDelete),
      probeAction(MANAGED_MODULES, 'bulk_delete', probeBulkDelete)
    ])

    return Object.fromEntries(results.flat())
  }

  async function resolve() {
    const declared = await fetchDeclared()

    granted.value = declared ?? await probeAll()
    source.value = declared ? 'declared' : 'probed'
    loaded.value = true
  }

  /**
   * Resuelve los permisos una vez por sesión cargada.
   *
   * El resultado viaja del servidor al navegador dentro del estado de Nuxt, así
   * que se pregunta una sola vez por carga de página, no dos.
   *
   * La promesa se guarda en el contexto de Nuxt y no en un módulo suelto: un
   * valor de módulo lo compartirían todas las peticiones del servidor a la vez,
   * y un usuario acabaría viendo el menú de otro.
   */
  function ensureLoaded(): Promise<void> {
    if (loaded.value || !session.isAuthenticated.value) return Promise.resolve()

    const nuxtApp = useNuxtApp() as { _accessProbe?: Promise<void> }
    nuxtApp._accessProbe ??= resolve().finally(() => {
      nuxtApp._accessProbe = undefined
    })

    return nuxtApp._accessProbe
  }

  /**
   * La decisión en sí —`resolveCan` / `resolveCanVisit`— vive en
   * `app/utils/access.ts` como funciones puras, para poder probarla con un
   * test normal y corriente en vez de tener que montar toda la aplicación.
   * Aquí solo se les pasa el estado reactivo ya resuelto.
   */
  const state = computed<AccessState>(() => ({ granted: granted.value, loaded: loaded.value, source: source.value }))

  function can(module: string, action = 'list'): boolean {
    return resolveCan(state.value, module, action)
  }

  function canVisit(path: string): boolean {
    return resolveCanVisit(state.value, path)
  }

  /** La primera pantalla que sí puede abrir, para no mandarlo a un muro. */
  const firstAllowedRoute = computed(() => LANDING_ROUTES.find(canVisit) ?? null)

  /** Se vuelve a preguntar tras cambiar de sesión. */
  function reset() {
    granted.value = {}
    source.value = null
    loaded.value = false
  }

  /**
   * Vuelve a preguntar sin esperar a un logout/login.
   *
   * `ensureLoaded` se pregunta una sola vez por sesión a propósito —sondear en
   * cada navegación sale caro—, pero eso significa que guardar un cambio en
   * «Permisos por rol» o «Permisos por usuario» no se refleja para quien
   * acaba de hacerlo: sigue viendo el estado con el que entró hasta que cierra
   * sesión. Esas dos pantallas llaman a esto justo después de guardar, para
   * que la propia cuenta que edita vea el resultado ya, sin recargar.
   */
  function refresh(): Promise<void> {
    reset()
    return ensureLoaded()
  }

  return { granted, loaded, source, ensureLoaded, can, canVisit, firstAllowedRoute, reset, refresh }
}
