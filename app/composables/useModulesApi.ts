import type {
  AdvancedQuery,
  ApiEnvelope,
  AvailableActions,
  CreatePermissionModulePayload,
  PaginatedResult,
  PermissionModule,
  SelectOptionsParams,
  SelectOptionsResult
} from '~/types'

/**
 * Módulos del sistema — `app/routes/permission_routes.py` (`/permissions`).
 *
 * En el backend la tabla es `sa_permissions`, pero cada fila representa un
 * MÓDULO (`users`, `roles`, ...). Aquí se llama "módulo" para que el nombre
 * coincida con lo que ve el usuario: los permisos como tal nacen al cruzar
 * módulo × acción en `role-permissions` / `user-permissions`.
 */
export function useModulesApi() {
  const api = useApi()

  /** `QUERY /permissions` — búsqueda avanzada (sin expands). Exige `list`. */
  const query = (query: AdvancedQuery = {}) =>
    unwrap(api<ApiEnvelope<PaginatedResult<PermissionModule>>>('/permissions', {
      method: 'QUERY',
      body: query
    }))

  return {
    /**
     * Catálogo completo de módulos; base de la matriz de permisos.
     *
     * Va por `QUERY` y no por `GET` porque necesita `code`, `name` y
     * `description` de cada módulo, y `GET /permissions` devuelve opciones de
     * combo (`{ label, value }`). Exige la acción `list`.
     */
    list: () => listOrEmpty(fetchAllPages(query, { sortBy: 'name', sortOrder: 'ASC' })),

    /**
     * `GET /permissions?q=&limit=` — opciones para un desplegable. Exige `select`.
     */
    options: (params: SelectOptionsParams = {}) =>
      unwrap(api<ApiEnvelope<SelectOptionsResult>>('/permissions', { query: params })),

    /**
     * `GET /permissions/available-actions` — qué acciones comprueba cada módulo.
     *
     * Con esto la matriz ofrece por módulo solo lo que ese módulo implementa, en
     * vez de las nueve acciones en todos.
     */
    availableActions: () =>
      unwrap(api<ApiEnvelope<AvailableActions>>('/permissions/available-actions')),

    query,

    /** `POST /permissions`. */
    create: (payload: CreatePermissionModulePayload) =>
      unwrap(api<ApiEnvelope<PermissionModule>>('/permissions', { method: 'POST', body: payload }))
  }
}
