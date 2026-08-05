<script setup lang="ts">
import type { UserFormPayload } from '~/types'

definePageMeta({
  layout: 'app'
})

const route = useRoute()
const userId = computed(() => String(route.params.id))

const usersApi = useUsersApi()
const profilesApi = useUserProfilesApi()
const notify = useNotify()

const { data: user, status, error, refresh } = useAsyncData(
  () => `user:${userId.value}`,
  () => usersApi.get(userId.value),
  { server: false, watch: [userId] }
)

useSeoMeta({
  title: () => (user.value ? `Usuario · ${user.value.email}` : 'Usuario')
})

const saving = ref(false)

async function onSubmit(payload: UserFormPayload) {
  saving.value = true

  try {
    // La cuenta y el perfil viven en endpoints distintos: `PUT /users/:id` solo
    // acepta campos de la cuenta.
    await usersApi.update(userId.value, payload.account)

    const hadProfile = Boolean(user.value?.profile)
    if (hadProfile) {
      await profilesApi.update(userId.value, payload.profile)
    } else if (payload.hasProfile) {
      await profilesApi.create({ user_id: userId.value, ...payload.profile })
    }

    notify.success('Cambios guardados', `Se actualizó ${payload.account.email}.`)

    await refresh()
  } catch (err) {
    notify.error(err, 'No se pudo guardar')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UContainer class="py-6">
    <div class="mx-auto w-full max-w-3xl space-y-4">
      <UPageHeader
        :title="fullName(user?.profile) ?? user?.username ?? user?.email ?? 'Usuario'"
        :description="user?.email"
        :links="[{
          label: 'Permisos del usuario',
          icon: 'i-lucide-key-round',
          to: `/usuarios/${userId}/permisos`,
          color: 'neutral',
          variant: 'outline'
        }]"
      />

      <BaseErrorAlert
        :error="error"
        title="No se pudo cargar el usuario"
        @retry="refresh"
      />

      <div
        v-if="status === 'pending'"
        class="space-y-4"
      >
        <USkeleton class="h-56 w-full" />
        <USkeleton class="h-72 w-full" />
      </div>

      <UserForm
        v-else
        mode="edit"
        :user="user"
        :loading="saving"
        @submit="onSubmit"
      >
        <template #secondary-action>
          <UButton
            label="Volver a usuarios"
            color="neutral"
            variant="soft"
            icon="i-lucide-arrow-left"
            to="/usuarios"
          />
        </template>
      </UserForm>
    </div>
  </UContainer>
</template>
