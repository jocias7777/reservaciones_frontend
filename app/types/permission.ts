/**
 * Permisos, acciones y sus asignaciones.
 *
 * Modelo del backend (ver `app/models/` y `app/seeds.py`):
 *   Permission      -> un MÓDULO del sistema (`users`, `roles`, `permissions`, ...)
 *   Action          -> una ACCIÓN posible (`read`, `create`, `update`, ...)
 *   ActionCategory  -> el bloque en el que se agrupan las acciones (Consulta, Gestión, ...)
 *   RolePermission  -> combinación rol × módulo × acción (el permiso efectivo del rol)
 *   UserPermission  -> excepción por usuario sobre la combinación módulo × acción
 *                      (`is_grant: true` concede, `false` revoca lo que da el rol)
 */

import type { Role } from './role'
import type { User } from './user'

/**
 * Un módulo del sistema. En el backend la tabla se llama `sa_permissions`; aquí
 * se nombra "módulo" porque es lo que representa en la interfaz.
 */
export interface PermissionModule {
  id: string
  code: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

/** `POST /permissions` exige `code` y `name`. */
export interface CreatePermissionModulePayload {
  code: string
  name: string
  description?: string | null
}

/**
 * Qué acciones comprueba de verdad cada módulo, por código:
 * `{ roles: ['read', 'create', ...], users: [...] }`.
 *
 * Lo devuelve `GET /permissions/available-actions`, y sale del registro que
 * llenan los propios decoradores del backend. Sirve para no ofrecer las nueve
 * acciones en todos los módulos: conceder una que ningún endpoint comprueba no
 * restringe nada, así que solo confunde.
 */
export type AvailableActions = Record<string, string[]>

/**
 * Categoría en la que se agrupan las acciones (tabla `sa_category_permissions`).
 *
 * Es lo que da título y descripción a cada bloque de la tarjeta de módulo
 * («Consulta · Ver y extraer información»).
 */
export interface ActionCategory {
  id: string
  name: string
  description: string | null
  /** Icono al estilo de Nuxt UI (`i-lucide-eye`). `null` = se usa uno neutro. */
  icon: string | null
  /**
   * Posición del bloque en la matriz de permisos, de menor a mayor.
   *
   * En el backend la columna se llama `sort_order` y no `order` porque ORDER es
   * palabra reservada en MySQL.
   */
  sort_order: number
  created_at: string
  updated_at: string
  /** Acciones que tiene dentro. Solo presente si se pidió con `expand`. */
  actions?: Pick<Action, 'id' | 'code' | 'name' | 'description'>[]
}

/**
 * `POST /action-categories` exige `name`. Si se omite `sort_order`, el backend
 * coloca la categoría al final.
 */
export interface CreateActionCategoryPayload {
  name: string
  description?: string | null
  icon?: string | null
  sort_order?: number
}

export interface UpdateActionCategoryPayload {
  name?: string
  description?: string | null
  icon?: string | null
  sort_order?: number
}

/** Acción disponible (tabla `sa_actions`). */
export interface Action {
  id: string
  code: string
  name: string
  description?: string | null
  /** `null` = sin categoría: la interfaz la agrupa aparte, pero se concede igual. */
  category_id?: string | null
  created_at?: string
  updated_at?: string
  // Solo presente si se pidió con `expand`.
  category?: Pick<ActionCategory, 'id' | 'name' | 'description' | 'icon'> | null
}

/** `POST /actions` exige `code` y `name`. */
export interface CreateActionPayload {
  code: string
  name: string
  description?: string | null
  category_id?: string | null
}

export interface UpdateActionPayload {
  code?: string
  name?: string
  description?: string | null
  category_id?: string | null
}

export interface RolePermission {
  id: string
  role_id: string
  permission_id: string
  action_id: string
  created_at: string
  updated_at?: string
  // Solo presentes si se pidieron con `expand`.
  role?: Pick<Role, 'id' | 'name' | 'description'>
  permission?: Pick<PermissionModule, 'id' | 'code' | 'name' | 'description'>
  action?: Pick<Action, 'id' | 'code' | 'name'>
}

export interface CreateRolePermissionPayload {
  role_id: string
  permission_id: string
  action_id: string
}

export interface UserPermission {
  id: string
  user_id: string
  permission_id: string
  action_id: string
  is_grant: boolean
  created_at: string
  updated_at?: string
  user?: Pick<User, 'id' | 'email' | 'username' | 'is_active'>
  permission?: Pick<PermissionModule, 'id' | 'code' | 'name' | 'description'>
  action?: Pick<Action, 'id' | 'code' | 'name'>
}

export interface CreateUserPermissionPayload {
  user_id: string
  permission_id: string
  action_id: string
  is_grant: boolean
}

/**
 * Los tres estados de una celda módulo × acción en los permisos de un usuario.
 *
 * Un interruptor solo sabe representar dos, y por eso no distingue "lo hereda de
 * su rol" de "se lo concedí a mano". Cada estado se corresponde con una situación
 * concreta de `sa_user_permissions`:
 *
 *   inherit -> no hay fila: manda lo que diga el rol
 *   grant   -> fila con `is_grant = true`:  puede, aunque el rol no lo dé
 *   deny    -> fila con `is_grant = false`: no puede, aunque el rol sí lo dé
 */
export type OverrideState = 'inherit' | 'grant' | 'deny'

export interface UpdateUserPermissionPayload {
  is_grant: boolean
}
