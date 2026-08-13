import type {
  ApiEnvelope,
  CreateUserPermissionPayload,
  UserPermission,
  UserPermissionBulkUpdateItem,
  UserPermissionCatalog,
  UserPermissionSyncResult
} from '~/types'

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
    /**
     * `GET /user-permissions/by-user/:userId` — todas las excepciones activas
     * de un usuario, sin papelera. Exige `assign`, no `list`: editar las
     * excepciones de una persona no debería obligar a darle acceso a la
     * búsqueda avanzada sobre la tabla entera de excepciones.
     *
     * Sin paginación de por medio —reemplaza al viejo `QUERY` recorrido
     * página a página— porque el propio backend ya devuelve el conjunto
     * completo.
     */
    listByUser: (userId: string) =>
      unwrap(api<ApiEnvelope<UserPermission[]>>(`/user-permissions/by-user/${userId}`)),

    /**
     * `GET /user-permissions/catalog` — el gemelo del de rol: módulos,
     * acciones, categorías y las personas del selector, cada una con su rol y
     * su perfil. Exige `assign`, igual que `by-user`.
     *
     * Ver la nota de `useRolePermissionsApi.catalog`.
     */
    catalog: () => unwrap(api<ApiEnvelope<UserPermissionCatalog>>('/user-permissions/catalog')),

    /**
     * `PUT /user-permissions/by-user/:userId` — guarda la matriz entera: se
     * mandan las excepciones que deben quedar y el backend calcula la
     * diferencia. Lo que no va en la lista vuelve a heredar del rol.
     *
     * Exige `assign`, igual que leerla. Ver la nota de
     * `useRolePermissionsApi.syncByRole`: antes eran hasta tres llamadas
     * —crear, actualizar y borrar—, cada una con su permiso y ninguna atómica.
     */
    syncByUser: (userId: string, items: Array<Omit<CreateUserPermissionPayload, 'user_id'>>) =>
      unwrap(api<ApiEnvelope<UserPermissionSyncResult>>(`/user-permissions/by-user/${userId}`, {
        method: 'PUT',
        body: { items }
      })),

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
