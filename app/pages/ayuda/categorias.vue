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

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      El listado
    </h2>
    <p class="mt-2 text-sm text-muted">
      Se busca por nombre o descripción, y se ordena por posición (<code class="rounded bg-elevated px-1 py-0.5">sort_order</code>):
      el mismo orden en el que los bloques aparecen dentro de cada módulo. Cada fila muestra el orden, el nombre
      con su icono, la descripción, cuántas acciones agrupa (con el detalle en el tooltip) y la fecha de
      creación.
    </p>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Agregar o editar
    </h2>
    <ul class="mt-2 list-disc space-y-2 pl-5 text-sm text-muted">
      <li><strong class="text-highlighted">Nombre</strong> — el título del bloque, por ejemplo «Consulta».</li>
      <li><strong class="text-highlighted">Descripción</strong> — obligatoria, el subtítulo que acompaña al título.</li>
      <li><strong class="text-highlighted">Icono</strong> — cualquier nombre de la colección Lucide, con formato <code class="rounded bg-elevated px-1 py-0.5">i-lucide-nombre</code>; se puede elegir de una lista sugerida o escribir uno propio. Vacío usa uno neutro por defecto.</li>
      <li><strong class="text-highlighted">Orden</strong> — un número entero desde 0; el más bajo se muestra primero. Vacío la coloca al final.</li>
    </ul>
    <p class="mt-3 text-sm text-muted">
      El formulario incluye una vista previa de cómo se leerá la cabecera del bloque en la matriz, con el icono y
      los textos ya puestos.
    </p>

    <ul class="mt-6 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        Es solo organización visual: no otorga ni quita nada por sí misma, ni afecta a qué puede acceder un rol o
        un usuario.
      </li>
      <li>
        Eliminar una categoría no elimina las acciones que agrupa: pasan al bloque «Otras acciones» hasta que se
        les asigne otra.
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
