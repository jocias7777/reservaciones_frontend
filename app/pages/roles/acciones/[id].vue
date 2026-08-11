<script setup lang="ts">
import type { CreateActionPayload } from '~/types'

definePageMeta({
  layout: 'app'
})

const route = useRoute()
const actionId = computed(() => String(route.params.id))

const actionsApi = useActionsApi()
const actionCategoriesApi = useActionCategoriesApi()
const notify = useNotify()
const { saving, save } = useSaveAction()

const { data, status, error, refresh } = useAsyncData(
  () => `action:${actionId.value}`,
  async () => {
    // La acción es lo que da sentido a la pantalla; las categorías solo pueblan
    // un desplegable opcional, así que su falta de permiso no la tumba.
    const [action, categories] = await Promise.all([
      actionsApi.get(actionId.value),
      actionCategoriesApi.list().catch(() => [])
    ])

    return { action, categories }
  },
  { server: false, watch: [actionId] }
)

const loading = usePendingAfterHydration(status)

useSeoMeta({
  title: () => (data.value ? `Acción · ${data.value.action.name}` : 'Acción')
})

/** Id del `<form>`; el botón de guardar vive en la cabecera y lo referencia. */
const FORM_ID = 'action-form'

function onSubmit(payload: CreateActionPayload) {
  return save('No se pudo guardar', async () => {
    await actionsApi.update(actionId.value, payload)

    notify.success('Cambios guardados', `Se actualizó «${payload.name}».`)

    await refresh()
  })
}
</script>

<template>
  <BaseFormPage
    :title="data?.action.name ?? 'Acción'"
    :description="data?.action.description ?? undefined"
  >
    <template #actions>
      <UButton
        label="Volver"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        to="/roles/acciones"
      />
      <UButton
        label="Guardar cambios"
        icon="i-lucide-save"
        type="submit"
        :form="FORM_ID"
        :loading="saving"
        :disabled="!data"
      />
    </template>

    <BaseErrorAlert
      :error="error"
      title="No se pudo cargar la acción"
      @retry="refresh"
    />

    <USkeleton
      v-if="loading"
      class="h-96 w-full"
    />

    <ActionForm
      v-else-if="data"
      :id="FORM_ID"
      :action="data.action"
      :categories="data.categories"
      @submit="onSubmit"
    />
  </BaseFormPage>
</template>
