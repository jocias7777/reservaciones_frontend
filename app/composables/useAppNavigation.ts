import type { NavigationMenuItem } from '@nuxt/ui'

/**
 * Navegación del header: el apartado "Seguridad" con sus pantallas dentro.
 *
 * El apartado se arma con `children` de `UNavigationMenu`, que en horizontal
 * despliega el submenú y añade la flecha hacia abajo por su cuenta.
 */
export function useAppNavigation() {
  const route = useRoute()
  const access = useAccessControl()

  /**
   * Todas las pantallas de este apartado cuelgan de `/roles` o de `/usuarios`,
   * así que se resuelve de la más específica a la más general.
   */
  const isPermisosRol = computed(() => route.path.startsWith('/roles/permisos'))
  const isPermisosUsuario = computed(() => route.path.startsWith('/usuarios/permisos'))
  const isModulos = computed(() => route.path.startsWith('/roles/modulos'))
  const isAcciones = computed(() => route.path.startsWith('/roles/acciones'))
  const isCategorias = computed(() => route.path.startsWith('/roles/categorias'))
  const isRoles = computed(() =>
    route.path.startsWith('/roles')
    && !isPermisosRol.value && !isModulos.value && !isAcciones.value && !isCategorias.value
  )
  const isUsuarios = computed(() =>
    route.path.startsWith('/usuarios') && !isPermisosUsuario.value
  )

  /**
   * Solo se ofrece lo que se puede abrir.
   *
   * Un menú que lleva a una pantalla que responde 403 no es una comodidad, es
   * una trampa: se entra, se ve el error y hay que volver. Quién puede qué lo
   * dice el backend (ver `useAccessControl`), no una lista escrita aquí.
   */
  const visible = (items: NavigationMenuItem[]) =>
    items.filter(item => typeof item.to === 'string' && access.canVisit(item.to))

  const items = computed<NavigationMenuItem[]>(() => {
    const children = visible([
      {
        label: 'Usuarios',
        description: 'Cuentas con acceso al sistema',
        icon: 'i-lucide-users',
        to: '/usuarios',
        active: isUsuarios.value
      },
      {
        label: 'Roles',
        description: 'Permisos por módulo y acción',
        icon: 'i-lucide-shield',
        to: '/roles',
        active: isRoles.value
      },
      {
        label: 'Permisos por usuario',
        description: 'Excepciones de una persona sobre lo que da su rol',
        icon: 'i-lucide-user-round-cog',
        to: '/usuarios/permisos',
        active: isPermisosUsuario.value
      },
      {
        label: 'Permisos por rol',
        description: 'Qué puede hacer cada rol en cada módulo',
        icon: 'i-lucide-list-checks',
        to: '/roles/permisos',
        active: isPermisosRol.value
      },
      {
        label: 'Módulos del sistema',
        description: 'Zonas sobre las que se dan permisos',
        icon: 'i-lucide-key-round',
        to: '/roles/modulos',
        active: isModulos.value
      },
      {
        label: 'Acciones',
        description: 'Lo que se permite o se niega en cada módulo',
        icon: 'i-lucide-circle-plus',
        to: '/roles/acciones',
        active: isAcciones.value
      },
      {
        label: 'Categorías de acciones',
        description: 'Bloques en los que se agrupan las acciones',
        icon: 'i-lucide-shapes',
        to: '/roles/categorias',
        active: isCategorias.value
      }
    ])

    const groups: NavigationMenuItem[] = []

    // Sin ninguna pantalla a la que ir, el apartado entero sobra: un menú
    // desplegable vacío se abre y no ofrece nada.
    if (children.length) {
      groups.push({
        // El apartado no se marca como activo: es el único del menú y siempre
        // estarías dentro de él. Se queda en gris, como en la documentación de
        // Nuxt UI, y el resaltado lo lleva la pantalla concreta dentro del submenú.
        label: 'Seguridad',
        children
      })
    }

    return groups
  })

  return { items }
}
