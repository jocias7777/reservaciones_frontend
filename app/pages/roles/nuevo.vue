<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Agregar rol' })

const rolesApi = useRolesApi()
const notify = useNotify()

const saving = ref(false)

/** Id del `<form>`; el botón de guardar vive en la cabecera y lo referencia. */
const FORM_ID = 'role-form'

async function onSubmit(payload: { name: string, description: string }) {
  saving.value = true

  try {
    const role = await rolesApi.create(payload)

    notify.success('Rol creado', `Ahora define qué puede hacer «${role.name}».`)

    // El siguiente paso natural es asignarle permisos.
    await navigateTo(`/roles/${role.id}/permisos`)
  } catch (error) {
    notify.error(error, 'No se pudo crear el rol')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UContainer class="py-6">
    <div class="mx-auto w-full max-w-2xl space-y-4">
      <BasePageHeader
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
      </BasePageHeader>

      <RoleForm
        :id="FORM_ID"
        @submit="onSubmit"
      />
    </div>
  </UContainer>
</template>
