<script setup lang="ts">
import type { OverrideState } from '~/types'

/**
 * Selector de los tres estados de una celda en los permisos de un usuario.
 *
 * En la pantalla de roles basta un interruptor porque solo hay sí o no. Aquí no:
 * "apagado" puede significar que su rol tampoco lo da o que se le bloqueó
 * expresamente, y son cosas distintas. Las tres opciones se muestran siempre
 * juntas para que se vea de un vistazo cuál está elegida y cuáles no.
 */
const props = withDefaults(defineProps<{
  modelValue: OverrideState
  /** Se antepone a cada opción en el nombre accesible (ej. «Crear en Usuarios»). */
  label: string
  disabled?: boolean
}>(), {
  disabled: false
})

const emit = defineEmits<{ 'update:modelValue': [value: OverrideState] }>()

const OPTIONS = [
  {
    value: 'inherit',
    label: 'Hereda',
    icon: 'i-lucide-corner-down-right',
    color: 'neutral',
    hint: 'Manda lo que diga su rol'
  },
  {
    value: 'grant',
    label: 'Permitir',
    icon: 'i-lucide-check',
    color: 'success',
    hint: 'Puede, aunque su rol no lo dé'
  },
  {
    value: 'deny',
    label: 'Bloquear',
    icon: 'i-lucide-ban',
    color: 'error',
    hint: 'No puede, aunque su rol sí lo dé'
  }
] as const satisfies ReadonlyArray<{
  value: OverrideState
  label: string
  icon: string
  color: 'neutral' | 'success' | 'error'
  hint: string
}>
</script>

<template>
  <!--
    Las tres opciones van separadas, no pegadas en un grupo: se distinguen mejor
    y se pulsa la correcta a la primera.

    Ocupan todo el ancho de su columna repartido a partes iguales (`flex-1`), así
    el tamaño de cada botón no depende de lo que mida su etiqueta y las filas
    quedan alineadas entre sí.
  -->
  <div
    role="radiogroup"
    class="flex w-full items-center gap-2"
    :aria-label="props.label"
  >
    <UTooltip
      v-for="option in OPTIONS"
      :key="option.value"
      :text="option.hint"
      class="flex-1"
    >
      <UButton
        :label="option.label"
        :icon="option.icon"
        size="xs"
        :color="props.modelValue === option.value ? option.color : 'neutral'"
        :variant="props.modelValue === option.value ? 'solid' : 'outline'"
        :disabled="props.disabled"
        block
        class="whitespace-nowrap"
        role="radio"
        :aria-checked="props.modelValue === option.value"
        :aria-label="`${option.label}: ${props.label}`"
        @click="emit('update:modelValue', option.value)"
      />
    </UTooltip>
  </div>
</template>
