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

/** Id del `<form>`; el botón de guardar vive en la cabecera y lo referencia. */
const FORM_ID = 'role-form'

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
      <BasePageHeader
        :title="role?.name ?? 'Rol'"
        :description="role?.description ?? undefined"
      >
        <template #actions>
          <UButton
            label="Permisos"
            icon="i-lucide-list-checks"
            color="neutral"
            variant="outline"
            :to="`/roles/${roleId}/permisos`"
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
      </BasePageHeader>

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
        :id="FORM_ID"
        :role="role"
        @submit="onSubmit"
      />
    </div>
  </UContainer>
</template>
