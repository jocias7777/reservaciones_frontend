<script setup lang="ts">
import type { OverrideState } from '~/types'

/**
 * Selector de los tres estados de una celda en los permisos de un usuario.
 *
 * En la pantalla de roles basta un interruptor porque solo hay sí o no. Aquí no:
 * "apagado" puede significar que su rol tampoco lo da o que se le bloqueó
 * expresamente, y son cosas distintas.
 *
 * Va como control segmentado —una pista con un indicador que se desplaza— y solo
 * con iconos. Lo segundo es una concesión al tamaño: la tarjeta reparte las
 * acciones en columnas por categoría, como la de roles, y ahí no caben tres
 * palabras por acción. El precio se paga con el tooltip de cada opción y con la
 * leyenda que la lista pone una vez arriba, no repetida en cada fila.
 */
const props = withDefaults(defineProps<{
  modelValue: OverrideState
  /**
   * Lo que concede el rol. No se dibuja: es lo que hace que el tooltip de
   * «Hereda» diga en qué se traduce heredar en ESTA acción, que es justo cuando
   * alguien se lo pregunta.
   */
  inherited: boolean
  /** Se antepone a cada opción en el nombre accesible (ej. «Crear en Usuarios»). */
  label: string
  disabled?: boolean
}>(), {
  disabled: false
})

const emit = defineEmits<{ 'update:modelValue': [value: OverrideState] }>()

const OPTIONS = computed(() => [
  {
    value: 'inherit',
    label: 'Hereda',
    icon: 'i-lucide-corner-down-right',
    hint: props.inherited
      ? 'Hereda: su rol concede esta acción'
      : 'Hereda: su rol no concede esta acción',
    // Heredar es el estado de reposo: se marca, pero sin gritar.
    thumb: 'bg-accented',
    text: 'text-highlighted'
  },
  {
    value: 'grant',
    label: 'Permitir',
    icon: 'i-lucide-check',
    hint: 'Permitir, aunque su rol no lo dé',
    thumb: 'bg-success',
    text: 'text-inverted'
  },
  {
    value: 'deny',
    label: 'Bloquear',
    icon: 'i-lucide-ban',
    hint: 'Bloquear, aunque su rol sí lo dé',
    thumb: 'bg-error',
    text: 'text-inverted'
  }
] as const satisfies ReadonlyArray<{
  value: OverrideState
  label: string
  icon: string
  hint: string
  thumb: string
  text: string
}>)

/** Una posición por opción; los tres segmentos miden lo mismo (`w-7`). */
const THUMB_OFFSET = ['translate-x-0', 'translate-x-full', 'translate-x-[200%]'] as const

const selectedIndex = computed(() => {
  const index = OPTIONS.value.findIndex(option => option.value === props.modelValue)
  return index === -1 ? 0 : index
})

const selected = computed(() => OPTIONS.value[selectedIndex.value]!)

const root = useTemplateRef<HTMLElement>('root')

const ARROW_KEYS = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End']

/**
 * Un `radiogroup` se recorre con las flechas, no con el tabulador: dentro del
 * grupo solo es tabulable la opción elegida (`tabindex` rotatorio, más abajo),
 * así que sin esto el teclado entraba en la celda y no podía cambiarla. Con
 * ciento y pico celdas en pantalla, tabular por las tres opciones de cada una
 * tampoco era alternativa.
 */
function onKeydown(event: KeyboardEvent) {
  if (props.disabled || !ARROW_KEYS.includes(event.key)) return

  // Las flechas mueven el foco dentro del grupo; que además hagan scroll no.
  event.preventDefault()

  const last = OPTIONS.value.length - 1
  const current = selectedIndex.value

  let next: number
  if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = last
  else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = current === last ? 0 : current + 1
  else next = current === 0 ? last : current - 1

  emit('update:modelValue', OPTIONS.value[next]!.value)

  // El `tabindex` se recalcula al cambiar el valor, así que el foco se mueve
  // después de que Vue haya pintado.
  nextTick(() => {
    root.value?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus()
  })
}
</script>

<template>
  <div
    ref="root"
    role="radiogroup"
    :aria-label="props.label"
    class="relative inline-flex shrink-0 rounded-lg bg-elevated p-0.5"
    :class="props.disabled && 'opacity-60'"
    @keydown="onKeydown"
  >
    <!--
      El indicador es un único elemento que se desplaza, no un fondo que aparece
      y desaparece en cada opción: así el cambio de estado se lee como un
      movimiento y no como un parpadeo. `translate` y `background-color` son
      baratos de animar.
    -->
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-y-0.5 left-0.5 w-7 rounded-md shadow-xs transition-[translate,background-color] duration-200 ease-out-quint motion-reduce:transition-none"
      :class="[selected.thumb, THUMB_OFFSET[selectedIndex]]"
    />

    <!--
      `UTooltip` monta su disparador con `as-child`: estas clases caen sobre el
      propio botón, sin envoltorio de por medio.
    -->
    <UTooltip
      v-for="(option, index) in OPTIONS"
      :key="option.value"
      :text="option.hint"
      class="relative z-10"
    >
      <button
        type="button"
        role="radio"
        :aria-checked="props.modelValue === option.value"
        :aria-label="`${option.label}: ${props.label}`"
        :tabindex="index === selectedIndex ? 0 : -1"
        :disabled="props.disabled"
        class="flex w-7 items-center justify-center rounded-md py-1 transition-[color,transform] duration-150 ease-out-quint focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed not-disabled:active:scale-[0.9] motion-reduce:transition-none motion-reduce:active:scale-100"
        :class="props.modelValue === option.value ? option.text : 'text-muted hover:not-disabled:text-default'"
        @click="emit('update:modelValue', option.value)"
      >
        <UIcon
          :name="option.icon"
          class="size-4"
        />
      </button>
    </UTooltip>
  </div>
</template>
