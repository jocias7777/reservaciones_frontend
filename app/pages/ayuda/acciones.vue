<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Acciones · Cómo funciona' })
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Acciones
    </h1>
    <p class="mt-3 text-muted">
      Los verbos que se pueden hacer sobre un módulo: listar, crear, editar, eliminar, restaurar, asignar... Cada
      permiso es la combinación de un módulo con una acción.
    </p>

    <ul class="mt-6 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        Una acción se agrupa dentro de una
        <NuxtLink
          to="/ayuda/categorias"
          class="text-primary underline"
        >categoría</NuxtLink>, solo para ordenar la lista al momento de armar la matriz de permisos.
      </li>
      <li>
        Igual que con los módulos, dar de alta una acción aquí no restringe nada: solo cuenta cuando el backend la
        comprueba de verdad en una ruta.
      </li>
    </ul>
  </HelpDocsPage>
</template>
