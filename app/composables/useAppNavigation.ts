import type { NavigationMenuItem } from '@nuxt/ui'

/**
 * Navegación del header: un solo apartado, "Seguridad", con sus pantallas
 * dentro.
 *
 * Se arma con `children` de `UNavigationMenu`, que en horizontal despliega el
 * submenú y añade la flecha hacia abajo por su cuenta.
 */
export function useAppNavigation() {
  const route = useRoute()

  /**
   * `/roles/modulos`, `/roles/acciones` y `/roles/categorias` también empiezan
   * por `/roles`: se resuelve del más específico al más general.
   */
  const isModulos = computed(() => route.path.startsWith('/roles/modulos'))
  const isAcciones = computed(() => route.path.startsWith('/roles/acciones'))
  const isCategorias = computed(() => route.path.startsWith('/roles/categorias'))
  const isRoles = computed(() =>
    route.path.startsWith('/roles') && !isModulos.value && !isAcciones.value && !isCategorias.value
  )
  const isUsuarios = computed(() => route.path.startsWith('/usuarios'))

  const items = computed<NavigationMenuItem[]>(() => [
    {
      // El apartado no se marca como activo: es el único del menú y siempre
      // estarías dentro de él. Se queda en gris, como en la documentación de
      // Nuxt UI, y el resaltado lo lleva la pantalla concreta dentro del submenú.
      label: 'Seguridad',
      children: [
        {
          label: 'Usuarios',
          icon: 'i-lucide-users',
          description: 'Cuentas con acceso al sistema',
          to: '/usuarios',
          active: isUsuarios.value
        },
        {
          label: 'Roles',
          icon: 'i-lucide-shield',
          description: 'Permisos por módulo y acción',
          to: '/roles',
          active: isRoles.value
        },
        {
          label: 'Módulos del sistema',
          icon: 'i-lucide-key-round',
          description: 'Zonas sobre las que se dan permisos',
          to: '/roles/modulos',
          active: isModulos.value
        },
        {
          label: 'Acciones',
          icon: 'i-lucide-circle-plus',
          description: 'Lo que se permite o se niega en cada módulo',
          to: '/roles/acciones',
          active: isAcciones.value
        },
        {
          label: 'Categorías de acciones',
          icon: 'i-lucide-shapes',
          description: 'Bloques en los que se agrupan las acciones',
          to: '/roles/categorias',
          active: isCategorias.value
        }
      ]
    }
  ])

  return { items }
}
