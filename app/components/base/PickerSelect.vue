<script setup lang="ts">
/**
 * Selector con el que arrancan las pantallas de permisos: primero se elige el
 * rol o la persona y debajo aparece su matriz.
 *
 * Va suelto y centrado, sin tarjeta detrás, para que se lea como el punto de
 * partida de la pantalla y no como un filtro más. Lo comparten las dos pantallas
 * para que se comporten y se vean igual.
 */
export interface PickerItem {
  value: string
  label: string
  description?: string
  icon?: string
  avatar?: { src: string }
}

const props = withDefaults(defineProps<{
  items: PickerItem[]
  icon: string
  placeholder: string
  searchPlaceholder: string
  loading?: boolean
  disabled?: boolean
}>(), {
  loading: false,
  disabled: false
})

const selected = defineModel<string>({ default: '' })
</script>

<template>
  <div class="flex justify-center py-2">
    <USelectMenu
      v-model="selected"
      :items="props.items"
      value-key="value"
      size="xl"
      :icon="props.icon"
      :placeholder="props.placeholder"
      :search-input="{ placeholder: props.searchPlaceholder }"
      :loading="props.loading"
      :disabled="props.disabled || props.loading"
      class="w-full max-w-xl"
    />
  </div>
</template>
