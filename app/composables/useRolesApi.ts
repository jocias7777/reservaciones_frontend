import type {
  AdvancedQuery,
  ApiEnvelope,
  CreateRolePayload,
  PaginatedResult,
  Role,
  RoleWithRelations,
  UpdateRolePayload
} from '~/types'

/**
 * `app/routes/role_routes.py` — todo requiere el permiso `roles:<acción>`.
 *
 * Como en usuarios, el borrado definitivo del backend no se expone: la interfaz
 * solo hace borrado lógico.
 */
export function useRolesApi() {
  const api = useApi()

  return {
    /** `GET /roles` — lista completa, para poblar el selector de rol. */
    list: () => listOrEmpty(unwrap(api<ApiEnvelope<Role[]>>('/roles'))),

    /** `QUERY /roles` — búsqueda avanzada. Expand disponible: `users`. */
    query: (query: AdvancedQuery = {}) =>
      unwrap(api<ApiEnvelope<PaginatedResult<RoleWithRelations>>>('/roles', {
        method: 'QUERY',
        body: query
      })),

    /** `GET /roles/:id`. */
    get: (id: string) => unwrap(api<ApiEnvelope<Role>>(`/roles/${id}`)),

    /** `POST /roles`. */
    create: (payload: CreateRolePayload) =>
      unwrap(api<ApiEnvelope<Role>>('/roles', { method: 'POST', body: payload })),

    /** `PUT /roles/:id`. */
    update: (id: string, payload: UpdateRolePayload) =>
      unwrap(api<ApiEnvelope<Role>>(`/roles/${id}`, { method: 'PUT', body: payload })),

    /** `DELETE /roles/:id` — borrado lógico. Responde `data: null`. */
    remove: (id: string) => unwrap(api<ApiEnvelope<null>>(`/roles/${id}`, { method: 'DELETE' })),

    /** `DELETE /roles/bulk` — borrado lógico masivo. */
    bulkRemove: (ids: string[]) =>
      unwrap(api<ApiEnvelope<null>>('/roles/bulk', { method: 'DELETE', body: { ids } }))
  }
}
