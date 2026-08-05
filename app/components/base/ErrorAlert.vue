<script setup lang="ts">
/**
 * Aviso de que una carga falló, con el mensaje real del backend y un botón para
 * reintentar. Aparece en todos los listados y detalles, así que vive aquí en
 * lugar de repetirse en cada pantalla.
 */
const props = defineProps<{
  error: unknown
  title: string
}>()

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <UAlert
    v-if="props.error"
    color="error"
    variant="subtle"
    icon="i-lucide-circle-alert"
    :title="props.title"
    :description="apiErrorMessage(props.error)"
    :actions="[{
      label: 'Reintentar',
      color: 'error',
      variant: 'outline',
      onClick: () => emit('retry')
    }]"
  />
</template>
