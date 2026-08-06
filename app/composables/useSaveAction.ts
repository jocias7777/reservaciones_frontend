/**
 * Estado del botón de guardar de un formulario.
 *
 * Todas las pantallas de alta y edición hacían lo mismo alrededor de su llamada
 * a la API: marcar que se está guardando, avisar del error si lo hay y volver a
 * dejar el botón libre pase lo que pase. Eso vive aquí, y cada pantalla se queda
 * solo con lo suyo: qué guarda y a dónde va después.
 */
export function useSaveAction() {
  const notify = useNotify()
  const saving = ref(false)

  /**
   * @param errorTitle Título del aviso si la llamada falla («No se pudo guardar»).
   * @param action Lo que hay que guardar; el detalle del error lo pone `notify`.
   */
  async function save(errorTitle: string, action: () => Promise<void>) {
    saving.value = true

    try {
      await action()
    } catch (error) {
      notify.error(error, errorTitle)
    } finally {
      saving.value = false
    }
  }

  return { saving, save }
}
