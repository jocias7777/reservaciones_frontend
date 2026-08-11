<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Permisos por rol · Cómo funciona' })
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Permisos por rol
    </h1>
    <p class="mt-3 text-muted">
      La matriz módulo × acción de un rol: qué puede hacer en cada zona del sistema. Se elige el rol, se marcan
      las casillas y se guarda.
    </p>

    <ul class="mt-6 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        Exige el permiso «Asignar permisos» de este mismo módulo, no «Listar»: así se puede dejar administrar la
        matriz sin dar acceso a la búsqueda avanzada sobre la tabla completa de asignaciones.
      </li>
      <li>
        Guardar solo toca lo que cambió: lo quitado se revoca en una sola llamada, lo agregado se concede en
        otra — no una petición por casilla.
      </li>
    </ul>
  </HelpDocsPage>
</template>
