import type { Action, ActionCategory, OverrideState, PermissionModule } from '~/types'

/**
 * Presentación de la matriz de permisos: orden, agrupación e iconos.
 *
 * Nada de esto altera los datos: el backend es la fuente de verdad de qué
 * módulos, acciones y categorías existen. Aquí solo se decide cómo se ven y en
 * qué orden, con reservas razonables para códigos que aún no conocemos.
 */

/**
 * Orden canónico de las acciones.
 *
 * No es el orden de declaración de `app/seeds.py::ACTIONS`: aquí cada acción
 * masiva va justo detrás de su versión singular (`create`, `bulk_create`),
 * porque es como se leen mejor en la matriz. El orden de alta en la base no
 * tiene por qué ser el de lectura en la pantalla.
 */
const ACTION_ORDER = [
  'read',
  'list',
  'select',
  'assign',
  // Justo detrás de `assign` porque es su versión sin límites: quien lee la
  // matriz encuentra las dos juntas y ve que son cosas distintas.
  'grant_any',
  'create',
  'bulk_create',
  'update',
  'bulk_update',
  'delete',
  'bulk_delete',
  'export',
  'print',
  'hard_delete',
  'bulk_hard_delete',
  'restore',
  'bulk_restore'
] as const

/** Etiqueta corta para la interfaz (el `name` del backend es más largo). */
const ACTION_LABELS: Record<string, string> = {
  read: 'Leer',
  list: 'Listar',
  select: 'Seleccionar',
  assign: 'Asignar permisos',
  grant_any: 'Delegar sin límite',
  create: 'Crear',
  bulk_create: 'Crear masivo',
  update: 'Actualizar',
  bulk_update: 'Actualizar masivo',
  delete: 'Eliminar',
  export: 'Exportar',
  print: 'Imprimir',
  bulk_delete: 'Eliminar masivo',
  hard_delete: 'Eliminar permanente',
  bulk_hard_delete: 'Eliminar masivo permanente',
  restore: 'Restaurar',
  bulk_restore: 'Restaurar masivo'
}

/** Qué implica cada acción, para el tooltip de ayuda. */
const ACTION_HINTS: Record<string, string> = {
  // `read`, `list` y `select` se separan a propósito en el backend: se puede
  // dejar que alguien rellene formularios sin darle acceso a explorar la tabla
  // entera. `read` ya no cubre los desplegables —eso es cosa de `select`—,
  // así que si esto se guarda sin la otra, un formulario se queda sin opciones.
  read: 'Ver la ficha de un registro concreto.',
  list: 'Ver el listado del módulo y buscar dentro de él.',
  select: 'Elegirlo en los desplegables de un formulario, sin ver el listado completo.',
  assign: 'Ver y editar la matriz de permisos de un rol, o las excepciones de un usuario, sin acceso a la búsqueda avanzada sobre esa tabla.',
  // `assign` por sí sola solo deja repartir lo que uno ya tiene, y nunca sobre
  // el propio rol/usuario ni sobre superadmin. Esta acción levanta esos tres
  // límites de golpe (ver `app/services/permission_delegation_policy.py`), así
  // que el tooltip tiene que decirlo: quien la concede está repartiendo la
  // capacidad de repartir cualquier cosa.
  grant_any: 'Conceder cualquier acción del catálogo, incluidas las que uno mismo no tiene, y sobre cualquier rol o usuario. Sin ella solo se puede delegar lo que ya se posee.',
  create: 'Dar de alta nuevos registros.',
  bulk_create: 'Dar de alta varios registros de una sola vez, por lote.',
  update: 'Modificar registros existentes.',
  bulk_update: 'Modificar varios registros de una sola vez, por lote.',
  delete: 'Enviar un registro a la papelera (se puede recuperar).',
  export: 'Descargar los datos del módulo.',
  print: 'Generar la versión imprimible de los datos.',
  bulk_delete: 'Enviar varios registros a la papelera de una sola vez.',
  hard_delete: 'Borrar un registro de la base de datos. No se puede deshacer.',
  bulk_hard_delete: 'Borrar varios registros de la base de datos. No se puede deshacer.',
  restore: 'Recuperar un registro que estaba en la papelera.',
  bulk_restore: 'Recuperar varios registros de la papelera de una sola vez.'
}

