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

const { data, status, error, refresh } = useAsyncData(
  () => `action:${actionId.value}`,
  async () => {
    const [action, categories] = await Promise.all([
      actionsApi.get(actionId.value),
      actionCategoriesApi.list()
    ])

    return { action, categories }
  },
  { server: false, watch: [actionId] }
)

useSeoMeta({
  title: () => (data.value ? `Acción · ${data.value.action.name}` : 'Acción')
})

const saving = ref(false)

/** Id del `<form>`; el botón de guardar vive en la cabecera y lo referencia. */
const FORM_ID = 'action-form'

async function onSubmit(payload: CreateActionPayload) {
  saving.value = true

  try {
    await actionsApi.update(actionId.value, payload)

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
        :title="data?.action.name ?? 'Acción'"
        :description="data?.action.description ?? undefined"
      >
        <template #actions>
          <UButton
            label="Volver a acciones"
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
      </BasePageHeader>

      <BaseErrorAlert
        :error="error"
        title="No se pudo cargar la acción"
        @retry="refresh"
      />

      <USkeleton
        v-if="status === 'pending'"
        class="h-96 w-full"
      />

      <ActionForm
        v-else-if="data"
        :id="FORM_ID"
        :action="data.action"
        :categories="data.categories"
        @submit="onSubmit"
      />
    </div>
  </UContainer>
</template>
