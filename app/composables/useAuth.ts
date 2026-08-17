import type {
  ForgotPasswordResponse,
  LoginPayload,
  LoginResponse,
  MeResponse,
  ResetPasswordPayload,
  ResetPasswordResponse
} from '~/types'

/**
 * Operaciones de sesión contra `/api/auth/*`.
 * El estado (tokens, usuario) vive en `useAuthSession`.
 */
export function useAuth() {
  const api = useApi()
  const session = useAuthSession()
  const access = useAccessControl()

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

    // Los permisos son de quien acaba de entrar, no de quien estuviera antes en
    // este navegador.
    access.reset()

    return response.user
  }

  /** `GET /auth/me`. Refresca el usuario en memoria (tras un F5, por ejemplo). */
  async function fetchMe() {
    const me = await api<MeResponse>('/auth/me')
    session.user.value = me
    return me
  }

  /**
   * `POST /auth/logout`. El backend lee el refresh token de su cookie
   * httpOnly (ya no se manda en el cuerpo, SEC-002) y lo invalida; la sesión
   * local se limpia aunque la llamada falle (el token de acceso puede haber
   * expirado y el usuario espera salir de todos modos).
   */
  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      // Sin ruido: la sesión se cierra igual en el cliente.
    } finally {
      session.clear()
      access.reset()
      await navigateTo('/login')
    }
  }

  /**
   * `POST /auth/forgot-password`. Pide el correo con el enlace de recuperación.
   *
   * El backend responde SIEMPRE lo mismo —«Si la cuenta existe, se envió un
   * correo…»— exista o no la cuenta, a propósito: distinguirlo dejaría usar esta
   * pantalla para averiguar qué correos están registrados (SEC-004). Así que
   * esto no devuelve «se encontró» ni nada parecido, y la pantalla tampoco puede
   * inventárselo: se muestra su mensaje tal cual.
   *
   * No pasa por `session`: se llama sin haber entrado.
   */
  async function forgotPassword(email: string) {
    const response = await api<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: { email }
    })

    return response.message
  }

  /**
   * `POST /auth/reset-password`. Consume el token del enlace y fija la
   * contraseña nueva.
   *
   * Además de cambiarla, el backend invalida TODOS los refresh tokens de esa
   * cuenta (`app/services/password_reset.py`): una sesión que siguiera abierta
   * con la contraseña vieja deja de poder renovarse. Por eso se limpia también
   * la sesión local — si quien restablece es el mismo que estaba dentro, su
   * access token todavía valdría un rato y se quedaría en un estado a medias.
   */
  async function resetPassword(payload: ResetPasswordPayload) {
    const response = await api<ResetPasswordResponse>('/auth/reset-password', {
      method: 'POST',
      body: payload
    })

    session.clear()
    access.reset()

    return response.message
  }

  return {
    ...session,
    login,
    logout,
    fetchMe,
    forgotPassword,
    resetPassword
  }
}
