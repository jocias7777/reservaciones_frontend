<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

/**
 * Menú de la sesión. El disparador es solo el icono del avatar, sin fondo: la
 * foto del perfil si existe y, si no, un icono neutro.
 */
const { user, logout } = useAuth()
const usersApi = useUsersApi()
const access = useAccessControl()

// El endpoint de sesión no devuelve el perfil, así que la foto se pide aparte.
// Si el usuario no tiene permiso de lectura sobre `users`, el menú se queda con
// el icono genérico en lugar de romper la cabecera.
const { data: profile } = useAsyncData(
  'header:profile',
  async () => {
    if (!user.value) return null
    try {
      return (await usersApi.get(user.value.id)).profile ?? null
    } catch {
      return null
    }
  },
  { server: false, watch: [user], default: () => null }
)

const photo = computed(() => profile.value?.foto_url || undefined)
const displayName = computed(() => fullName(profile.value) ?? user.value?.username ?? user.value?.email ?? '')

const items = computed<DropdownMenuItem[][]>(() => [
  [{
    type: 'label',
    label: displayName.value,
    description: user.value?.email,
    avatar: photo.value ? { src: photo.value } : undefined,
    icon: photo.value ? undefined : 'i-lucide-circle-user'
  }],
  // La ficha propia vive dentro del módulo de usuarios: sin acceso a ese módulo
  // el enlace existía pero rebotaba, así que mejor no ofrecerlo.
  ...(access.canVisit('/usuarios')
    ? [[{
        label: 'Mi cuenta',
        icon: 'i-lucide-user-round',
        to: user.value ? `/usuarios/${user.value.id}` : '/usuarios'
      }]]
    : []),
  [{
    label: 'Cerrar sesión',
    icon: 'i-lucide-log-out',
    color: 'error',
    onSelect: () => {
      logout()
    }
  }]
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'end' }"
    :ui="{ content: 'w-56' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      square
      :aria-label="`Cuenta de ${displayName || 'usuario'}`"
    >
      <UAvatar
        v-if="photo"
        :src="photo"
        :alt="displayName"
        size="2xs"
      />
      <UIcon
        v-else
        name="i-lucide-circle-user"
        class="size-5 shrink-0"
      />
    </UButton>
  </UDropdownMenu>
</template>
