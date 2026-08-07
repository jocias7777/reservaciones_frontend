/**
 * Qué permiso exige cada pantalla.
 *
 * El backend es la única fuente de verdad: cada endpoint lleva su
 * `@require_permission(modulo, accion)` y responde 403 cuando no toca. Esta
 * tabla no decide nada nuevo, solo dice de qué módulo depende cada pantalla para
 * poder preguntarlo ANTES de entrar, en vez de dejar llegar a una pantalla que
 * se llena de errores rojos en cuanto pide sus datos.
 *
 * La acción es siempre `list` porque todas estas pantallas abren mostrando un
 * listado o una matriz, y eso va por `QUERY`. `read` no basta: es el permiso de
 * la ficha suelta y del desplegable de un formulario.
 */
export interface RouteAccess {
  /** Prefijo de ruta. El orden importa: gana el primero que encaje. */
  prefix: string
  /** `code` del módulo en `sa_permissions`. */
  module: string
  action: string
}

/**
 * De la ruta más específica a la más general: `/roles/permisos` tiene que
 * resolverse contra `role_permissions` y no contra `roles` solo porque empiece
 * igual.
 */
export const ROUTE_ACCESS: RouteAccess[] = [
  { prefix: '/usuarios/permisos', module: 'user_permissions', action: 'list' },
  { prefix: '/roles/permisos', module: 'role_permissions', action: 'list' },
  { prefix: '/roles/modulos', module: 'permissions', action: 'list' },
  { prefix: '/roles/acciones', module: 'actions', action: 'list' },
  { prefix: '/roles/categorias', module: 'action_categories', action: 'list' },
  { prefix: '/usuarios', module: 'users', action: 'list' },
  { prefix: '/roles', module: 'roles', action: 'list' }
]

/** Qué exige una ruta, o `null` si no exige nada (login, sin-acceso, plantilla). */
export function accessForRoute(path: string): RouteAccess | null {
  return ROUTE_ACCESS.find(entry => path === entry.prefix || path.startsWith(`${entry.prefix}/`)) ?? null
}

/**
 * Dónde aterrizar al entrar, por orden de preferencia.
 *
 * No sirve el orden de `ROUTE_ACCESS`, que está puesto de más específico a más
 * general para resolver prefijos: dejaría a todo el mundo cayendo en «Permisos
 * por usuario». Este es el orden del menú, así que quien tenga todos los
 * permisos sigue entrando por Usuarios, como siempre.
 */
export const LANDING_ROUTES = [
  '/usuarios',
  '/roles',
  '/usuarios/permisos',
  '/roles/permisos',
  '/roles/modulos',
  '/roles/acciones',
  '/roles/categorias'
]

/** Los módulos que hay que consultar para saber qué puede ver alguien. */
export const GUARDED_MODULES = [...new Set(ROUTE_ACCESS.map(entry => entry.module))]

/**
 * Endpoint de cada módulo. El `code` del módulo y su ruta no siempre coinciden:
 * la tabla usa guion bajo (`action_categories`) y la URL guion (`/action-categories`).
 */
export const MODULE_ENDPOINTS: Record<string, string> = {
  users: '/users',
  roles: '/roles',
  permissions: '/permissions',
  actions: '/actions',
  action_categories: '/action-categories',
  role_permissions: '/role-permissions',
  user_permissions: '/user-permissions'
}

/** Clave con la que se recuerda un par módulo × acción ya consultado. */
export function accessKey(module: string, action: string): string {
  return `${module}::${action}`
}
