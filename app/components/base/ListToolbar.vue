<script setup lang="ts">
/** Barra superior de los listados: búsqueda a la izquierda, acciones a la derecha. */
const props = withDefaults(defineProps<{
  placeholder?: string
  loading?: boolean
}>(), {
  placeholder: 'Buscar…'
})

const search = defineModel<string>('search', { default: '' })
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <UInput
      v-model="search"
      :placeholder="props.placeholder"
      icon="i-lucide-search"
      :loading="props.loading"
      class="w-full sm:max-w-xs"
    >
      <template
        v-if="search.length"
        #trailing
      >
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="link"
          aria-label="Limpiar búsqueda"
          @click="search = ''"
        />
      </template>
    </UInput>

    <div class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
