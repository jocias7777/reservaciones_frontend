<script setup lang="ts">
/**
 * La raíz existe solo como ruta; nunca se llega a pintar.
 *
 * `auth.global.ts` la intercepta y manda al acceso o a la primera pantalla que
 * la cuenta pueda abrir. Hace falta declararla igualmente porque el logo de la
 * cabecera enlaza aquí a propósito, y Vue Router avisa en cada render de los
 * enlaces que no resuelven a ninguna ruta.
 */
definePageMeta({
  layout: false
})
</script>

<template>
  <div />
</template>
