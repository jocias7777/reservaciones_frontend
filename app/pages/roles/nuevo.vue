<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Nuevo rol' })

const rolesApi = useRolesApi()
const toast = useToast()

const saving = ref(false)

async function onSubmit(payload: { name: string, description: string }) {
  saving.value = true

  try {
    const role = await rolesApi.create(payload)

    toast.add({
      title: 'Rol creado',
      description: `Ahora define qué puede hacer «${role.name}».`,
      color: 'success',
      icon: 'i-lucide-circle-check'
    })

    // El siguiente paso natural es asignarle permisos.
    await navigateTo(`/roles/${role.id}/permisos`)
  } catch (error) {
    toast.add({
      title: 'No se pudo crear el rol',
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
    <div class="mx-auto w-full max-w-2xl space-y-4">
      <UPageHeader
        title="Nuevo rol"
        description="Al guardarlo pasarás a definir sus permisos."
      />

      <RoleForm
        mode="create"
        :loading="saving"
        @submit="onSubmit"
      >
        <template #secondary-action>
          <UButton
            label="Cancelar"
            color="neutral"
            variant="ghost"
            to="/roles"
          />
        </template>
      </RoleForm>
    </div>
  </UContainer>
</template>
