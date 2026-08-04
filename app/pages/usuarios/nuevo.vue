<script setup lang="ts">
import type { CreateUserPayload, UserFormPayload } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Nuevo usuario' })

const usersApi = useUsersApi()
const toast = useToast()

const saving = ref(false)

async function onSubmit(payload: UserFormPayload) {
  saving.value = true

  try {
    // `POST /users` acepta el perfil anidado, así que la cuenta y el perfil se
    // crean en una sola llamada (y en una sola transacción del backend).
    const body: CreateUserPayload = {
      email: payload.account.email,
      password: payload.account.password!,
      username: payload.account.username,
      role_id: payload.account.role_id,
      is_active: payload.account.is_active,
      ...(payload.hasProfile ? { profile: payload.profile } : {})
    }

    const user = await usersApi.create(body)

    toast.add({
      title: 'Usuario creado',
      description: `${user.email} ya puede iniciar sesión.`,
      color: 'success',
      icon: 'i-lucide-circle-check'
    })

    await navigateTo('/usuarios')
  } catch (error) {
    toast.add({
      title: 'No se pudo crear el usuario',
      description: apiErrorMessage(error),
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UContainer class="py-6">
    <div class="mx-auto w-full max-w-3xl space-y-4">
      <UPageHeader
        title="Nuevo usuario"
        description="Registra la cuenta y, si quieres, su perfil."
      />

      <UserForm
        mode="create"
        :loading="saving"
        @submit="onSubmit"
      >
        <template #secondary-action>
          <UButton
            label="Cancelar"
            color="neutral"
            variant="ghost"
            to="/usuarios"
          />
        </template>
      </UserForm>
    </div>
  </UContainer>
</template>
