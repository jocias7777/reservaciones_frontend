<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'

/**
 * Buscador global. Es el único modal de la aplicación: los formularios y la
 * asignación de permisos tienen pantalla propia.
 *
 * Los resultados de usuarios y roles se piden al backend con el endpoint QUERY,
 * así que sus grupos llevan `ignoreFilter` para que el filtro difuso local no
 * vuelva a recortar lo que ya filtró el servidor.
 */
const { isOpen, close } = useAppSearch()
const { items: navigationItems } = useAppNavigation()

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

const groups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => {
  const list: CommandPaletteGroup<CommandPaletteItem>[] = [
    {
      id: 'navegacion',
      label: 'Ir a',
      items: [
        ...navigationItems.value.map(item => ({
          label: item.label,
          icon: item.icon,
          to: item.to
        })),
        { label: 'Nuevo usuario', icon: 'i-lucide-user-round-plus', to: '/usuarios/nuevo' },
        { label: 'Nuevo rol', icon: 'i-lucide-shield-plus', to: '/roles/nuevo' },
        { label: 'Módulos del sistema', icon: 'i-lucide-key-round', to: '/roles/modulos' }
      ]
    }
  ]

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
        to: `/roles/${role.id}/permisos`
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
        class="h-96"
        @update:open="isOpen = $event"
      />
    </template>
  </UModal>
</template>
