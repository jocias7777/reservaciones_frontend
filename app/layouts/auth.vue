<script setup lang="ts">
/** Layout del acceso: una sola tarjeta centrada, sin cabecera ni navegación. */
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-6 p-4 sm:p-6">
    <div class="absolute top-4 right-4">
      <UColorModeButton />
    </div>

    <div class="w-full max-w-md">
      <slot />
    </div>
  </div>
</template>
