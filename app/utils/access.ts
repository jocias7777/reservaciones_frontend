/**
 * Qué permiso exige cada pantalla.
 *
 * El backend es la única fuente de verdad: cada endpoint lleva su
 * `@require_permission(modulo, accion)` y responde 403 cuando no toca. Esta
 * tabla no decide nada nuevo, solo dice de qué módulo depende cada pantalla para
 * poder preguntarlo ANTES de entrar, en vez de dejar llegar a una pantalla que
 * se llena de errores rojos en cuanto pide sus datos.
 *
 * Casi siempre la acción es `list`, porque estas pantallas abren mostrando un
 * listado o una matriz, y eso va por `QUERY`. `read` no basta: es el permiso de
 * la ficha suelta y del desplegable de un formulario. Las excepciones son los
 * formularios de alta, que piden `create`; las papeleras, que piden `restore`
 * —`bulk_restore` se prueba también (ver `RESTORABLE_MODULES`), pero solo para
 * el botón de "Restaurar masivo" *dentro* de la papelera, no para decidir si
 * se entra a ella—; y las matrices de permisos por rol y por usuario, que
 * piden `assign`: `GET .../by-role/:id` y `GET .../by-user/:id` lo exigen así
 * a propósito, para poder ver y editar esas dos matrices sin tener que dar
 * además `list`, que es acceso a la búsqueda avanzada sobre la tabla entera de
 * asignaciones.
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
  // `assign`, no `list`: son las matrices, no la búsqueda avanzada sobre la
  // tabla de asignaciones/excepciones (ver la nota de arriba).
  { prefix: '/usuarios/permisos', module: 'user_permissions', action: 'assign' },
  { prefix: '/roles/permisos', module: 'role_permissions', action: 'assign' },
  { prefix: '/roles/modulos', module: 'permissions', action: 'list' },
  // Las papeleras piden `restore`, no `list`; los formularios de alta piden
  // `create`. Ambas van antes que el listado del que cuelgan porque, si no,
  // "gana el primero que encaje" las mandaría al permiso del listado.
  { prefix: '/roles/acciones/papelera', module: 'actions', action: 'restore' },
  { prefix: '/roles/acciones/nueva', module: 'actions', action: 'create' },
  { prefix: '/roles/acciones', module: 'actions', action: 'list' },
  { prefix: '/roles/categorias/papelera', module: 'action_categories', action: 'restore' },
  { prefix: '/roles/categorias/nueva', module: 'action_categories', action: 'create' },
  { prefix: '/roles/categorias', module: 'action_categories', action: 'list' },
  { prefix: '/usuarios/papelera', module: 'users', action: 'restore' },
  { prefix: '/usuarios/nuevo', module: 'users', action: 'create' },
  { prefix: '/usuarios', module: 'users', action: 'list' },
  { prefix: '/roles/papelera', module: 'roles', action: 'restore' },
  { prefix: '/roles/nuevo', module: 'roles', action: 'create' },
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

/** Los módulos de las entradas de `ROUTE_ACCESS` que pidan `action`, sin repetidos. */
function modulesRequiring(action: string): string[] {
  return [...new Set(ROUTE_ACCESS.filter(entry => entry.action === action).map(entry => entry.module))]
}

/**
 * Módulos con papelera en la interfaz: los únicos donde hace falta saber si
 * se puede `restore` (para entrar y para el botón de cada fila) y
 * `bulk_restore` (solo para el botón de "Restaurar masivo" de dentro).
 *
 * Sale de `ROUTE_ACCESS` en vez de escribirse aparte: son exactamente los
 * módulos que ya declaran una ruta de papelera ahí arriba, así que mantener
 * una segunda lista a mano solo daría pie a que se desincronizaran. Si el día
 * de mañana se agrega la papelera a un módulo nuevo, basta con darle su fila
 * en `ROUTE_ACCESS` (como las demás) para que quede cubierto aquí también, sin
 * tocar nada más.
 */
export const RESTORABLE_MODULES = modulesRequiring('restore')

/**
 * Módulos con un listado y un formulario completos en la interfaz: los únicos
 * donde hace falta saber si se puede `create`/`update`/`delete`/`bulk_delete`,
 * además de `list`.
 *
 * También sale de `ROUTE_ACCESS`, y no se escribe aparte por la misma razón
 * que `RESTORABLE_MODULES`: se apoya en que todo listado con estos botones
 * también tiene su formulario de alta (`/módulo/nuevo`, con acción `create`) —
 * y esa ruta hay que declararla igual para que el propio formulario quede
 * protegido. Un módulo nuevo con estos botones queda cubierto en cuanto se le
 * da esa fila, sin tocar esta constante.
 */
export const MANAGED_MODULES = modulesRequiring('create')

/**
 * Módulos con una matriz de permisos por rol o por usuario en la interfaz:
 * los únicos donde hace falta saber si se puede `assign`.
 *
 * Igual que `RESTORABLE_MODULES` y `MANAGED_MODULES`, sale de `ROUTE_ACCESS`
 * en vez de escribirse aparte.
 */
export const ASSIGNABLE_MODULES = modulesRequiring('assign')

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

/** De dónde salieron los permisos que hay en memoria. */
export type AccessSource = 'declared' | 'probed'

/**
 * El estado de permisos ya resuelto, tal como lo guarda `useAccessControl` en
 * sus tres `useState`. Se pasa como objeto plano a las funciones de abajo para
 * que la decisión sea pura —nada de Nuxt, nada de red— y se pueda probar sin
 * levantar toda la aplicación.
 */
export interface AccessState {
  /** `{ 'users::list': true, 'roles::restore': false, ... }` */
  granted: Record<string, boolean>
  loaded: boolean
  source: AccessSource | null
}

/**
 * Si el usuario puede hacer algo, a partir del estado ya resuelto.
 *
 * Cuando los permisos los publica el backend (`source === 'declared'`) se sabe
 * de todas las acciones, y lo que no aparece en `granted` es que no lo tiene.
 * Deduciéndolos por sondeo solo se averigua lo que de verdad se probó (ver
 * `useAccessControl.probeAll`): de lo que no se probó no se sabe nada, así que
 * se concede y el backend responderá 403 si no tocaba.
 * Antes de haber preguntado (`!loaded`) se concede también, para que el menú
 * no parpadee escondiendo apartados que sí se tienen.
 */
export function resolveCan(state: AccessState, module: string, action: string): boolean {
  if (!state.loaded) return true

  const key = accessKey(module, action)
  if (key in state.granted) return state.granted[key]!

  return state.source !== 'declared'
}

/** Si se puede abrir una ruta concreta, a partir del estado ya resuelto. */
export function resolveCanVisit(state: AccessState, path: string): boolean {
  const required = accessForRoute(path)
  return required ? resolveCan(state, required.module, required.action) : true
}
