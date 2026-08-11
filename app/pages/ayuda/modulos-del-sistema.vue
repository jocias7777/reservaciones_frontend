<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Módulos del sistema · Cómo funciona' })
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Módulos del sistema
    </h1>
    <p class="mt-3 text-muted">
      El catálogo de las zonas del sistema sobre las que se puede dar permisos —usuarios, roles, acciones,
      incluso este mismo catálogo—. Cada módulo es solo un código y un nombre.
    </p>

    <ul class="mt-6 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        Dar de alta un módulo aquí no restringe nada por sí solo: solo importa cuando alguna ruta del backend lo
        comprueba de verdad con su código. La pantalla marca con «Sin uso en el código» los que todavía no
        protegen nada.
      </li>
    </ul>
  </HelpDocsPage>
</template>
