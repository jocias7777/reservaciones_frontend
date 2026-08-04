import type {
  AdvancedQuery,
  ApiEnvelope,
  CreateRolePermissionPayload,
  PaginatedResult,
  RolePermission
} from '~/types'

/** Límite máximo de `limit` que acepta `AdvancedQuerySchema` en el backend. */
const MAX_LIMIT = 100

/**
 * `app/routes/role_permission_routes.py` (`/role-permissions`).
 * Requiere permisos del módulo `permissions`, no del módulo `roles`.
 */
export function useRolePermissionsApi() {
  const api = useApi()

  return {
    /**
     * Todas las combinaciones módulo × acción concedidas a un rol.
     *
     * El backend pagina con un máximo de 100 por página, así que se recorren las
     * páginas hasta completar el total: la matriz necesita el conjunto entero
     * para saber qué interruptores están encendidos.
     */
    async listByRole(roleId: string): Promise<RolePermission[]> {
      const rows: RolePermission[] = []
      let page = 1
      let hasMorePages = true

      while (hasMorePages) {
        const result = await unwrap(
          api<ApiEnvelope<PaginatedResult<RolePermission>>>('/role-permissions', {
            method: 'QUERY',
            body: {
              page,
              limit: MAX_LIMIT,
              filters: { role_id: roleId },
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

    /** `POST /role-permissions` — concede una combinación rol × módulo × acción. */
    create: (payload: CreateRolePermissionPayload) =>
      unwrap(api<ApiEnvelope<RolePermission>>('/role-permissions', {
        method: 'POST',
        body: payload
      })),

    /** `DELETE /role-permissions/bulk` — revoca varias combinaciones de una vez. */
    bulkRemove: (ids: string[]) =>
      unwrap(api<ApiEnvelope<RolePermission[]>>('/role-permissions/bulk', {
        method: 'DELETE',
        body: { ids }
      }))
  }
}
