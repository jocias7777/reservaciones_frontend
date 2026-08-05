<script setup lang="ts">
import type { CreatePermissionModulePayload } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Agregar módulo' })

const modulesApi = useModulesApi()
const notify = useNotify()

const saving = ref(false)

async function onSubmit(payload: CreatePermissionModulePayload) {
  saving.value = true

  try {
    const module = await modulesApi.create(payload)

    notify.success('Módulo creado', `«${module.name}» ya aparece en los permisos de cada rol.`)

    await navigateTo('/roles/modulos')
  } catch (error) {
    notify.error(error, 'No se pudo crear el módulo')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UContainer class="py-6">
    <div class="mx-auto w-full max-w-2xl space-y-4">
      <UPageHeader
        title="Agregar módulo"
        description="Aparecerá en los permisos de cada rol."
      />

      <ModuleForm
        :loading="saving"
        @submit="onSubmit"
      >
        <template #secondary-action>
          <UButton
            label="Cancelar"
            color="neutral"
            variant="soft"
            to="/roles/modulos"
          />
        </template>
      </ModuleForm>
    </div>
  </UContainer>
</template>
