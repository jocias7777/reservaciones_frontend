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
 * Las dos vías miden lo mismo: el resultado de `require_permission`, con lo que
 * da el rol, las excepciones de ese usuario y el bypass del superadmin ya
 * aplicados. Calcularlo por nuestra cuenta seria reimplementar esas tres reglas
 * y arriesgarse a que digan cosas distintas.
 *
 * Esto NO es la barrera de seguridad: la barrera es el backend, que vuelve a
 * comprobarlo en cada petición. Aquí solo se evita ofrecer y abrir pantallas que
 * van a responder 403 en cuanto pidan sus datos.
 */

/** Lo publica el backend como `{ "users": ["read", "list"], ... }`. */
const PERMISSIONS_ENDPOINT = '/auth/me/permissions'

/** De dónde salieron los permisos que hay en memoria. */
export type AccessSource = 'declared' | 'probed'

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
   * ¿Contesta este módulo a una consulta de listado?
   *
   * Solo un 403 cuenta como "no puede". Si falla por cualquier otra razón —el
   * backend caído, la red— se concede: dejar a alguien fuera de su propia
   * aplicación por un fallo pasajero es peor que dejarle entrar a una pantalla
   * que, si de verdad no le corresponde, el backend le va a negar igual.
   */
  async function probe(module: string): Promise<boolean> {
    const endpoint = MODULE_ENDPOINTS[module]
    if (!endpoint) return true

    try {
      await queryOne(endpoint)
      return true
    } catch (error) {
      return apiErrorStatus(error) !== 403
    }
  }

  /** Vía 2: se deduce módulo por módulo. */
  async function probeAll(): Promise<Record<string, boolean>> {
    const results = await Promise.all(
      GUARDED_MODULES.map(async module => [module, await probe(module)] as const)
    )

    return Object.fromEntries(
      results.map(([module, allowed]) => [accessKey(module, 'list'), allowed])
    )
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
   * Si el usuario puede hacer algo.
   *
   * Cuando los permisos los publica el backend se sabe de todas las acciones, y
   * lo que no aparece es que no lo tiene. Deduciéndolos solo se averigua quién
   * puede listar: del resto no se sabe nada, así que se concede y el backend
   * responderá 403 si no tocaba. Antes de haber preguntado se concede también,
   * para que el menú no parpadee escondiendo apartados que sí se tienen.
   */
  function can(module: string, action = 'list'): boolean {
    if (!loaded.value) return true

    const key = accessKey(module, action)
    if (key in granted.value) return granted.value[key]!

    return source.value !== 'declared'
  }

  /** Si se puede abrir una ruta concreta. */
  function canVisit(path: string): boolean {
    const required = accessForRoute(path)
    return required ? can(required.module, required.action) : true
  }

  /** La primera pantalla que sí puede abrir, para no mandarlo a un muro. */
  const firstAllowedRoute = computed(() => LANDING_ROUTES.find(canVisit) ?? null)

  /** Se vuelve a preguntar tras cambiar de sesión. */
  function reset() {
    granted.value = {}
    source.value = null
    loaded.value = false
  }

  return { granted, loaded, source, ensureLoaded, can, canVisit, firstAllowedRoute, reset }
}
