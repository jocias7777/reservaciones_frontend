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
import type { User, UserWithRelations } from './user'

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

/**
 * Lo que se puede hacer EN UN MÓDULO (tabla `sa_actions`).
 *
 * `users.create` y `roles.create` son dos acciones distintas aunque compartan
 * código: cada una pertenece a su módulo. Antes una acción era un verbo suelto
 * y el permiso nacía al cruzarlo con un módulo, lo que hacía que el catálogo
 * prometiera combinaciones que ningún endpoint comprueba.
 */
export interface Action {
  id: string
  code: string
  name: string
  description?: string | null
  /** El módulo del que es. Es lo que reparte cada acción en su tarjeta. */
  permission_id: string
  /** `null` = sin categoría: la interfaz la agrupa aparte, pero se concede igual. */
  category_id?: string | null
  created_at?: string
  updated_at?: string
  // Solo presentes si se pidieron con `expand`.
  category?: Pick<ActionCategory, 'id' | 'name' | 'description' | 'icon'> | null
  permission?: Pick<PermissionModule, 'id' | 'code' | 'name' | 'description'> | null
}

/** `POST /actions` exige `code`, `name` y el módulo al que pertenece. */
export interface CreateActionPayload {
  code: string
  name: string
  permission_id: string
  description?: string | null
  category_id?: string | null
}

export interface UpdateActionPayload {
  code?: string
  name?: string
  description?: string | null
  category_id?: string | null
}

/**
 * Lo que un rol puede hacer: (rol, acción).
 *
 * El módulo no viaja en la fila porque lo sabe la acción.
 */
export interface RolePermission {
  id: string
  role_id: string
  action_id: string
  created_at: string
  updated_at?: string
  // Solo presentes si se pidieron con `expand`. `permission` se resuelve a
  // través de la acción.
  role?: Pick<Role, 'id' | 'name' | 'description'>
  permission?: Pick<PermissionModule, 'id' | 'code' | 'name' | 'description'>
  action?: Pick<Action, 'id' | 'code' | 'name' | 'permission_id'>
}

export interface CreateRolePermissionPayload {
  role_id: string
  action_id: string
}

export interface UserPermission {
  id: string
  user_id: string
  action_id: string
  is_grant: boolean
  created_at: string
  updated_at?: string
  user?: Pick<User, 'id' | 'email' | 'username' | 'is_active'>
  permission?: Pick<PermissionModule, 'id' | 'code' | 'name' | 'description'>
  action?: Pick<Action, 'id' | 'code' | 'name' | 'permission_id'>
}

export interface CreateUserPermissionPayload {
  user_id: string
  action_id: string
  is_grant: boolean
}

/**
 * `GET /user-permissions/by-user/:userId` — las excepciones del usuario, con
 * lo que su ROL concede ya resuelto del lado del servidor.
 *
 * Antes esto obligaba a pedir `role-permissions` aparte para pintar «Hereda»
 * en la matriz, y por lo tanto a tener ese permiso además de
 * `user_permissions`. Al venir `inherited` en la misma respuesta, con
 * `user_permissions:assign` alcanza para ver todo lo necesario.
 */
export interface UserPermissionMatrix {
  user_id: string
  /** `null` si el usuario no tiene rol, o si el que tenía fue dado de baja. */
  role: Pick<Role, 'id' | 'name'> | null
  /** Ids de acción que concede el rol. */
  inherited: string[]
  overrides: UserPermission[]
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

/** Un elemento de `PUT /user-permissions/bulk/update`: la excepción a cambiar, por su id. */
export type UserPermissionBulkUpdateItem = UpdateUserPermissionPayload & { id: string }

/**
 * Lo que devuelve guardar la matriz de un rol: cuántas combinaciones se
 * concedieron, cuántas se revocaron y con cuántas quedó el rol.
 */
export interface RolePermissionSyncResult {
  concedidas: number
  revocadas: number
  total: number
}

/**
 * Lo que devuelve guardar las excepciones de un usuario. `eliminadas` son las
 * que volvieron a heredar del rol; `actualizadas`, las que cambiaron de
 * conceder a revocar o al revés.
 */
export interface UserPermissionSyncResult {
  creadas: number
  actualizadas: number
  eliminadas: number
  total: number
}

/**
 * Todo lo necesario para DIBUJAR una matriz de permisos, en una sola respuesta.
 *
 * Los módulos son las filas, las acciones las columnas y las categorías los
 * bloques en los que se agrupan esas columnas. Antes se pedía cada catálogo a
 * su propio módulo, y cada uno exigía el `list` de ese módulo; ahora llega
 * junto desde `GET /role-permissions/catalog` y `GET /user-permissions/catalog`,
 * que piden `assign` —el mismo permiso que ya guarda la propia matriz—.
 */
export interface PermissionMatrixCatalog {
  modules: PermissionModule[]
  actions: Action[]
  /** Vacío si todavía no hay ninguna: la matriz cae en un solo bloque. */
  categories: ActionCategory[]
}

/** El catálogo de la matriz por rol: además, los roles del selector. */
export interface RolePermissionCatalog extends PermissionMatrixCatalog {
  roles: Role[]
}

/**
 * El catálogo de la matriz por usuario: además, las personas del selector, con
 * su rol y su perfil —de ahí salen el nombre y la foto con los que se las
 * reconoce, y de qué rol heredan—.
 */
export interface UserPermissionCatalog extends PermissionMatrixCatalog {
  users: UserWithRelations[]
}
