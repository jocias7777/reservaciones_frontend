import type {
  ApiEnvelope,
  CreateRolePermissionPayload,
  RolePermission
} from '~/types'

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
     * `GET /role-permissions/by-role/:roleId` — todas las combinaciones
     * módulo × acción concedidas a un rol, sin papelera. Exige `assign`, no
     * `list`: ver una matriz de permisos no debería obligar a darle acceso a
     * la búsqueda avanzada sobre la tabla entera de asignaciones.
     *
     * Sin paginación de por medio —reemplaza al viejo `QUERY` recorrido
     * página a página— porque el propio backend ya devuelve el conjunto
     * completo: la matriz necesita todo para saber qué interruptores están
     * encendidos.
     */
    listByRole: (roleId: string) =>
      unwrap(api<ApiEnvelope<RolePermission[]>>(`/role-permissions/by-role/${roleId}`)),

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
