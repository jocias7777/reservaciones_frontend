/** Aviso de éxito: título y detalle. */
export type RestoreNotice = readonly [title: string, description: string]

export interface UseResourceRestoreOptions<T> {
  /** Restaurar uno (`usersApi.restore`). */
  restore: (item: T) => Promise<unknown>
  /** Restaurar los seleccionados (`usersApi.bulkRestore`). */
  bulkRestore: (ids: string[]) => Promise<unknown>
  /**
   * Recarga tras restaurar. Normalmente hay que refrescar dos listados: la
   * papelera (para que la fila desaparezca de ahí) y el listado activo (para
   * que vuelva a aparecer en él).
   */
  refresh: () => Promise<unknown>
  /** Qué avisar al restaurar uno. */
  successOne: (item: T) => RestoreNotice
  /** Qué avisar al restaurar varios. */
  successMany: (count: number) => RestoreNotice
}

/**
 * Recuperar filas de la papelera: la selección de su tabla, el estado del
 * botón y los avisos.
 *
 * Es el reverso de `useResourceRemoval` y comparte su misma forma a propósito
 * —los cuatro listados con papelera restauran igual—, pero vive aparte porque
 * su tabla es otra (la de la papelera, no la del listado activo) y por tanto
 * necesita su propia selección de filas.
 */
export function useResourceRestore<T extends { id: string }>(options: UseResourceRestoreOptions<T>) {
  const notify = useNotify()

  /** Formato de `v-model:row-selection` de `UTable`: `{ [id]: true }`. */
  const rowSelection = ref<Record<string, boolean>>({})
  const selectedIds = computed(() => Object.keys(rowSelection.value).filter(id => rowSelection.value[id]))

  const restoring = ref(false)

  async function run(action: () => Promise<RestoreNotice>) {
    restoring.value = true

    try {
      const [title, description] = await action()
      notify.success(title, description)
      await options.refresh()
    } catch (error) {
      notify.error(error, 'No se pudo restaurar')
    } finally {
      restoring.value = false
    }
  }

  const restoreOne = (item: T) => run(async () => {
    await options.restore(item)
    return options.successOne(item)
  })

  const restoreSelected = () => run(async () => {
    const count = selectedIds.value.length
    await options.bulkRestore(selectedIds.value)
    rowSelection.value = {}
    return options.successMany(count)
  })

  return { rowSelection, selectedIds, restoring, restoreOne, restoreSelected }
}
