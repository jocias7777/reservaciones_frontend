import type {
  AdvancedQuery,
  ApiEnvelope,
  CreateUserPermissionPayload,
  PaginatedResult,
  UserPermission,
  UserPermissionBulkUpdateItem
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

    /**
     * `POST /user-permissions/bulk/create` — crea varias excepciones nuevas de
     * una sola vez. El backend valida el formato de todas antes de tocar la
     * base, pero una que ya exista no cancela el lote: sale detallada en
     * `errores` junto con lo que sí se guardó.
     */
    bulkCreate: (items: CreateUserPermissionPayload[]) =>
      bulkWrite<CreateUserPermissionPayload>(api, '/user-permissions/bulk/create', 'POST', items),

    /**
     * `PUT /user-permissions/bulk/update` — cambia varias excepciones existentes
     * de conceder a revocar (o al revés) de una sola vez. Cada elemento lleva
     * su `id`, que es el de la fila en `sa_user_permissions`, no el del usuario.
     */
    bulkUpdate: (items: UserPermissionBulkUpdateItem[]) =>
      bulkWrite<UserPermissionBulkUpdateItem>(api, '/user-permissions/bulk/update', 'PUT', items),

    /** `DELETE /user-permissions/bulk` — quita varias excepciones (vuelven a heredar del rol). */
    bulkRemove: (ids: string[]) =>
      unwrap(api<ApiEnvelope<UserPermission[]>>('/user-permissions/bulk', {
        method: 'DELETE',
        body: { ids }
      }))
  }
}
