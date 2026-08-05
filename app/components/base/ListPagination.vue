<script setup lang="ts">
/** Pie de los listados: total de registros y paginación. */
const props = defineProps<{
  total: number
  itemsPerPage: number
  /** Nombre del recurso en plural, para el texto del total. */
  label: string
}>()

const page = defineModel<number>('page', { required: true })
</script>

<template>
  <div
    v-if="props.total > props.itemsPerPage"
    class="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
  >
    <p class="text-sm text-muted">
      {{ props.total }} {{ props.label }} en total
    </p>

    <UPagination
      v-model:page="page"
      :items-per-page="props.itemsPerPage"
      :total="props.total"
    />
  </div>
</template>
