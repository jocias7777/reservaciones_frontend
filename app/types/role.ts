/** Roles. Fuente: `app/schemas/role_schema.py`. */

export interface Role {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at?: string
}

/** Usuarios resumidos que llegan con `expand: ['users']`. */
export interface RoleUserSummary {
  id: string
  email: string
  username: string | null
  is_active: boolean
}

export interface RoleWithRelations extends Role {
  users?: RoleUserSummary[]
}

/** `POST /roles` exige name y description (ver `RoleSchema.validate_create`). */
export interface CreateRolePayload {
  name: string
  description: string
}

/** `PUT /roles/:id` solo admite `name` y `description`; cualquier otro campo es rechazado. */
export interface UpdateRolePayload {
  name?: string
  description?: string
}
