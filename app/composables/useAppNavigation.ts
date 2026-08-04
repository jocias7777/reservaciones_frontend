import type { NavigationMenuItem } from '@nuxt/ui'

/**
 * Módulos que se muestran centrados en el header.
 *
 * "Permisos" no es una entrada propia a propósito: un permiso es el cruce de un
 * módulo con una acción y siempre se manipula desde el rol (o desde el usuario)
 * al que pertenece. El catálogo de módulos vive dentro de Roles por el mismo
 * motivo.
 */
export function useAppNavigation() {
  const route = useRoute()

  const items = computed<NavigationMenuItem[]>(() => [
    {
      label: 'Usuarios',
      icon: 'i-lucide-users',
      to: '/usuarios',
      active: route.path.startsWith('/usuarios')
    },
    {
      label: 'Roles',
      icon: 'i-lucide-shield',
      to: '/roles',
      active: route.path.startsWith('/roles')
    }
  ])

  return { items }
}
