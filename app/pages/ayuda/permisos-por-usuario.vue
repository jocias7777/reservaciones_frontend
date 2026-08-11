<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Permisos por usuario · Cómo funciona' })
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Permisos por usuario
    </h1>
    <p class="mt-3 text-muted">
      Las excepciones de una persona sobre lo que le da su rol. Cada casilla tiene tres estados, no dos:
    </p>

    <div class="mt-4 flex flex-wrap gap-2">
      <UBadge
        label="Hereda — manda el rol"
        color="neutral"
        variant="subtle"
      />
      <UBadge
        label="Concede — puede, aunque el rol no lo dé"
        color="success"
        variant="subtle"
      />
      <UBadge
        label="Revoca — no puede, aunque el rol sí lo dé"
        color="error"
        variant="subtle"
      />
    </div>

    <ul class="mt-6 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        Es la herramienta para el caso puntual —«esta persona sí, aunque su rol no lo incluya» o al revés—, no
        para reemplazar el rol entero.
      </li>
      <li>
        Igual que en
        <NuxtLink
          to="/ayuda/permisos-por-rol"
          class="text-primary underline"
        >Permisos por rol</NuxtLink>, aquí también exige «Asignar permisos» de su propio módulo.
      </li>
    </ul>
  </HelpDocsPage>
</template>
