/**
 * Avisos de la aplicación.
 *
 * Centraliza el color y el icono de cada tipo de mensaje: antes cada pantalla
 * repetía el mismo `toast.add({ ... })` con sus cuatro propiedades, y bastaba
 * un descuido para que un error saliera con el icono de éxito.
 */
export function useNotify() {
  const toast = useToast()

  return {
    success(title: string, description?: string) {
      toast.add({ title, description, color: 'success', icon: 'i-lucide-circle-check' })
    },

    /**
     * Muestra el mensaje que devolvió el backend, o `title` si no hubo respuesta.
     *
     * `description` lo sustituye cuando la pantalla sabe decirlo mejor: las
     * matrices de permisos traducen a nombres los ids de acción que el backend
     * cita en los errores de delegación (ver `describeActionIds`).
     */
    error(error: unknown, title = 'Algo salió mal', description?: string) {
      toast.add({
        title,
        description: description ?? apiErrorMessage(error),
        color: 'error',
        icon: 'i-lucide-circle-alert'
      })
    },

    warning(title: string, description?: string) {
      toast.add({ title, description, color: 'warning', icon: 'i-lucide-triangle-alert' })
    }
  }
}
