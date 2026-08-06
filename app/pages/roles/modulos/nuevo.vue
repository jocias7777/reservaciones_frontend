<script setup lang="ts">
import type { CreatePermissionModulePayload } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Agregar módulo' })

const modulesApi = useModulesApi()
const notify = useNotify()
const { saving, save } = useSaveAction()

/**
 * El listado avisa de los módulos que el backend ya exige y todavía no están
 * dados de alta, y enlaza aquí con el código puesto (`?code=…`).
 */
const route = useRoute()
const presetCode = computed(() => (typeof route.query.code === 'string' ? route.query.code : ''))

/** Id del `<form>`; el botón de guardar vive en la cabecera y lo referencia. */
const FORM_ID = 'module-form'

function onSubmit(payload: CreatePermissionModulePayload) {
  return save('No se pudo crear el módulo', async () => {
    const module = await modulesApi.create(payload)

    notify.success('Módulo creado', `«${module.name}» ya aparece en los permisos de cada rol.`)

    await navigateTo('/roles/modulos')
  })
}
</script>

<template>
  <BaseFormPage
    title="Agregar módulo"
    description="Aparecerá en los permisos de cada rol."
  >
    <template #actions>
      <UButton
        label="Cancelar"
        color="neutral"
        variant="soft"
        to="/roles/modulos"
      />
      <UButton
        label="Crear módulo"
        icon="i-lucide-package-plus"
        type="submit"
        :form="FORM_ID"
        :loading="saving"
      />
    </template>

    <ModuleForm
      :id="FORM_ID"
      :code="presetCode"
      @submit="onSubmit"
    />
  </BaseFormPage>
</template>
