import type { Action, OverrideState, PermissionModule } from '~/types'

export interface UseUserPermissionOverridesOptions {
  modules: MaybeRefOrGetter<PermissionModule[]>
  actions: MaybeRefOrGetter<Action[]>
  /** Ids de las acciones que concede el rol del usuario. */
  inherited: MaybeRefOrGetter<Set<string>>
}

/** Una celda que cambió de estado entre lo guardado y lo que se está editando. */
export interface OverrideChange {
  key: string
  from: OverrideState
  to: OverrideState
}

/**
 * Estado de la pantalla de permisos de un usuario.
 *
 * A diferencia de `usePermissionMatrix` —que usa la pantalla de roles y trabaja
 * con un conjunto de acciones activas— aquí cada celda tiene TRES estados, porque
 * es lo que sabe representar `sa_user_permissions`: heredar del rol, conceder o
 * bloquear. El mapa guarda solo las excepciones; una clave ausente es `inherit`,
 * igual que en la tabla la ausencia de fila significa "manda el rol".
 *
 * Se mantienen dos mapas: el que llegó del servidor (`baseline`) y el que se está
 * editando (`draft`). La diferencia entre ambos es exactamente el trabajo que hay
 * que enviar al guardar.
 */
export function useUserPermissionOverrides(options: UseUserPermissionOverridesOptions) {
  const modules = computed(() => toValue(options.modules))
  const actions = computed(() => sortActions(toValue(options.actions)))
  const inherited = computed(() => toValue(options.inherited))

  const baseline = ref<Map<string, OverrideState>>(new Map())
  const draft = ref<Map<string, OverrideState>>(new Map())

  /** Fija las excepciones que llegaron del servidor y descarta cualquier edición. */
  function setBaseline(entries: Iterable<readonly [string, OverrideState]>) {
    baseline.value = new Map(entries)
    draft.value = new Map(baseline.value)
  }

  const stateOf = (key: string): OverrideState => draft.value.get(key) ?? 'inherit'

  function set(key: string, state: OverrideState) {
    const next = new Map(draft.value)
    if (state === 'inherit') {
      next.delete(key)
    } else {
      next.set(key, state)
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
   * Todas las celdas, en orden de módulo y acción.
   *
   * La clave de una celda es el id de la acción y nada más: cada acción ya
   * pertenece a un módulo, así que no hay producto de módulos por acciones.
   */
  const allKeys = computed(() =>
    modules.value.flatMap(module => (actionsByModule.value[module.id] ?? []).map(action => action.id))
  )

  /** Aplica un mismo estado a todas las acciones de un módulo. */
  function setModule(moduleId: string, state: OverrideState) {
    const next = new Map(draft.value)
    for (const { id: key } of actionsByModule.value[moduleId] ?? []) {
      if (state === 'inherit') {
        next.delete(key)
      } else {
        next.set(key, state)
      }
    }
    draft.value = next
  }

  /** Quita todas las excepciones: el usuario vuelve a lo que dicte su rol. */
  function resetAllToInherit() {
    draft.value = new Map()
  }

  /** Lo que de verdad podrá hacer el usuario: la excepción manda sobre el rol. */
  function effective(key: string): boolean {
    return resolveEffective(stateOf(key), inherited.value.has(key))
  }

  /** Estado por acción de un módulo, listo para la tarjeta. */
  function statesOfModule(moduleId: string): Record<string, OverrideState> {
    const result: Record<string, OverrideState> = {}
    for (const action of actionsByModule.value[moduleId] ?? []) {
      result[action.id] = stateOf(action.id)
    }
    return result
  }

  /** Lo que concede el rol por acción de un módulo, para la columna "El rol da". */
  function inheritedOfModule(moduleId: string): Record<string, boolean> {
    const result: Record<string, boolean> = {}
    for (const action of actionsByModule.value[moduleId] ?? []) {
      result[action.id] = inherited.value.has(action.id)
    }
    return result
  }

  const statesByModule = computed(() =>
    Object.fromEntries(modules.value.map(module => [module.id, statesOfModule(module.id)]))
  )

  const inheritedByModule = computed(() =>
    Object.fromEntries(modules.value.map(module => [module.id, inheritedOfModule(module.id)]))
  )

  const exceptionCount = computed(() => draft.value.size)
  const grantCount = computed(() => [...draft.value.values()].filter(state => state === 'grant').length)
  const denyCount = computed(() => [...draft.value.values()].filter(state => state === 'deny').length)

  /** Cuántos permisos hereda del rol, contando solo los módulos y acciones visibles. */
  const inheritedCount = computed(() => allKeys.value.filter(key => inherited.value.has(key)).length)
  /** Cuántos permisos tendrá en total una vez aplicadas las excepciones. */
  const effectiveCount = computed(() => allKeys.value.filter(key => effective(key)).length)

  /**
   * Las excepciones que deben quedar guardadas, en el orden de la matriz.
   *
   * Es lo que se manda al guardar: el conjunto completo, no la diferencia. Lo
   * que no está aquí es que hereda del rol, y heredar es no tener fila. Va
   * ordenado por la matriz y no por el orden del `Map` —que es el de
   * inserción, o sea el orden en que se fueron tocando las celdas— para que el
   * cuerpo de la petición se pueda leer.
   */
  const exceptions = computed(() =>
    allKeys.value
      .filter(key => draft.value.has(key))
      .map(key => ({ key, isGrant: draft.value.get(key) === 'grant' }))
  )

  /**
   * Celdas cuyo estado difiere de lo guardado. Alimenta el contador del pie de
   * guardado: cuántas excepciones se tocaron desde que se abrió la pantalla.
   */
  const changes = computed<OverrideChange[]>(() => {
    const keys = new Set([...baseline.value.keys(), ...draft.value.keys()])
    const result: OverrideChange[] = []

    for (const key of keys) {
      const from = baseline.value.get(key) ?? 'inherit'
      const to = draft.value.get(key) ?? 'inherit'
      if (from !== to) {
        result.push({ key, from, to })
      }
    }

    return result
  })

  const changeCount = computed(() => changes.value.length)
  const isDirty = computed(() => changeCount.value > 0)
  /** Excepciones que se van a crear o modificar, y excepciones que se van a quitar. */
  const addedCount = computed(() => changes.value.filter(change => change.to !== 'inherit').length)
  const removedCount = computed(() => changes.value.filter(change => change.to === 'inherit').length)

  /** Descarta los cambios y vuelve a lo que hay guardado. */
  function reset() {
    draft.value = new Map(baseline.value)
  }

  return {
    modules,
    actions,
    actionsByModule,
    draft,
    statesByModule,
    inheritedByModule,
    exceptionCount,
    grantCount,
    denyCount,
    inheritedCount,
    effectiveCount,
    exceptions,
    changes,
    changeCount,
    addedCount,
    removedCount,
    isDirty,
    stateOf,
    effective,
    set,
    setModule,
    resetAllToInherit,
    setBaseline,
    reset
  }
}
