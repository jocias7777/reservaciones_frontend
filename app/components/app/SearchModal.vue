<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'

const { isOpen, close } = useAppSearch()
const { items: navigationItems } = useAppNavigation()
const access = useAccessControl()

const usersApi = useUsersApi()
const rolesApi = useRolesApi()

const searchTerm = ref('')
/** Término ya reposado: evita una petición por cada tecla. */
const debouncedTerm = ref('')

let debounceTimer: ReturnType<typeof setTimeout> | undefined

watch(searchTerm, (value) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedTerm.value = value
  }, 300)
})

onScopeDispose(() => clearTimeout(debounceTimer))

const { data: results, status } = useAsyncData(
  'app-search',
  async () => {
    const term = debouncedTerm.value.trim()
    if (term.length < 2) {
      return { users: [], roles: [] }
    }

    // Un permiso faltante en un recurso no debe dejar el buscador inservible
    // para el otro, así que cada búsqueda se resuelve por separado.
    const [users, roles] = await Promise.all([
      usersApi
        .query({ search: term, searchFields: ['email', 'username'], limit: 5, expand: ['role', 'profile'] })
        .then(result => result.items)
        .catch(() => []),
      rolesApi
        .query({ search: term, searchFields: ['name', 'description'], limit: 5 })
        .then(result => result.items)
        .catch(() => [])
    ])

    return { users, roles }
  },
  {
    server: false,
    watch: [debouncedTerm],
    default: () => ({ users: [], roles: [] })
  }
)

/**
 * Los destinos del buscador salen del mismo sitio que el menú y se recortan
 * igual: es otra puerta a las mismas pantallas, y ofrecer aquí un módulo que no
 * se puede abrir devuelve a la misma trampa de entrar para ver un 403.
 *
 * Las pantallas del menú cuelgan del apartado «Seguridad», así que hay que bajar
 * un nivel: lo que se ofrece son sus hijos, no el apartado, que no lleva a
 * ningún sitio por sí mismo.
 */
const destinations = computed<CommandPaletteItem[]>(() => {
  const fromMenu = navigationItems.value.flatMap(item =>
    (item.children ?? [item]).map(child => ({
      label: String(child.label),
      icon: child.icon,
      to: child.to
    }))
  )

  const shortcuts = [
    { label: 'Agregar usuario', icon: 'i-lucide-user-round-plus', to: '/usuarios/nuevo' },
    { label: 'Agregar rol', icon: 'i-lucide-shield-plus', to: '/roles/nuevo' },
    { label: 'Agregar módulo', icon: 'i-lucide-package-plus', to: '/roles/modulos/nuevo' },
    { label: 'Agregar acción', icon: 'i-lucide-circle-plus', to: '/roles/acciones/nueva' },
    { label: 'Agregar categoría', icon: 'i-lucide-shapes', to: '/roles/categorias/nueva' }
  ]

  return [...fromMenu, ...shortcuts]
    .filter(item => typeof item.to === 'string' && access.canVisit(item.to))
})

const groups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => {
  const list: CommandPaletteGroup<CommandPaletteItem>[] = []

  if (destinations.value.length) {
    list.push({ id: 'navegacion', label: 'Ir a', items: destinations.value })
  }

  if (results.value.users.length) {
    list.push({
      id: 'usuarios',
      label: 'Usuarios',
      ignoreFilter: true,
      items: results.value.users.map(user => ({
        label: fullName(user.profile) ?? user.username ?? user.email,
        suffix: user.email,
        avatar: user.profile?.foto_url ? { src: user.profile.foto_url } : undefined,
        icon: user.profile?.foto_url ? undefined : 'i-lucide-user-round',
        to: `/usuarios/${user.id}`
      }))
    })
  }

  if (results.value.roles.length) {
    list.push({
      id: 'roles',
      label: 'Roles',
      ignoreFilter: true,
      items: results.value.roles.map(role => ({
        label: role.name,
        suffix: role.description ?? undefined,
        icon: 'i-lucide-shield',
        to: `/roles/permisos?rol=${role.id}`
      }))
    })
  }

  return list
})

// Al navegar a un resultado el modal debe cerrarse y quedar limpio.
const route = useRoute()
watch(() => route.fullPath, close)
watch(isOpen, (open) => {
  if (!open) searchTerm.value = ''
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Buscar"
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #content>
      <UCommandPalette
        v-model:search-term="searchTerm"
        :groups="groups"
        :loading="status === 'pending'"
        placeholder="Buscar usuarios, roles o acciones…"
        close
        :fuse="{ resultLimit: 20, matchAllWhenSearchEmpty: true }"
        class="h-96 max-h-[70vh]"
        @update:open="isOpen = $event"
      />
    </template>
  </UModal>
</template>
