<script setup lang="ts">
/**
 * Barra fija con el estado de los cambios pendientes.
 *
 * Los interruptores no guardan al instante: se acumulan y se envían juntos, así
 * que hace falta un lugar visible que diga cuántos cambios hay sin guardar.
 */
const props = withDefaults(defineProps<{
  changeCount: number
  addedCount?: number
  removedCount?: number
  saving?: boolean
}>(), {
  addedCount: 0,
  removedCount: 0,
  saving: false
})

const emit = defineEmits<{ discard: [], save: [] }>()

const isDirty = computed(() => props.changeCount > 0)
</script>

<template>
  <div class="sticky bottom-4 z-10">
    <div
      class="flex flex-col gap-3 rounded-lg border p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between"
      :class="isDirty ? 'border-primary/40 bg-primary/5' : 'border-default bg-default/90'"
    >
      <div class="flex items-center gap-2 text-sm">
        <UIcon
          :name="isDirty ? 'i-lucide-circle-alert' : 'i-lucide-check'"
          class="size-4 shrink-0"
          :class="isDirty ? 'text-primary' : 'text-dimmed'"
        />

        <span
          v-if="isDirty"
          class="text-highlighted"
        >
          {{ props.changeCount }} cambio(s) sin guardar
          <span class="text-muted">
            (<template v-if="props.addedCount">+{{ props.addedCount }} </template>
            <template v-if="props.removedCount">−{{ props.removedCount }}</template>)
          </span>
        </span>
        <span
          v-else
          class="text-muted"
        >Sin cambios pendientes</span>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          label="Descartar"
          icon="i-lucide-undo-2"
          color="neutral"
          variant="ghost"
          :disabled="!isDirty || props.saving"
          @click="emit('discard')"
        />
        <UButton
          label="Guardar cambios"
          icon="i-lucide-check"
          :disabled="!isDirty"
          :loading="props.saving"
          @click="emit('save')"
        />
      </div>
    </div>
  </div>
</template>
