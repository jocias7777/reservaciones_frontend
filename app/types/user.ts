/**
 * Usuarios y perfiles.
 * Fuente: `app/schemas/user_schema.py` y `app/schemas/user_profile_schema.py`.
 */

import type { Role } from './role'

/** Columnas del perfil (tabla `sa_user_profiles`). */
export interface UserProfile {
  user_id: string
  name: string | null
  last_name: string | null
  phone: string | null
  address: string | null
  /** ISO date (`YYYY-MM-DD`). */
  date_of_birth: string | null
  age: number | null
  foto_url: string | null
  created_at?: string
  updated_at?: string
}

/** Perfil embebido dentro de un usuario (no trae `user_id` en `GET /users/:id`). */
export type EmbeddedUserProfile = Omit<UserProfile, 'user_id' | 'created_at' | 'updated_at'>
  & Partial<Pick<UserProfile, 'user_id'>>

export interface User {
  id: string
  email: string
  username: string | null
  is_active: boolean
  role_id: string | null
  created_at: string
  updated_at: string
}

/** Usuario con las relaciones que pueden llegar vía `expand`. */
export interface UserWithRelations extends User {
  role?: Pick<Role, 'id' | 'name' | 'description'> | null
  profile?: EmbeddedUserProfile | null
}

export interface UserProfilePayload {
  name?: string | null
  last_name?: string | null
  phone?: string | null
  address?: string | null
  date_of_birth?: string | null
  age?: number | null
  foto_url?: string | null
}

/** `POST /users` acepta el perfil anidado (ver `UserService.create_user`). */
export interface CreateUserPayload {
  email: string
  password: string
  username?: string | null
  role_id?: string | null
  is_active?: boolean
  profile?: UserProfilePayload
}

/** `PUT /users/:id` solo acepta campos de la cuenta; el perfil va por su propio endpoint. */
export interface UpdateUserPayload {
  email?: string
  username?: string | null
  password?: string
  role_id?: string | null
  is_active?: boolean
}

/** `POST /user-profiles` exige `user_id`. */
export interface CreateUserProfilePayload extends UserProfilePayload {
  user_id: string
}

/**
 * Lo que emite el formulario de usuario. La cuenta y el perfil van separados
 * porque el backend los guarda por endpoints distintos al editar (`PUT /users/:id`
 * solo acepta campos de la cuenta).
 */
export interface UserFormPayload {
  account: {
    email: string
    username: string | null
    /** Ausente al editar si no se cambió la contraseña. */
    password?: string
    role_id: string | null
    is_active: boolean
  }
  profile: UserProfilePayload
  /** `false` si el usuario no llenó ningún campo del perfil. */
  hasProfile: boolean
}
