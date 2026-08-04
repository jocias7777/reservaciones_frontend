<script setup lang="ts">
/**
 * Icono con fondo, del tamaño de un avatar.
 *
 * Se usa para identificar módulos, roles y usuarios en tarjetas y tablas. El
 * icono va en el color del texto principal (no en el de acento) para que el
 * verde quede reservado a lo que indica estado.
 */
const props = withDefaults(defineProps<{
  icon: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md'
})

const TILE_SIZES = {
  sm: 'size-8',
  md: 'size-9',
  lg: 'size-10'
} as const

// Solo tamaños enteros: Tailwind no genera las variantes fraccionarias de
// `size-*` (`size-4.5` y compañía se quedan sin regla y el icono cae a su
// tamaño intrínseco).
const ICON_SIZES = {
  sm: 'size-5',
  md: 'size-5',
  lg: 'size-6'
} as const
</script>

<template>
  <span
    class="flex shrink-0 items-center justify-center rounded-lg bg-elevated ring ring-default"
    :class="TILE_SIZES[props.size]"
  >
    <UIcon
      :name="props.icon"
      class="text-highlighted"
      :class="ICON_SIZES[props.size]"
    />
  </span>
</template>
