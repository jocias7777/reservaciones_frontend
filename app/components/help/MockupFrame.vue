<script setup lang="ts">
/**
 * El marco de un ejemplo visual: la caja que envuelve una recreación de la
 * pantalla de verdad.
 *
 * Va enmarcado y con su rótulo para que se distinga de la propia guía: dentro
 * hay botones e interruptores que se ven exactamente como los de la aplicación,
 * y sin un borde que lo separe uno no sabe si está leyendo una explicación o si
 * ya está tocando la pantalla. Nada de lo de dentro hace nada al pulsarlo.
 *
 * El pie es opcional pero conviene ponerlo: es donde se dice qué hay que mirar,
 * y ahorra tener que deducirlo del dibujo.
 */
withDefaults(defineProps<{
  /** Rótulo de arriba: qué pantalla o qué momento se está recreando. */
  title?: string
  /** Cómo se lee lo de dentro, en una frase. Va al pie, separado por una línea. */
  caption?: string
}>(), {
  title: '',
  caption: ''
})
</script>

<template>
  <figure class="mt-6 rounded-lg border border-default bg-elevated/40 p-5">
    <figcaption
      v-if="title"
      class="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-dimmed"
    >
      <UIcon
        name="i-lucide-scan-eye"
        class="size-4 shrink-0"
      />
      {{ title }}
    </figcaption>

    <slot />

    <p
      v-if="caption"
      class="mt-4 border-t border-default pt-3 text-sm text-muted"
    >
      {{ caption }}
    </p>
  </figure>
</template>
