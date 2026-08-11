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

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      El listado
    </h2>
    <p class="mt-2 text-sm text-muted">
      Se busca por código, nombre o descripción. Cada fila muestra:
    </p>
    <ul class="mt-2 list-disc space-y-2 pl-5 text-sm text-muted">
      <li><strong class="text-highlighted">Acción</strong> — nombre visible y código debajo.</li>
      <li><strong class="text-highlighted">Categoría</strong> — el bloque en el que aparece, o «Sin categoría».</li>
      <li><strong class="text-highlighted">Efecto real</strong> — en cuántos módulos la comprueba de verdad el backend (con el detalle en el tooltip), o «Todavía sin efecto» si ninguno lo hace aún.</li>
      <li><strong class="text-highlighted">Descripción</strong>.</li>
    </ul>
    <p class="mt-3 text-sm text-muted">
      Eliminar una acción concedida en algún permiso no se puede: primero hay que quitarla de ahí. El aviso de
      confirmación lo recuerda antes de intentarlo.
    </p>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Agregar o editar
    </h2>
    <ul class="mt-2 list-disc space-y-2 pl-5 text-sm text-muted">
      <li><strong class="text-highlighted">Código</strong> — lo que compara el backend (<code class="rounded bg-elevated px-1 py-0.5">require_permission(modulo, '&lt;código&gt;')</code>). Solo minúsculas, números y guion bajo, empezando por letra — por ejemplo «bulk_update». Deja de poder cambiarse en cuanto la acción esté concedida en algún permiso.</li>
      <li><strong class="text-highlighted">Nombre visible</strong> — el que aparece en la matriz.</li>
      <li><strong class="text-highlighted">Categoría</strong> — obligatoria: el bloque en el que caerá.</li>
      <li><strong class="text-highlighted">Descripción</strong> — opcional, se muestra junto al interruptor de la acción.</li>
    </ul>

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

    <HelpMockupFrame>
      <div class="flex flex-wrap items-center gap-6 rounded-lg border border-default bg-default p-4">
        <div class="flex items-center gap-2">
          <HelpCalloutBadge :n="1" />
          <UBadge
            label="restore"
            color="neutral"
            variant="subtle"
          />
        </div>
        <div class="flex items-center gap-2">
          <HelpCalloutBadge :n="2" />
          <p class="text-sm text-highlighted">
            Restaurar
          </p>
        </div>
        <div class="flex items-center gap-2">
          <HelpCalloutBadge :n="3" />
          <UIcon
            name="i-lucide-shapes"
            class="size-5 text-dimmed"
          />
          <span class="text-sm text-muted">Papelera y restauración</span>
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'Código — el identificador que usa el backend para reconocerla',
          'Nombre — lo que se muestra en las pantallas de permisos',
          'Categoría — el bloque en el que se agrupa dentro de la matriz'
        ]"
      />
    </HelpMockupFrame>
  </HelpDocsPage>
</template>
