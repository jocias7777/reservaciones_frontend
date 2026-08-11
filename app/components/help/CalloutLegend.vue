<script setup lang="ts">
/** Leyenda del mockup: un texto por número, en el mismo orden en que aparecen ahí arriba. */
defineProps<{ items: string[] }>()
</script>

<template>
  <ol class="mt-4 space-y-2 border-t border-default pt-4 text-sm text-muted">
    <li
      v-for="(item, index) in items"
      :key="item"
      class="flex gap-2.5"
    >
      <HelpCalloutBadge :n="index + 1" />
      <span class="pt-px">{{ item }}</span>
    </li>
  </ol>
</template>
