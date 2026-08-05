import type { Action, PermissionModule } from '~/types'

export interface UsePermissionMatrixOptions {
  modules: MaybeRefOrGetter<PermissionModule[]>
  actions: MaybeRefOrGetter<Action[]>
}

/**
 * Estado de la matriz módulo × acción.
 *
 * Trabaja con claves `moduleId::actionId` y mantiene dos conjuntos: el que llegó
 * del servidor (`baseline`) y el que el usuario está editando (`draft`). La
 * diferencia entre ambos es exactamente lo que hay que guardar, así que no hace
 * falta llamar a la API en cada interruptor.
 *
 * Sirve igual para roles (permisos del rol) y para usuarios (permiso efectivo,
 * del que luego se derivan las excepciones).
 */
export function usePermissionMatrix(options: UsePermissionMatrixOptions) {
  const modules = computed(() => toValue(options.modules))
  const actions = computed(() => sortActions(toValue(options.actions)))

  const baseline = ref<Set<string>>(new Set())
  const draft = ref<Set<string>>(new Set())

  /** Fija el estado que llegó del servidor y descarta cualquier edición. */
  function setBaseline(keys: Iterable<string>) {
    baseline.value = new Set(keys)
    draft.value = new Set(baseline.value)
  }

  const isEnabled = (key: string) => draft.value.has(key)

  function set(key: string, enabled: boolean) {
    const next = new Set(draft.value)
    if (enabled) {
      next.add(key)
    } else {
      next.delete(key)
    }
    draft.value = next
  }

  /** Todas las claves posibles de la matriz, en orden de módulo y acción. */
  const allKeys = computed(() =>
    modules.value.flatMap(module => actions.value.map(action => permissionKey(module.id, action.id)))
  )

  function keysOfModule(moduleId: string) {
    return actions.value.map(action => permissionKey(moduleId, action.id))
  }

  /** Enciende o apaga todas las acciones de un módulo. */
  function setModule(moduleId: string, enabled: boolean) {
    const next = new Set(draft.value)
    for (const key of keysOfModule(moduleId)) {
      if (enabled) {
        next.add(key)
      } else {
        next.delete(key)
      }
    }
    draft.value = next
  }

  /** Enciende o apaga la matriz completa. */
  function setAll(enabled: boolean) {
    draft.value = enabled ? new Set(allKeys.value) : new Set()
  }

  const total = computed(() => allKeys.value.length)
  const activeCount = computed(() => allKeys.value.filter(key => draft.value.has(key)).length)
  const allSelected = computed(() => total.value > 0 && activeCount.value === total.value)

  /** Claves que hay que conceder al guardar. */
  const added = computed(() => [...draft.value].filter(key => !baseline.value.has(key)))
  /** Claves que hay que revocar al guardar. */
  const removed = computed(() => [...baseline.value].filter(key => !draft.value.has(key)))
  const changeCount = computed(() => added.value.length + removed.value.length)
  const isDirty = computed(() => changeCount.value > 0)

  /** Descarta los cambios y vuelve a lo que hay guardado. */
  function reset() {
    draft.value = new Set(baseline.value)
  }

  /**
   * Reparte un conjunto de claves en el formato que consumen las tarjetas:
   * `{ [moduleId]: { [actionId]: boolean } }`.
   */
  function toModuleValues(keys: Set<string>): Record<string, Record<string, boolean>> {
    const result: Record<string, Record<string, boolean>> = {}

    for (const module of modules.value) {
      const porAccion: Record<string, boolean> = {}
      for (const action of actions.value) {
        porAccion[action.id] = keys.has(permissionKey(module.id, action.id))
      }
      result[module.id] = porAccion
    }

    return result
  }

  /** Estado actual de la matriz, listo para las tarjetas de módulo. */
  const valuesByModule = computed(() => toModuleValues(draft.value))

  return {
    modules,
    actions,
    draft,
    total,
    activeCount,
    allSelected,
    added,
    removed,
    changeCount,
    isDirty,
    isEnabled,
    valuesByModule,
    toModuleValues,
    set,
    setModule,
    setAll,
    setBaseline,
    reset
  }
}
