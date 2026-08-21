import type { FetchOptions } from 'ofetch'
import type { ApiClient } from '~/plugins/api'

/** Lo publica el backend como `{ "users": ["read", "list"], ... }`. */
const PERMISSIONS_ENDPOINT = '/auth/me/permissions'

const PROBE_ID = '00000000-0000-0000-0000-000000000000'

function unwrapField(payload: unknown, field: string): unknown {
  if (!payload || typeof payload !== 'object' || !(field in payload)) return payload

  return (payload as Record<string, unknown>)[field]
}

export function useAccessControl() {
  const api = useApi()
  const session = useAuthSession()
  const config = useRuntimeConfig()

  /** `{ 'users::list': true, 'roles::list': false, ... }` */
  const granted = useState<Record<string, boolean>>('access:granted', () => ({}))
  const loaded = useState<boolean>('access:loaded', () => false)
  const source = useState<AccessSource | null>('access:source', () => null)

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

  function toGrantedMap(payload: unknown): Record<string, boolean> | null {
    const raw = unwrapField(unwrapField(payload, 'data'), 'permissions')

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

  const probeRestore = (module: string) => probeModuleAction(
    module,
    endpoint => request(`${endpoint}/${PROBE_ID}/restore`, { method: 'POST' })
  )

  const probeBulkRestore = (module: string) => probeModuleAction(
    module,
    endpoint => request(`${endpoint}/bulk/restore`, { method: 'POST', body: { ids: [PROBE_ID] } })
  )

  const probeCreate = (module: string) => probeModuleAction(
    module,
    endpoint => request(endpoint, { method: 'POST', body: {} })
  )

  const probeUpdate = (module: string) => probeModuleAction(
    module,
    endpoint => request(`${endpoint}/${PROBE_ID}`, { method: 'PUT', body: {} })
  )

  const probeDelete = (module: string) => probeModuleAction(
    module,
    endpoint => request(`${endpoint}/${PROBE_ID}`, { method: 'DELETE' })
  )

  const probeBulkDelete = (module: string) => probeModuleAction(
    module,
    endpoint => request(`${endpoint}/bulk`, { method: 'DELETE', body: { ids: [PROBE_ID] } })
  )

  const ASSIGN_PATH_SEGMENT: Record<string, string> = {
    role_permissions: 'by-role',
    user_permissions: 'by-user'
  }

  const probeAssign = (module: string) => {
    const segment = ASSIGN_PATH_SEGMENT[module]
    if (!segment) return Promise.resolve(true)

    return probeModuleAction(module, endpoint => request(`${endpoint}/${segment}/${PROBE_ID}`, { method: 'GET' }))
  }

  async function probeAction(
    modules: readonly string[],
    action: string,
    run: (module: string) => Promise<boolean>
  ): Promise<Array<readonly [string, boolean]>> {
    return Promise.all(modules.map(async module => [accessKey(module, action), await run(module)] as const))
  }

  async function probeAll(): Promise<Record<string, boolean>> {
    const results = await Promise.all([
      probeAction(GUARDED_MODULES, 'list', probe),
      probeAction(RESTORABLE_MODULES, 'restore', probeRestore),
      probeAction(RESTORABLE_MODULES, 'bulk_restore', probeBulkRestore),
      probeAction(MANAGED_MODULES, 'create', probeCreate),
      probeAction(MANAGED_MODULES, 'update', probeUpdate),
      probeAction(MANAGED_MODULES, 'delete', probeDelete),
      probeAction(MANAGED_MODULES, 'bulk_delete', probeBulkDelete),
      probeAction(ASSIGNABLE_MODULES, 'assign', probeAssign)
    ])

    return Object.fromEntries(results.flat())
  }

  async function resolve() {
    const declared = await fetchDeclared()

    granted.value = declared ?? await probeAll()
    source.value = declared ? 'declared' : 'probed'
    loaded.value = true
  }

  function ensureLoaded(): Promise<void> {
    if (loaded.value || !session.isAuthenticated.value) return Promise.resolve()

    const nuxtApp = useNuxtApp() as { _accessProbe?: Promise<void> }
    nuxtApp._accessProbe ??= resolve().finally(() => {
      nuxtApp._accessProbe = undefined
    })

    return nuxtApp._accessProbe
  }

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

  function refresh(): Promise<void> {
    reset()
    return ensureLoaded()
  }

  return { granted, loaded, source, ensureLoaded, can, canVisit, firstAllowedRoute, reset, refresh }
}
