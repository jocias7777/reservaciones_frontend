<script setup lang="ts">
import type { CreateUserPayload, UserFormPayload } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Agregar usuario' })

const usersApi = useUsersApi()
const notify = useNotify()
const { saving, save } = useSaveAction()

/** Id del `<form>`; el botón de guardar vive en la cabecera y lo referencia. */
const FORM_ID = 'user-form'

function onSubmit(payload: UserFormPayload) {
  return save('No se pudo crear el usuario', async () => {
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

    notify.success('Usuario creado', `${user.email} ya puede iniciar sesión.`)

    await navigateTo('/usuarios')
  })
}
</script>

<template>
  <BaseFormPage
    title="Agregar usuario"
    description="Registra la cuenta y, si quieres, su perfil."
    width="lg"
  >
    <template #actions>
      <UButton
        label="Cancelar"
        color="neutral"
        variant="soft"
        to="/usuarios"
      />
      <UButton
        label="Crear usuario"
        icon="i-lucide-user-round-plus"
        type="submit"
        :form="FORM_ID"
        :loading="saving"
      />
    </template>

    <UserForm
      :id="FORM_ID"
      mode="create"
      @submit="onSubmit"
    />
  </BaseFormPage>
</template>
