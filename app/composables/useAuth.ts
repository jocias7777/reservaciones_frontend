import type { LoginPayload, LoginResponse, MeResponse } from '~/types'

/**
 * Operaciones de sesión contra `/api/auth/*`.
 * El estado (tokens, usuario) vive en `useAuthSession`.
 */
export function useAuth() {
  const api = useApi()
  const session = useAuthSession()

  /**
   * `POST /auth/login`. `remember` decide si las cookies sobreviven al cierre
   * del navegador; se fija ANTES de guardar los tokens porque determina su
   * tiempo de vida.
   */
  async function login(payload: LoginPayload, remember = false) {
    session.remember.value = remember

    const response = await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: payload
    })

    session.setTokens(response)
    session.user.value = response.user

    return response.user
  }

  /** `GET /auth/me`. Refresca el usuario en memoria (tras un F5, por ejemplo). */
  async function fetchMe() {
    const me = await api<MeResponse>('/auth/me')
    session.user.value = me
    return me
  }

  /**
   * `POST /auth/logout`. Invalida el refresh token en el backend; la sesión
   * local se limpia aunque la llamada falle (el token de acceso puede haber
   * expirado y el usuario espera salir de todos modos).
   */
  async function logout() {
    try {
      if (session.refreshToken.value) {
        await api('/auth/logout', {
          method: 'POST',
          body: { refresh_token: session.refreshToken.value }
        })
      }
    } catch {
      // Sin ruido: la sesión se cierra igual en el cliente.
    } finally {
      session.clear()
      await navigateTo('/login')
    }
  }

  return {
    ...session,
    login,
    logout,
    fetchMe
  }
}
