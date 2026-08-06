<script setup lang="ts">
/**
 * Armazón de las pantallas de alta y edición: cabecera arriba y el formulario
 * centrado debajo, en una columna estrecha para que se lea de un vistazo.
 *
 * Lo usan las nueve pantallas de formulario, así que el ancho y la separación se
 * deciden aquí una sola vez.
 */
const props = withDefaults(defineProps<{
  title: string
  description?: string
  /**
   * Ancho de la columna. El de usuario es el único que necesita más sitio: lleva
   * dos bloques (cuenta y perfil) en vez de uno.
   */
  width?: 'md' | 'lg'
}>(), {
  description: undefined,
  width: 'md'
})
</script>

<template>
  <UContainer class="py-6">
    <div
      class="mx-auto w-full space-y-4"
      :class="props.width === 'lg' ? 'max-w-3xl' : 'max-w-2xl'"
    >
      <BasePageHeader
        :title="props.title"
        :description="props.description"
      >
        <template #actions>
          <slot name="actions" />
        </template>
      </BasePageHeader>

      <slot />
    </div>
  </UContainer>
</template>
