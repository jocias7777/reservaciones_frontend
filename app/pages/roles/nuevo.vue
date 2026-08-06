<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Agregar rol' })

const rolesApi = useRolesApi()
const notify = useNotify()
const { saving, save } = useSaveAction()

/** Id del `<form>`; el botón de guardar vive en la cabecera y lo referencia. */
const FORM_ID = 'role-form'

function onSubmit(payload: { name: string, description: string }) {
  return save('No se pudo crear el rol', async () => {
    const role = await rolesApi.create(payload)

    notify.success('Rol creado', `Ahora define qué puede hacer «${role.name}».`)

    // El siguiente paso natural es asignarle permisos.
    await navigateTo(`/roles/permisos?rol=${role.id}`)
  })
}
</script>

<template>
  <BaseFormPage
    title="Agregar rol"
    description="Al guardarlo pasarás a definir sus permisos."
  >
    <template #actions>
      <UButton
        label="Cancelar"
        color="neutral"
        variant="soft"
        to="/roles"
      />
      <UButton
        label="Crear rol"
        icon="i-lucide-shield-plus"
        type="submit"
        :form="FORM_ID"
        :loading="saving"
      />
    </template>

    <RoleForm
      :id="FORM_ID"
      @submit="onSubmit"
    />
  </BaseFormPage>
</template>
