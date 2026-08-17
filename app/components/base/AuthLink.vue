<script setup lang="ts">
/**
 * Enlace de las pantallas de acceso («Olvidé mi contraseña», «Volver al inicio»).
 *
 * Existe para que el estilo viva en un solo sitio: son tres usos repartidos en
 * tres pantallas, y tenerlo copiado significaba que cambiar el color obligaba a
 * tocar los tres archivos y a acordarse del detalle de abajo en cada uno.
 *
 * `hover:text-primary` va explícito porque `ULink` trae de serie
 * `hover:text-default`: sin repetirlo, el enlace pierde el color justo al pasarle
 * el cursor. `text-primary` es el verde del tema (ver `app/app.config.ts`), el
 * mismo que usan los enlaces de las páginas de ayuda.
 */
defineProps<{ to: string }>()
</script>

<template>
  <ULink
    :to="to"
    class="font-medium text-primary hover:text-primary underline"
  >
    <slot />
  </ULink>
</template>
