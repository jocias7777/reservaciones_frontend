<script setup lang="ts">
import type { CreateActionCategoryPayload } from '~/types'

definePageMeta({
  layout: 'app'
})

const route = useRoute()
const categoryId = computed(() => String(route.params.id))

const categoriesApi = useActionCategoriesApi()
const notify = useNotify()
const { saving, save } = useSaveAction()

const { data: category, status, error, refresh } = useAsyncData(
  () => `action-category:${categoryId.value}`,
  () => categoriesApi.get(categoryId.value),
  { server: false, watch: [categoryId] }
)

const loading = usePendingAfterHydration(status)

useSeoMeta({
  title: () => (category.value ? `Categoría · ${category.value.name}` : 'Categoría')
})

/** Id del `<form>`; el botón de guardar vive en la cabecera y lo referencia. */
const FORM_ID = 'action-category-form'

function onSubmit(payload: CreateActionCategoryPayload) {
  return save('No se pudo guardar', async () => {
    await categoriesApi.update(categoryId.value, payload)

    notify.success('Cambios guardados', `Se actualizó «${payload.name}».`)

    await refresh()
  })
}
</script>

<template>
  <BaseFormPage
    :title="category?.name ?? 'Categoría'"
    :description="category?.description ?? undefined"
  >
    <template #actions>
      <UButton
        label="Volver a categorías"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        to="/roles/categorias"
      />
      <UButton
        label="Guardar cambios"
        icon="i-lucide-save"
        type="submit"
        :form="FORM_ID"
        :loading="saving"
        :disabled="!category"
      />
    </template>

    <BaseErrorAlert
      :error="error"
      title="No se pudo cargar la categoría"
      @retry="refresh"
    />

    <USkeleton
      v-if="loading"
      class="h-64 w-full"
    />

    <ActionCategoryForm
      v-else
      :id="FORM_ID"
      :category="category"
      @submit="onSubmit"
    />
  </BaseFormPage>
</template>
