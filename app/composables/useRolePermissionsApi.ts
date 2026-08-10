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
 *
 * Requiere permisos del módulo `role_permissions`, separado de `permissions`
 * (el catálogo de módulos) desde que se corrigió que quien administraba ese
 * catálogo podía de paso concederse cualquier permiso a sí mismo.
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

    /**
     * `POST /role-permissions/bulk/create` — concede varias combinaciones de una
     * sola vez.
     *
     * La matriz de permisos por rol puede cambiar decenas de celdas de una
     * sentada; antes de que existiera este endpoint eso era un `POST` por
     * celda. El backend valida el formato de todos los elementos antes de
     * tocar la base, pero un duplicado suelto no cancela el lote: sale
     * detallado en `errores` junto con lo que sí se guardó.
     */
    bulkCreate: (items: CreateRolePermissionPayload[]) =>
      bulkWrite<CreateRolePermissionPayload>(api, '/role-permissions/bulk/create', 'POST', items),

    /** `DELETE /role-permissions/bulk` — revoca varias combinaciones de una vez. */
    bulkRemove: (ids: string[]) =>
      unwrap(api<ApiEnvelope<RolePermission[]>>('/role-permissions/bulk', {
        method: 'DELETE',
        body: { ids }
      }))
  }
}
