<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Categorías de acciones · Cómo funciona' })
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Categorías de acciones
    </h1>
    <p class="mt-3 text-muted">
      Un agrupador para las
      <NuxtLink
        to="/ayuda/acciones"
        class="text-primary underline"
      >acciones</NuxtLink>, para que la matriz de permisos no muestre una lista plana e interminable de verbos.
    </p>

    <ul class="mt-6 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        Es solo organización visual: no otorga ni quita nada por sí misma, ni afecta a qué puede acceder un rol o
        un usuario.
      </li>
      <li>
        Eliminar una categoría no elimina las acciones que agrupa; solo deja de tener sentido si ninguna acción
        la referencia.
      </li>
    </ul>

    <HelpMockupFrame>
      <div class="flex flex-wrap items-center gap-6 rounded-lg border border-default bg-default p-4">
        <div class="flex items-center gap-2">
          <HelpCalloutBadge :n="1" />
          <UIcon
            name="i-lucide-shapes"
            class="size-5 text-dimmed"
          />
          <p class="text-sm font-medium text-highlighted">
            Papelera y restauración
          </p>
        </div>
        <div class="flex items-center gap-2">
          <HelpCalloutBadge :n="2" />
          <UBadge
            label="4 acciones"
            color="neutral"
            variant="subtle"
          />
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'Nombre de la categoría, tal como aparece en la matriz de permisos',
          'Cuántas acciones agrupa ahora mismo'
        ]"
      />
    </HelpMockupFrame>
  </HelpDocsPage>
</template>
