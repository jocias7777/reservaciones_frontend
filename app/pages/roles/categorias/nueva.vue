<script setup lang="ts">
import type { CreateActionCategoryPayload } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Agregar categoría' })

const categoriesApi = useActionCategoriesApi()
const notify = useNotify()

const saving = ref(false)

/** Id del `<form>`; el botón de guardar vive en la cabecera y lo referencia. */
const FORM_ID = 'action-category-form'

async function onSubmit(payload: CreateActionCategoryPayload) {
  saving.value = true

  try {
    const category = await categoriesApi.create(payload)

    notify.success('Categoría creada', `Ya puedes asignarle acciones a «${category.name}».`)

    await navigateTo('/roles/categorias')
  } catch (error) {
    notify.error(error, 'No se pudo crear la categoría')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UContainer class="py-6">
    <div class="mx-auto w-full max-w-2xl space-y-4">
      <BasePageHeader
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
      </BasePageHeader>

      <ActionCategoryForm
        :id="FORM_ID"
        @submit="onSubmit"
      />
    </div>
  </UContainer>
</template>
