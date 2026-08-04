import type {
  AdvancedQuery,
  ApiEnvelope,
  CreateUserPermissionPayload,
  PaginatedResult,
  UpdateUserPermissionPayload,
  UserPermission
} from '~/types'

/** Límite máximo de `limit` que acepta `AdvancedQuerySchema` en el backend. */
const MAX_LIMIT = 100

/**
 * `app/routes/user_permission_routes.py` (`/user-permissions`).
 *
 * Cada fila es una EXCEPCIÓN sobre lo que concede el rol del usuario:
 * `is_grant: true` añade un permiso que el rol no tiene, `false` lo revoca.
 * Requiere permisos del módulo `user_permissions`.
 */
export function useUserPermissionsApi() {
  const api = useApi()

  return {
    /** Todas las excepciones de un usuario, recorriendo la paginación del backend. */
    async listByUser(userId: string): Promise<UserPermission[]> {
      const rows: UserPermission[] = []
      let page = 1
      let hasMorePages = true

      while (hasMorePages) {
        const result = await unwrap(
          api<ApiEnvelope<PaginatedResult<UserPermission>>>('/user-permissions', {
            method: 'QUERY',
            body: {
              page,
              limit: MAX_LIMIT,
              filters: { user_id: userId },
              sortBy: 'created_at',
              sortOrder: 'ASC'
            } satisfies AdvancedQuery
          })
        )

        rows.push(...result.items)
        hasMorePages = page < (result.pages || 1)
        page += 1
      }

      return rows
    },

    /** `POST /user-permissions` — crea la excepción (o reactiva una borrada). */
    create: (payload: CreateUserPermissionPayload) =>
      unwrap(api<ApiEnvelope<UserPermission>>('/user-permissions', {
        method: 'POST',
        body: payload
      })),

    /** `PUT /user-permissions/:id` — cambia una excepción de conceder a revocar (o al revés). */
    update: (id: string, payload: UpdateUserPermissionPayload) =>
      unwrap(api<ApiEnvelope<UserPermission>>(`/user-permissions/${id}`, {
        method: 'PUT',
        body: payload
      })),

    /** `DELETE /user-permissions/:id` — quita la excepción (vuelve a heredar del rol). */
    remove: (id: string) =>
      unwrap(api<ApiEnvelope<UserPermission>>(`/user-permissions/${id}`, { method: 'DELETE' }))
  }
}
