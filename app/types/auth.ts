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
