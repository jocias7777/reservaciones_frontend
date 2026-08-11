import type { ButtonProps } from '@nuxt/ui'

/**
 * Botón de acción de cada fila de una tabla: icono algo menor que el resto,
 * para no competir con el contenido de la celda.
 *
 * Cada listado y cada papelera lo repetían igual, cambiando solo el color
 * (`neutral` para editar, `error` para eliminar, `success` para restaurar).
 */
export function rowActionProps(color: ButtonProps['color'] = 'neutral'): ButtonProps {
  return {
    color,
    variant: 'ghost',
    ui: { leadingIcon: 'size-5' }
  }
}
