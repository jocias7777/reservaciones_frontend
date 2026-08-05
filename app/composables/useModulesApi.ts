import type {
  AdvancedQuery,
  ApiEnvelope,
  AvailableActions,
  CreatePermissionModulePayload,
  PaginatedResult,
  PermissionModule
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

  return {
    /** `GET /permissions` — lista completa; base de la matriz de permisos. */
    list: () => listOrEmpty(unwrap(api<ApiEnvelope<PermissionModule[]>>('/permissions'))),

    /**
     * `GET /permissions/available-actions` — qué acciones comprueba cada módulo.
     *
     * Con esto la matriz ofrece por módulo solo lo que ese módulo implementa, en
     * vez de las nueve acciones en todos.
     */
    availableActions: () =>
      unwrap(api<ApiEnvelope<AvailableActions>>('/permissions/available-actions')),

    /** `QUERY /permissions` — búsqueda avanzada (sin expands). */
    query: (query: AdvancedQuery = {}) =>
      unwrap(api<ApiEnvelope<PaginatedResult<PermissionModule>>>('/permissions', {
        method: 'QUERY',
        body: query
      })),

    /** `POST /permissions`. */
    create: (payload: CreatePermissionModulePayload) =>
      unwrap(api<ApiEnvelope<PermissionModule>>('/permissions', { method: 'POST', body: payload }))
  }
}
