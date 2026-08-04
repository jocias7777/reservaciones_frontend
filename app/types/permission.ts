/**
 * Permisos, acciones y sus asignaciones.
 *
 * Modelo del backend (ver `app/models/` y `app/seeds.py`):
 *   Permission      -> un MÓDULO del sistema (`users`, `roles`, `permissions`, ...)
 *   Action          -> una ACCIÓN posible (`read`, `create`, `update`, ...)
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

/** Acción disponible (tabla `sa_actions`). */
export interface Action {
  id: string
  code: string
  name: string
  description?: string | null
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

export interface UpdateUserPermissionPayload {
  is_grant: boolean
}
