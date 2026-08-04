import type { AdvancedQuery, ApiEnvelope, PaginatedResult, PermissionModule } from '~/types'

/**
 * Módulos del sistema — `app/routes/permission_routes.py` (`/permissions`).
 *
 * En el backend la tabla es `sa_permissions`, pero cada fila representa un
 * MÓDULO (`users`, `roles`, ...). Aquí se llama "módulo" para que el nombre
 * coincida con lo que ve el usuario: los permisos como tal nacen al cruzar
 * módulo × acción en `role-permissions` / `user-permissions`.
 *
 * Solo lectura: el backend valida los permisos contra códigos fijos escritos en
 * el código, así que dar de alta módulos desde la interfaz no serviría de nada.
 */
export function useModulesApi() {
  const api = useApi()

  return {
    /** `GET /permissions` — lista completa; base de la matriz de permisos. */
    list: () => listOrEmpty(unwrap(api<ApiEnvelope<PermissionModule[]>>('/permissions'))),

    /** `QUERY /permissions` — búsqueda avanzada (sin expands). */
    query: (query: AdvancedQuery = {}) =>
      unwrap(api<ApiEnvelope<PaginatedResult<PermissionModule>>>('/permissions', {
        method: 'QUERY',
        body: query
      }))
  }
}
