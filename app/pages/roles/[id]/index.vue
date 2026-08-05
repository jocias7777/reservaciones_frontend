<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

const route = useRoute()
const roleId = computed(() => String(route.params.id))

const rolesApi = useRolesApi()
const notify = useNotify()

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

    notify.success('Cambios guardados', `Se actualizó «${payload.name}».`)

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

      <BaseErrorAlert
        :error="error"
        title="No se pudo cargar el rol"
        @retry="refresh"
      />

      <USkeleton
        v-if="status === 'pending'"
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
            variant="soft"
            icon="i-lucide-arrow-left"
            to="/roles"
          />
        </template>
      </RoleForm>
    </div>
  </UContainer>
</template>