/**
 * Acciones que se marcan en rojo, con el motivo por el que se marcan.
 *
 * No todas lo son por lo mismo, y el aviso no puede decir «Acción irreversible»
 * para todas: `grant_any` se deshace quitándola, lo que la hace delicada es que
 * levanta los tres límites de la delegación (no concederse a uno mismo, no
 * repartir lo que no se tiene, no tocar superadmin — ver
 * `app/services/permission_delegation_policy.py`). Cada una lleva su texto, que
 * es además el que oye un lector de pantalla.
 */
const ACTION_WARNINGS: Record<string, string> = {
  hard_delete: 'Acción irreversible',
  bulk_hard_delete: 'Acción irreversible',
  grant_any: 'Concede autoridad sin límite'
}

/**
 * Las acciones son muchas para leerlas de golpe, así que en la tarjeta de cada
 * módulo se muestran repartidas en bloques por lo que hacen. Esos bloques son
 * las categorías de `sa_category_permissions`, y todo lo suyo —título,
 * descripción, icono y orden— sale de la base de datos y se administra desde
 * `/roles/categorias`. Aquí solo queda el valor por defecto de una categoría a
 * la que todavía no se le haya elegido icono.
 */

interface ActionGroupMeta {
  /** Id de la categoría, o cadena vacía para el bloque «sin categoría». */
  id: string
  label: string
  description: string
  icon: string
}

/** Icono de una categoría sin icono elegido, y del bloque «sin categoría». */
export const DEFAULT_CATEGORY_ICON = 'i-lucide-shapes'

/** Bloque de las acciones que no tienen categoría asignada. */
const UNCATEGORIZED: ActionGroupMeta = {
  id: '',
  label: 'Otras acciones',
  description: 'Sin categoría asignada',
  icon: DEFAULT_CATEGORY_ICON
}

export function categoryIcon(category: Pick<ActionCategory, 'icon'>): string {
  return category.icon || DEFAULT_CATEGORY_ICON
}

/** Iconos por módulo conocido; el resto usa uno neutro. */
const MODULE_ICONS: Record<string, string> = {
  users: 'i-lucide-users',
  roles: 'i-lucide-shield',
  permissions: 'i-lucide-key-round',
  role_permissions: 'i-lucide-shield-check',
  user_permissions: 'i-lucide-user-round',
  reservations: 'i-lucide-calendar'
}

export function moduleIcon(module: Pick<PermissionModule, 'code'>): string {
  return MODULE_ICONS[module.code] ?? 'i-lucide-box'
}

export function actionLabel(action: Action): string {
  return ACTION_LABELS[action.code] ?? action.name
}

export function actionHint(action: Action): string | undefined {
  return ACTION_HINTS[action.code] ?? action.description ?? undefined
}

/**
 * El aviso de una acción delicada, o `undefined` si no lo necesita. Vale a la
 * vez de condición para pintar la señal y de texto para el lector de pantalla.
 */
export function actionWarning(action: Action): string | undefined {
  return ACTION_WARNINGS[action.code]
}

/** Ordena las acciones según `ACTION_ORDER`; las desconocidas van al final. */
export function sortActions(actions: Action[]): Action[] {
  const weight = (code: string) => {
    const index = ACTION_ORDER.indexOf(code as (typeof ACTION_ORDER)[number])
    return index === -1 ? ACTION_ORDER.length : index
  }

  return [...actions].sort((a, b) => weight(a.code) - weight(b.code) || a.code.localeCompare(b.code))
}

/**
 * Ordena las categorías por el orden configurado en cada una.
 *
 * El nombre desempata: dos categorías pueden compartir `sort_order` (nada lo
 * impide en la tabla) y sin desempate quedarían en un orden imprevisible.
 */
export function sortCategories(categories: ActionCategory[]): ActionCategory[] {
  return [...categories].sort((a, b) =>
    a.sort_order - b.sort_order || a.name.localeCompare(b.name)
  )
}

export interface ActionGroup extends ActionGroupMeta {
  actions: Action[]
}

