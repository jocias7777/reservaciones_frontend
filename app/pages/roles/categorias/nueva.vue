<script setup lang="ts">
import type { CreateActionCategoryPayload } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Agregar categoría' })

const categoriesApi = useActionCategoriesApi()
const notify = useNotify()
const { saving, save } = useSaveAction()

/** Id del `<form>`; el botón de guardar vive en la cabecera y lo referencia. */
const FORM_ID = 'action-category-form'

function onSubmit(payload: CreateActionCategoryPayload) {
  return save('No se pudo crear la categoría', async () => {
    const category = await categoriesApi.create(payload)

    notify.success('Categoría creada', `Ya puedes asignarle acciones a «${category.name}».`)

    await navigateTo('/roles/categorias')
  })
}
</script>

<template>
  <BaseFormPage
    title="Agregar categoría"
    description="Será uno de los bloques en los que se reparten las acciones de cada módulo."
  >
    <template #actions>
      <UButton
        label="Cancelar"
        color="neutral"
        variant="soft"
        to="/roles/categorias"
      />
      <UButton
        label="Crear categoría"
        icon="i-lucide-shapes"
        type="submit"
        :form="FORM_ID"
        :loading="saving"
      />
    </template>

    <ActionCategoryForm
      :id="FORM_ID"
      @submit="onSubmit"
    />
  </BaseFormPage>
</template>
