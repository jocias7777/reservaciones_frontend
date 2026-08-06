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
const { saving, save } = useSaveAction()

const { data: user, status, error, refresh } = useAsyncData(
  () => `user:${userId.value}`,
  () => usersApi.get(userId.value),
  { server: false, watch: [userId] }
)

const loading = usePendingAfterHydration(status)

useSeoMeta({
  title: () => (user.value ? `Usuario · ${user.value.email}` : 'Usuario')
})

/** Id del `<form>`; el botón de guardar vive en la cabecera y lo referencia. */
const FORM_ID = 'user-form'

function onSubmit(payload: UserFormPayload) {
  return save('No se pudo guardar', async () => {
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
  })
}
</script>

<template>
  <BaseFormPage
    :title="fullName(user?.profile) ?? user?.username ?? user?.email ?? 'Usuario'"
    :description="user?.email"
    width="lg"
  >
    <template #actions>
      <UButton
        label="Permisos del usuario"
        icon="i-lucide-list-checks"
        color="neutral"
        variant="outline"
        :to="`/usuarios/permisos?usuario=${userId}`"
      />
      <UButton
        label="Guardar cambios"
        icon="i-lucide-save"
        type="submit"
        :form="FORM_ID"
        :loading="saving"
        :disabled="!user"
      />
    </template>

    <BaseErrorAlert
      :error="error"
      title="No se pudo cargar el usuario"
      @retry="refresh"
    />

    <div
      v-if="loading"
      class="space-y-4"
    >
      <USkeleton class="h-56 w-full" />
      <USkeleton class="h-72 w-full" />
    </div>

    <UserForm
      v-else
      :id="FORM_ID"
      mode="edit"
      :user="user"
      @submit="onSubmit"
    />
  </BaseFormPage>
</template>
