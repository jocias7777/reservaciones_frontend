/** Endpoints de sesión: `app/main/routes.py` (POST /auth/login|refresh|logout, GET /auth/me). */

export interface LoginPayload {
  email: string
  password: string
}

/** Usuario tal y como lo devuelve `/auth/login`. */
export interface SessionUser {
  id: string
  email: string
  username: string | null
  /** Nombre del rol (no el id), o `null` si no tiene rol asignado. */
  role: string | null
  is_active?: boolean
}

/**
 * `POST /auth/login` responde sin envoltorio `{ data }`.
 *
 * El refresh token ya no viaja aquí (SEC-002): sale en una cookie httpOnly que
 * este código nunca lee, solo el navegador la reenvía.
 */
export interface LoginResponse {
  access_token: string
  user: SessionUser
}

/** `POST /auth/refresh` responde sin envoltorio `{ data }`. Mismo motivo. */
export interface RefreshResponse {
  access_token: string
}

/** `GET /auth/me` responde sin envoltorio `{ data }`. */
export type MeResponse = Required<Pick<SessionUser, 'id' | 'email' | 'username' | 'role' | 'is_active'>>

/**
 * `POST /auth/forgot-password` responde 200 con el MISMO mensaje exista o no la
 * cuenta (SEC-004): no hay campo que diga si se encontró, y no es un descuido —
 * es lo que impide usar el endpoint para averiguar qué correos están dados de
 * alta. La pantalla muestra `message` tal cual.
 */
export interface ForgotPasswordResponse {
  message: string
}

/**
 * `POST /auth/reset-password`. El `token` es el del enlace del correo, que llega
 * en el query string de `/reset-password` (lo arma el backend con
 * `PASSWORD_RESET_URL_BASE`).
 */
export interface ResetPasswordPayload {
  token: string
  password: string
}

export interface ResetPasswordResponse {
  message: string
}
