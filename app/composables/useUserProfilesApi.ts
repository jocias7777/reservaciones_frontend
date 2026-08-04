import type { ApiEnvelope, CreateUserProfilePayload, UserProfile, UserProfilePayload } from '~/types'

/**
 * `app/routes/user_profile_routes.py`.
 *
 * El recurso se identifica por `user_id` (la tabla no tiene id propio) y exige
 * los permisos del módulo `users`, no uno propio. La interfaz solo necesita
 * crear y actualizar: el perfil se lee embebido en `GET /users/:id`, y se borra
 * junto con el usuario.
 */
export function useUserProfilesApi() {
  const api = useApi()

  return {
    /** `POST /user-profiles`. */
    create: (payload: CreateUserProfilePayload) =>
      unwrap(api<ApiEnvelope<UserProfile>>('/user-profiles', { method: 'POST', body: payload })),

    /** `PUT /user-profiles/:userId`. */
    update: (userId: string, payload: UserProfilePayload) =>
      unwrap(api<ApiEnvelope<UserProfile>>(`/user-profiles/${userId}`, {
        method: 'PUT',
        body: payload
      }))
  }
}
