import type { ApiClient } from '~/plugins/api'

/**
 * Qué puede ver de verdad el usuario que ha iniciado sesión.
 *
 * El backend no publica los permisos de la sesión: `GET /auth/me` devuelve la
 * cuenta y el nombre de su rol, nada más. Y no se pueden deducir leyendo
 * `role-permissions`, porque para leer esa tabla hace falta permiso sobre ella,
 * que es justo lo que una cuenta limitada no tiene.
 *
 * Así que se pregunta de la única forma que no se puede equivocar: pidiendo. Una
 * consulta mínima (`QUERY` con `limit: 1`) a cada módulo, y se mira si contesta o
 * si responde 403. Esa respuesta ya tiene aplicado todo lo que decide
 * `require_permission`: lo que da el rol, las excepciones de ese usuario en
 * concreto y el bypass del superadmin. Deducirlo por nuestra cuenta sería
 * reimplementar esas tres reglas y arriesgarse a que digan cosas distintas.
 *
 * Esto NO es la barrera de seguridad: la barrera es el backend, que vuelve a
 * comprobarlo en cada petición. Aquí solo se evita ofrecer y abrir pantallas que
 * van a responder 403 en cuanto pidan sus datos.
 */
export function useAccessControl() {
  const api = useApi()
  const session = useAuthSession()
  const config = useRuntimeConfig()

  /** `{ 'users::list': true, 'roles::list': false, ... }` */
  const granted = useState<Record<string, boolean>>('access:granted', () => ({}))
  const loaded = useState<boolean>('access:loaded', () => false)

  /**
   * La consulta de sondeo, hecha de la forma que funciona en cada lado.
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
  function ask(endpoint: string) {
    if (!import.meta.server) {
      return api(endpoint, { method: 'QUERY', body: { page: 1, limit: 1 } })
    }

    const target = config.apiProxyTarget.replace(/\/+$/, '')

    // Igual que en `plugins/api.ts`: la unión de métodos de Nitro no incluye
    // `QUERY`, así que se usa la firma de `ofetch`, que sí lo admite.
    const http = $fetch as unknown as ApiClient

    return http(`${target}${config.public.apiBase}${endpoint}`, {
      method: 'QUERY',
      // `ofetch` solo serializa el cuerpo de los métodos que conoce, y `QUERY`
      // tampoco está en su lista.
      body: JSON.stringify({ page: 1, limit: 1 }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken.value}`
      }
    })
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
      await ask(endpoint)
      return true
    } catch (error) {
      return apiErrorStatus(error) !== 403
    }
  }

  async function probeAll() {
    const results = await Promise.all(
      GUARDED_MODULES.map(async module => [module, await probe(module)] as const)
    )

    granted.value = Object.fromEntries(
      results.map(([module, allowed]) => [accessKey(module, 'list'), allowed])
    )
    loaded.value = true
  }

  /**
   * Consulta los permisos una vez por sesión cargada.
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
    nuxtApp._accessProbe ??= probeAll().finally(() => {
      nuxtApp._accessProbe = undefined
    })

    return nuxtApp._accessProbe
  }

  /**
   * Mientras no se haya preguntado, se concede: el menú no debe parpadear
   * escondiendo apartados que sí se tienen, y quien mande la verdad es el
   * backend en la petición siguiente.
   */
  function can(module: string, action = 'list'): boolean {
    if (!loaded.value) return true
    return granted.value[accessKey(module, action)] ?? true
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
    loaded.value = false
  }

  return { granted, loaded, ensureLoaded, can, canVisit, firstAllowedRoute, reset }
}
