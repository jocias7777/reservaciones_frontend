import type { Action, PermissionModule } from '~/types'

export interface UsePermissionMatrixOptions {
  modules: MaybeRefOrGetter<PermissionModule[]>
  actions: MaybeRefOrGetter<Action[]>
}

/**
 * Estado de la matriz de permisos de un rol.
 *
 * La clave de una celda es el id de la acción, y nada más: cada acción ya
 * pertenece a un módulo, así que decir «esta acción» es decir «esto en aquel
 * módulo». Antes la clave era el par `moduleId::actionId` porque la acción era
 * un verbo suelto que se cruzaba con cualquier módulo, y de ahí salían
 * combinaciones que ningún endpoint comprobaba.
 *
 * Se mantienen dos conjuntos: el que llegó del servidor (`baseline`) y el que
 * el usuario está editando (`draft`). La diferencia entre ambos es lo que hay
 * sin guardar, así que no hace falta llamar a la API en cada interruptor.
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

  /** Las acciones de cada módulo, que es como se pinta y se cuenta la matriz. */
  const actionsByModule = computed(() =>
    Object.fromEntries(
      modules.value.map(module => [module.id, actionsOfModule(actions.value, module.id)])
    )
  )

  /**
   * Todas las celdas de la matriz, en orden de módulo y acción.
   *
   * No es el producto de módulos por acciones: es la suma de las acciones de
   * cada módulo. Una acción huérfana —de un módulo que no está en la lista— no
   * entra, igual que antes no entraba una combinación imposible.
   */
  const allKeys = computed(() =>
    modules.value.flatMap(module => (actionsByModule.value[module.id] ?? []).map(action => action.id))
  )

  /** Enciende o apaga todas las acciones de un módulo. */
  function setModule(moduleId: string, enabled: boolean) {
    const next = new Set(draft.value)
    for (const action of actionsByModule.value[moduleId] ?? []) {
      if (enabled) {
        next.add(action.id)
      } else {
        next.delete(action.id)
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

  /**
   * Todas las acciones encendidas ahora mismo, en el orden de la matriz.
   *
   * Es lo que se manda al guardar: el conjunto que debe quedar, no la
   * diferencia. Va ordenado y no como `[...draft]` porque el orden de un Set es
   * el de inserción —o sea, el orden en que se fueron tocando los
   * interruptores—, y eso hacía ilegible el cuerpo de la petición.
   */
  const enabledKeys = computed(() => allKeys.value.filter(key => draft.value.has(key)))

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
   * El mensaje de un error de guardado, listo para mostrar.
   *
   * Vive aquí y no en la pantalla porque lo que hace falta para traducirlo —el
   * catálogo de módulos y acciones— ya está aquí. Ver `describeActionIds`: los
   * 403 de la política de delegación citan las acciones por id.
   */
  function describeError(error: unknown): string {
    return describeActionIds(apiErrorMessage(error), actions.value, modules.value)
  }

  /**
   * Reparte un conjunto de claves en el formato que consumen las tarjetas:
   * `{ [moduleId]: { [actionId]: boolean } }`.
   */
  function toModuleValues(keys: Set<string>): Record<string, Record<string, boolean>> {
    const result: Record<string, Record<string, boolean>> = {}

    for (const module of modules.value) {
      const porAccion: Record<string, boolean> = {}
      for (const action of actionsByModule.value[module.id] ?? []) {
        porAccion[action.id] = keys.has(action.id)
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
    actionsByModule,
    draft,
    total,
    activeCount,
    allSelected,
    enabledKeys,
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
    reset,
    describeError
  }
}
