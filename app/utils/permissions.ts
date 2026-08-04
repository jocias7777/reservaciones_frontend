import type { Action, PermissionModule } from '~/types'

/**
 * Presentación de la matriz de permisos: orden, agrupación e iconos.
 *
 * Nada de esto altera los datos: el backend es la fuente de verdad de qué
 * módulos y acciones existen. Aquí solo se decide cómo se ven y en qué orden,
 * con reservas razonables para códigos que aún no conocemos.
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

type ActionGroupId = 'consulta' | 'gestion' | 'eliminacion'

interface ActionGroupMeta {
  id: ActionGroupId
  label: string
  description: string
  icon: string
}

/**
 * Las 9 acciones son muchas para leerlas de golpe, así que en la tarjeta de cada
 * módulo se muestran repartidas en tres bloques por lo que hacen.
 */
const ACTION_GROUPS: ActionGroupMeta[] = [
  {
    id: 'consulta',
    label: 'Consulta',
    description: 'Ver y extraer información',
    icon: 'i-lucide-eye'
  },
  {
    id: 'gestion',
    label: 'Gestión',
    description: 'Crear y modificar registros',
    icon: 'i-lucide-pencil'
  },
  {
    id: 'eliminacion',
    label: 'Eliminación',
    description: 'Quitar registros del sistema',
    icon: 'i-lucide-trash-2'
  }
]

const ACTION_GROUP_BY_CODE: Record<string, ActionGroupId> = {
  read: 'consulta',
  export: 'consulta',
  print: 'consulta',
  create: 'gestion',
  update: 'gestion',
  delete: 'eliminacion',
  bulk_delete: 'eliminacion',
  hard_delete: 'eliminacion',
  bulk_hard_delete: 'eliminacion'
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

export interface ActionGroup extends ActionGroupMeta {
  actions: Action[]
}

/** Reparte las acciones en los tres bloques, descartando los bloques vacíos. */
export function groupActions(actions: Action[]): ActionGroup[] {
  const sorted = sortActions(actions)

  return ACTION_GROUPS.map(group => ({
    ...group,
    actions: sorted.filter(action => (ACTION_GROUP_BY_CODE[action.code] ?? 'gestion') === group.id)
  })).filter(group => group.actions.length > 0)
}

/** Clave estable de una celda módulo × acción. */
export function permissionKey(moduleId: string, actionId: string): string {
  return `${moduleId}::${actionId}`
}

export function parsePermissionKey(key: string): { moduleId: string, actionId: string } {
  const [moduleId = '', actionId = ''] = key.split('::')
  return { moduleId, actionId }
}
