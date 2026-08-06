<script setup lang="ts">
import type { CreateActionPayload } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Agregar acción' })

const actionsApi = useActionsApi()
const actionCategoriesApi = useActionCategoriesApi()
const notify = useNotify()
const { saving, save } = useSaveAction()

/** Las categorías pueblan el selector del formulario. */
const { data: categories, error, refresh } = useAsyncData(
  'action-categories:for-action-form',
  () => actionCategoriesApi.list(),
  { server: false, default: () => [] }
)

/** Id del `<form>`; el botón de guardar vive en la cabecera y lo referencia. */
const FORM_ID = 'action-form'

function onSubmit(payload: CreateActionPayload) {
  return save('No se pudo crear la acción', async () => {
    const action = await actionsApi.create(payload)

    notify.success('Acción creada', `«${action.name}» ya aparece en los permisos de cada rol.`)

    await navigateTo('/roles/acciones')
  })
}
</script>

<template>
  <BaseFormPage
    title="Agregar acción"
    description="Aparecerá en los permisos de cada rol, dentro del bloque de su categoría."
  >
    <template #actions>
      <UButton
        label="Cancelar"
        color="neutral"
        variant="soft"
        to="/roles/acciones"
      />
      <UButton
        label="Crear acción"
        icon="i-lucide-circle-plus"
        type="submit"
        :form="FORM_ID"
        :loading="saving"
      />
    </template>

    <BaseErrorAlert
      :error="error"
      title="No se pudieron cargar las categorías"
      @retry="refresh"
    />

    <UAlert
      v-if="!error && !categories.length"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Todavía no hay categorías"
      description="Cada acción se muestra dentro del bloque de su categoría. Crea al menos una para poder dar de alta acciones."
      :actions="[{
        label: 'Crear categoría',
        color: 'warning',
        variant: 'outline',
        to: '/roles/categorias/nueva'
      }]"
    />

    <ActionForm
      :id="FORM_ID"
      :categories="categories"
      @submit="onSubmit"
    />
  </BaseFormPage>
</template>
