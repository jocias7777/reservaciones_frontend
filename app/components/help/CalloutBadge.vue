<script setup lang="ts">
/** Círculo numerado que se pone junto a una pieza del mockup, en el mismo orden que `HelpCalloutLegend`. */
defineProps<{ n: number }>()
</script>

<template>
  <span
    aria-hidden="true"
    class="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-inverted"
  >{{ n }}</span>
</template>
