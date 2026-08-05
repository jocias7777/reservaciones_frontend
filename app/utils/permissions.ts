import type { Action, ActionCategory, PermissionModule } from '~/types'

/**
 * Presentación de la matriz de permisos: orden, agrupación e iconos.
 *
 * Nada de esto altera los datos: el backend es la fuente de verdad de qué
 * módulos, acciones y categorías existen. Aquí solo se decide cómo se ven y en
 * qué orden, con reservas razonables para códigos que aún no conocemos.
 */

/** Orden canónico de las acciones (el mismo de `app/seeds.py::ACTIONS`). */
const ACTION_ORDER = [
  'read',
  'create',
  'update',
  'delete',
  'export',
  'print',
  'bulk_delete',
  'hard_delete',
  'bulk_hard_delete'
] as const

/** Etiqueta corta para la interfaz (el `name` del backend es más largo). */
const ACTION_LABELS: Record<string, string> = {
  read: 'Leer',
  create: 'Crear',
  update: 'Actualizar',
  delete: 'Eliminar',
  export: 'Exportar',
  print: 'Imprimir',
  bulk_delete: 'Eliminar masivo',
  hard_delete: 'Eliminar permanente',
  bulk_hard_delete: 'Eliminar masivo permanente'
}

/** Qué implica cada acción, para el tooltip de ayuda. */
const ACTION_HINTS: Record<string, string> = {
  read: 'Ver el listado y el detalle de los registros.',
  create: 'Dar de alta nuevos registros.',
  update: 'Modificar registros existentes.',
  delete: 'Enviar un registro a la papelera (se puede recuperar).',
  export: 'Descargar los datos del módulo.',
  print: 'Generar la versión imprimible de los datos.',
  bulk_delete: 'Enviar varios registros a la papelera de una sola vez.',
  hard_delete: 'Borrar un registro de la base de datos. No se puede deshacer.',
  bulk_hard_delete: 'Borrar varios registros de la base de datos. No se puede deshacer.'
}

/** Acciones cuyo efecto no se puede revertir: se marcan visualmente. */
const IRREVERSIBLE_ACTIONS = new Set(['hard_delete', 'bulk_hard_delete'])

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

export function isIrreversibleAction(action: Action): boolean {
  return IRREVERSIBLE_ACTIONS.has(action.code)
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

/** Clave estable de una celda módulo × acción. */
export function permissionKey(moduleId: string, actionId: string): string {
  return `${moduleId}::${actionId}`
}

export function parsePermissionKey(key: string): { moduleId: string, actionId: string } {
  const [moduleId = '', actionId = ''] = key.split('::')
  return { moduleId, actionId }
}