/**
 * Reparte las acciones en un bloque por categoría.
 *
 * Sale un bloque por cada categoría que exista, AUNQUE todavía no tenga
 * acciones: si alguien da de alta una categoría, tiene que verla aparecer donde
 * se usan, no quedarse dudando si se guardó. Los bloques vacíos se marcan como
 * tales en la tarjeta.
 *
 * Las acciones sin categoría —o con una categoría que ya no existe— no se
 * pierden: caen en un bloque «Otras acciones» al final, que sí desaparece cuando
 * no hay ninguna, porque ese bloque no lo creó nadie. Si no llegan categorías
 * (por ejemplo, porque la cuenta no puede leerlas) todo queda ahí, que es
 * exactamente la lista completa sin agrupar.
 */
export function groupActions(actions: Action[], categories: ActionCategory[] = []): ActionGroup[] {
  const sorted = sortActions(actions)
  const known = new Set(categories.map(category => category.id))

  const groups: ActionGroup[] = sortCategories(categories).map(category => ({
    id: category.id,
    label: category.name,
    description: category.description ?? '',
    icon: categoryIcon(category),
    actions: sorted.filter(action => action.category_id === category.id)
  }))

  const orphans = sorted.filter(action => !action.category_id || !known.has(action.category_id))
  if (orphans.length) {
    groups.push({ ...UNCATEGORIZED, actions: orphans })
  }

  return groups
}

/**
 * Qué puede hacer de verdad un usuario en una celda.
 *
 * Es la misma regla que aplica el backend en `require_permission`: si hay
 * excepción, manda la excepción; si no, manda el rol. Se escribe una sola vez
 * porque la usan tanto el estado de la pantalla como la tarjeta que la pinta, y
 * si las dos versiones se separaran, lo que se ve dejaría de ser lo que pasa.
 */
export function resolveEffective(state: OverrideState, inherited: boolean): boolean {
  if (state === 'grant') return true
  if (state === 'deny') return false
  return inherited
}

/**
 * El mensaje de un error del backend, con los ids de acción que cite traducidos
 * a «Módulo · Acción».
 *
 * Al guardar una matriz, la política de delegación puede responder 403 diciendo
 * qué acciones no se pueden repartir, y las nombra por id
 * (`app/services/permission_delegation_policy.py::_mensaje_de_mas`), que es lo
 * único que maneja por dentro. Mostrado tal cual, el aviso es una fila de UUIDs
 * que no le dice nada a nadie —justo cuando hace falta saber qué celda hay que
 * desmarcar—; estas pantallas sí tienen el catálogo cargado, así que pueden
 * volverlos legibles.
 *
 * Se sustituye por coincidencia literal del id, sin dar por hecho su formato, y
 * lo que no esté en el catálogo se deja intacto: un mensaje traducido a medias
 * sigue siendo mejor que ninguno.
 */
export function describeActionIds(
  message: string,
  actions: Action[],
  modules: PermissionModule[]
): string {
  const moduleNames = new Map(modules.map(module => [module.id, module.name]))

  return actions.reduce((text, action) => {
    if (!text.includes(action.id)) return text

    const moduleName = moduleNames.get(action.permission_id)
    const label = moduleName ? `${moduleName} · ${actionLabel(action)}` : actionLabel(action)

    return text.split(action.id).join(label)
  }, message)
}

/**
 * Coincidencias del buscador de las pantallas de permisos.
 *
 * Se busca por lo que se ve —el nombre del módulo y la etiqueta corta de la
 * acción— y además por el código del módulo, que es lo que se conoce cuando uno
 * viene del backend. Una consulta vacía no filtra nada.
 */
export function moduleMatchesQuery(module: Pick<PermissionModule, 'name' | 'code'>, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  return module.name.toLowerCase().includes(needle) || module.code.toLowerCase().includes(needle)
}

export function actionMatchesQuery(action: Action, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  return actionLabel(action).toLowerCase().includes(needle)
}

/**
 * Las acciones de un módulo, ya agrupadas por categoría.
 *
 * Cada acción pertenece a un módulo, así que la matriz no es un producto de
 * módulos por acciones: es cada módulo con las suyas. Antes se cruzaban todas
 * con todos y salían combinaciones que ningún endpoint comprobaba.
 */
export function actionsOfModule(actions: Action[], moduleId: string): Action[] {
  return actions.filter(action => action.permission_id === moduleId)
}
