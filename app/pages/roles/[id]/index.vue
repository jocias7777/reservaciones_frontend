<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

const route = useRoute()
const roleId = computed(() => String(route.params.id))

const rolesApi = useRolesApi()
const notify = useNotify()
const { saving, save } = useSaveAction()

const { data: role, status, error, refresh } = useAsyncData(
  () => `role:${roleId.value}`,
  () => rolesApi.get(roleId.value),
  { server: false, watch: [roleId] }
)

const loading = usePendingAfterHydration(status)

useSeoMeta({
  title: () => (role.value ? `Rol · ${role.value.name}` : 'Rol')
})

/** Id del `<form>`; el botón de guardar vive en la cabecera y lo referencia. */
const FORM_ID = 'role-form'

function onSubmit(payload: { name: string, description: string }) {
  return save('No se pudo guardar', async () => {
    await rolesApi.update(roleId.value, payload)

    notify.success('Cambios guardados', `Se actualizó «${payload.name}».`)

    await refresh()
  })
}
</script>

<template>
  <BaseFormPage
    :title="role?.name ?? 'Rol'"
    :description="role?.description ?? undefined"
  >
    <template #actions>
      <UButton
        label="Permisos"
        icon="i-lucide-list-checks"
        color="neutral"
        variant="outline"
        :to="`/roles/permisos?rol=${roleId}`"
      />
      <UButton
        label="Guardar cambios"
        icon="i-lucide-save"
        type="submit"
        :form="FORM_ID"
        :loading="saving"
        :disabled="!role"
      />
    </template>

    <BaseErrorAlert
      :error="error"
      title="No se pudo cargar el rol"
      @retry="refresh"
    />

    <USkeleton
      v-if="loading"
      class="h-64 w-full"
    />

    <RoleForm
      v-else
      :id="FORM_ID"
      :role="role"
      @submit="onSubmit"
    />
  </BaseFormPage>
</template>
