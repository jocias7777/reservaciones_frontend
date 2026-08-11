<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Papelera y restaurar · Cómo funciona' })
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Papelera y restaurar
    </h1>
    <p class="mt-3 text-muted">
      Eliminar en Usuarios, Roles, Acciones y Categorías es borrado lógico: el registro no desaparece, pasa a su
      papelera y se puede recuperar desde ahí.
    </p>

    <div class="mt-6 space-y-4">
      <div class="rounded-lg border border-default p-4">
        <p class="font-medium text-highlighted">
          Restaurar
        </p>
        <p class="mt-1 text-sm text-muted">
          Recupera un registro a la vez, desde la papelera de su módulo. Requiere el permiso «Restaurar» de ese
          módulo — sin él, ni el botón de papelera ni el de restaurar aparecen.
        </p>
      </div>
      <div class="rounded-lg border border-default p-4">
        <p class="font-medium text-highlighted">
          Restaurar masivo
        </p>
        <p class="mt-1 text-sm text-muted">
          Recupera varios registros seleccionados a la vez. Es un permiso aparte de «Restaurar»: se puede tener
          uno sin el otro, y el botón de restauración masiva solo aparece con este permiso concedido.
        </p>
      </div>
    </div>

    <ul class="mt-6 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        Eliminar (borrado lógico) y eliminar permanente son cosas distintas: lo primero manda a la papelera, lo
        segundo la vacía sin vuelta atrás.
      </li>
    </ul>
  </HelpDocsPage>
</template>
