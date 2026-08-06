/** Aviso de éxito: título y detalle. */
export type RemovalNotice = readonly [title: string, description: string]

export interface UseResourceRemovalOptions<T> {
  /** Borrado de uno (`usersApi.remove`). */
  remove: (item: T) => Promise<unknown>
  /** Borrado de los seleccionados (`usersApi.bulkRemove`). */
  bulkRemove: (ids: string[]) => Promise<unknown>
  /** Recarga del listado, para que la fila desaparezca. */
  refresh: () => Promise<unknown>
  /** Qué avisar al borrar uno. */
  successOne: (item: T) => RemovalNotice
  /** Qué avisar al borrar varios. */
  successMany: (count: number) => RemovalNotice
}

/**
 * Enviar filas a la papelera desde un listado: la selección de la tabla, el
 * estado del botón y los avisos.
 *
 * Los cuatro listados con papelera hacían exactamente lo mismo —incluido el
 * detalle de vaciar la selección solo si el borrado masivo salió bien—, así que
 * vive aquí y cada pantalla se queda con lo suyo: qué API llama y qué texto
 * muestra.
 */
export function useResourceRemoval<T extends { id: string }>(options: UseResourceRemovalOptions<T>) {
  const notify = useNotify()

  /** Formato de `v-model:row-selection` de `UTable`: `{ [id]: true }`. */
  const rowSelection = ref<Record<string, boolean>>({})
  const selectedIds = computed(() => Object.keys(rowSelection.value).filter(id => rowSelection.value[id]))

  const removing = ref(false)

  async function run(action: () => Promise<RemovalNotice>) {
    removing.value = true

    try {
      const [title, description] = await action()
      notify.success(title, description)
      await options.refresh()
    } catch (error) {
      notify.error(error, 'No se pudo eliminar')
    } finally {
      removing.value = false
    }
  }

  const removeOne = (item: T) => run(async () => {
    await options.remove(item)
    return options.successOne(item)
  })

  const removeSelected = () => run(async () => {
    const count = selectedIds.value.length
    await options.bulkRemove(selectedIds.value)
    rowSelection.value = {}
    return options.successMany(count)
  })

  return { rowSelection, selectedIds, removing, removeOne, removeSelected }
}
