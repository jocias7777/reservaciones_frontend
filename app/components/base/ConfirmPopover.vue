<script setup lang="ts">
/**
 * Confirmación para acciones destructivas.
 *
 * Se usa un popover anclado al propio botón en lugar de un modal: el panel
 * resuelve todo en pantallas propias y un diálogo bloqueante para "¿seguro?"
 * interrumpe más de lo que ayuda.
 */
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
}>(), {
  title: '¿Confirmar la acción?',
  confirmLabel: 'Eliminar',
  cancelLabel: 'Cancelar'
})

const emit = defineEmits<{ confirm: [] }>()

const open = ref(false)

function confirm() {
  open.value = false
  emit('confirm')
}
</script>

<template>
  <UPopover
    v-model:open="open"
    :content="{ align: 'end' }"
  >
    <slot />

    <template #content>
      <div class="w-72 max-w-[calc(100vw-2rem)] p-4 space-y-3">
        <div class="flex items-start gap-2.5">
          <UIcon
            name="i-lucide-triangle-alert"
            class="size-5 shrink-0 text-warning"
          />
          <div class="space-y-1">
            <p class="text-sm font-semibold text-highlighted">
              {{ props.title }}
            </p>
            <p
              v-if="props.description"
              class="text-sm text-muted"
            >
              {{ props.description }}
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <UButton
            :label="props.cancelLabel"
            color="neutral"
            variant="ghost"
            @click="open = false"
          />
          <UButton
            :label="props.confirmLabel"
            color="error"
            :loading="props.loading"
            @click="confirm"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>
