<script setup lang="ts">
/**
 * Cabecera de pantalla con sus acciones al lado.
 *
 * `UPageHeader` coloca los `links` dentro de la misma fila que el título y deja
 * la descripción debajo, así que los botones quedaban por encima del subtítulo.
 * Aquí van junto al bloque completo —título y descripción— y centrados con él.
 */
const props = defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <UPageHeader
      :title="props.title"
      :description="props.description"
      class="min-w-0 flex-1"
    />

    <div
      v-if="$slots.actions"
      class="flex flex-wrap items-center gap-2 shrink-0"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
