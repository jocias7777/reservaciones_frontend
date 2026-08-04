<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

const route = useRoute()
const roleId = computed(() => String(route.params.id))

const rolesApi = useRolesApi()
const toast = useToast()

const { data: role, status, error, refresh } = useAsyncData(
  () => `role:${roleId.value}`,
  () => rolesApi.get(roleId.value),
  { server: false, watch: [roleId] }
)

useSeoMeta({
  title: () => (role.value ? `Rol · ${role.value.name}` : 'Rol')
})

const saving = ref(false)

async function onSubmit(payload: { name: string, description: string }) {
  saving.value = true

  try {
    await rolesApi.update(roleId.value, payload)

    toast.add({
      title: 'Cambios guardados',
      description: `Se actualizó «${payload.name}».`,
      color: 'success',
      icon: 'i-lucide-circle-check'
    })

    await refresh()
  } catch (err) {
    toast.add({
      title: 'No se pudo guardar',
      description: apiErrorMessage(err),
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
        :title="role?.name ?? 'Rol'"
        :description="role?.description ?? undefined"
        :links="[{
          label: 'Permisos',
          icon: 'i-lucide-key-round',
          to: `/roles/${roleId}/permisos`,
          color: 'neutral',
          variant: 'outline'
        }]"
      />

      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        title="No se pudo cargar el rol"
        :description="apiErrorMessage(error)"
        :actions="[{ label: 'Reintentar', color: 'error', variant: 'outline', onClick: () => refresh() }]"
      />

      <USkeleton
        v-else-if="status === 'pending'"
        class="h-64 w-full"
      />

      <RoleForm
        v-else
        mode="edit"
        :role="role"
        :loading="saving"
        @submit="onSubmit"
      >
        <template #secondary-action>
          <UButton
            label="Volver a roles"
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
            to="/roles"
          />
        </template>
      </RoleForm>
    </div>
  </UContainer>
</template>
