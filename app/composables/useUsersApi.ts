import type {
  AdvancedQuery,
  ApiEnvelope,
  CreateUserPayload,
  PaginatedResult,
  UpdateUserPayload,
  User,
  UserWithRelations
} from '~/types'

/**
 * `app/routes/user_routes.py` — todo requiere el permiso `users:<acción>`.
 *
 * Solo se exponen las operaciones que usa la interfaz. El backend también tiene
 * borrado definitivo (`/hard`), pero ninguna pantalla lo ofrece: desde la
 * interfaz siempre se borra en lógico para poder recuperar la cuenta.
 */
export function useUsersApi() {
  const api = useApi()

  return {
    /** `QUERY /users` — búsqueda avanzada. Expand disponible: `role`, `profile`. */
    query: (query: AdvancedQuery = {}) =>
      unwrap(api<ApiEnvelope<PaginatedResult<UserWithRelations>>>('/users', {
        method: 'QUERY',
        body: query
      })),

    /** `GET /users/:id` — incluye el perfil embebido. */
    get: (id: string) => unwrap(api<ApiEnvelope<UserWithRelations>>(`/users/${id}`)),

    /** `POST /users` — acepta el perfil anidado en `profile`. */
    create: (payload: CreateUserPayload) =>
      unwrap(api<ApiEnvelope<UserWithRelations>>('/users', { method: 'POST', body: payload })),

    /** `PUT /users/:id` — solo datos de la cuenta (el perfil va por `useUserProfilesApi`). */
    update: (id: string, payload: UpdateUserPayload) =>
      unwrap(api<ApiEnvelope<User>>(`/users/${id}`, { method: 'PUT', body: payload })),

    /** `DELETE /users/:id` — borrado lógico. */
    remove: (id: string) => unwrap(api<ApiEnvelope<User>>(`/users/${id}`, { method: 'DELETE' })),

    /** `DELETE /users/bulk` — borrado lógico masivo. */
    bulkRemove: (ids: string[]) =>
      unwrap(api<ApiEnvelope<User[]>>('/users/bulk', { method: 'DELETE', body: { ids } }))
  }
}
