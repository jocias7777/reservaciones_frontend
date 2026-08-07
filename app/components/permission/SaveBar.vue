<script setup lang="ts">
/**
 * Pie fijo con el estado de los cambios pendientes.
 *
 * Los interruptores no guardan al instante: se acumulan y se envían juntos, así
 * que hace falta un sitio que diga cuántos hay sin guardar y desde dónde
 * enviarlos. Va anclado al borde inferior de la ventana y no al final del
 * contenido: plegando los módulos la página se queda corta, y una barra pegada
 * al contenido subía hasta la mitad de la pantalla, donde ya no parece un pie
 * sino algo suelto.
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

/** El desglose solo se dice cuando aporta: con un único signo sobra el paréntesis. */
const breakdown = computed(() => {
  const partes: string[] = []
  if (props.addedCount) partes.push(`+${props.addedCount}`)
  if (props.removedCount) partes.push(`−${props.removedCount}`)
  return partes.join(' ')
})
</script>

<template>
  <!--
    Reserva el hueco del pie. Al estar fijo se sale del flujo y, sin esto,
    taparía la última tarjeta justo cuando se llega abajo del todo.

    En pantallas estrechas el estado y los botones se apilan y el pie pasa de
    60 a 92 px, así que ahí hace falta más hueco.
  -->
  <div
    aria-hidden="true"
    class="h-28 sm:h-20"
  />

  <div
    class="fixed inset-x-0 bottom-0 z-20 border-t backdrop-blur transition-colors duration-200 ease-out-quint motion-reduce:transition-none"
    :class="isDirty ? 'border-primary/30 bg-primary/5' : 'border-default bg-default/85'"
  >
    <!--
      El contenido se alinea con el de la página (mismo contenedor), para que el
      estado arranque justo bajo la primera tarjeta y los botones queden a la
      altura del borde derecho, no flotando en medio de la nada.
    -->
    <UContainer class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
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
          <span
            v-if="breakdown"
            class="text-muted tabular-nums"
          >({{ breakdown }})</span>
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
    </UContainer>
  </div>
</template>
