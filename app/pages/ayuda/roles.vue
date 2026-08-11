<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Roles · Cómo funciona' })
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Roles
    </h1>
    <p class="mt-3 text-muted">
      Un conjunto de permisos con nombre, para no repetir la misma combinación módulo × acción usuario por
      usuario. Aquí solo se administran sus datos (nombre, descripción); qué puede hacer se configura en
      <NuxtLink
        to="/ayuda/permisos-por-rol"
        class="text-primary underline"
      >Permisos por rol</NuxtLink>.
    </p>

    <ul class="mt-6 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        Asignarle un rol a alguien no le copia los permisos: el usuario sigue leyendo lo que el rol tenga
        configurado en cada momento, no una foto de cómo estaba el día que se lo asignaron.
      </li>
      <li>
        Enviar un rol a la papelera <strong>no</strong> le quita el rol a sus usuarios — solo deja de darles
        permisos mientras esté ahí. Restaurarlo se los devuelve a todos de una vez, sin tener que reasignar a
        nadie.
      </li>
    </ul>
  </HelpDocsPage>
</template>
