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

    <HelpMockupFrame>
      <div class="flex flex-wrap items-center gap-3">
        <UInput
          icon="i-lucide-search"
          placeholder="Buscar..."
          disabled
          class="max-w-56"
        />
        <div class="flex items-center gap-2">
          <HelpCalloutBadge :n="1" />
          <UButton
            icon="i-lucide-archive"
            label="Papelera"
            color="neutral"
            variant="subtle"
            size="sm"
          />
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-6 rounded-lg border border-default bg-default p-3">
        <p class="text-sm text-highlighted">
          Carlos Ruiz
        </p>
        <div class="ms-auto flex items-center gap-2">
          <HelpCalloutBadge :n="2" />
          <UButton
            icon="i-lucide-archive-restore"
            color="success"
            variant="ghost"
            size="sm"
          />
        </div>
      </div>

      <div class="mt-3 flex items-center gap-2">
        <HelpCalloutBadge :n="3" />
        <UButton
          icon="i-lucide-archive-restore"
          label="Restaurar masivo (2)"
          color="success"
          size="sm"
        />
      </div>

      <HelpCalloutLegend
        :items="[
          'Botón «Papelera», junto al buscador — exige el permiso «Restaurar» de ese módulo',
          'Restaurar un registro a la vez, dentro de su papelera',
          'Restaurar varios seleccionados de una vez — permiso aparte, «Restaurar masivo»'
        ]"
      />
    </HelpMockupFrame>
  </HelpDocsPage>
</template>
