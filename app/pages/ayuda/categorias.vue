<script setup lang="ts">
import type { HelpNextStep } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Categorías de acciones · Cómo funciona' })

const SIGUIENTE: HelpNextStep[] = [
  {
    label: 'Acciones',
    description: 'Las que se reparten en estos bloques, y dónde se les asigna la categoría.',
    to: '/ayuda/acciones',
    icon: 'i-lucide-list-checks'
  },
  {
    label: 'Permisos por rol',
    description: 'La pantalla donde se ve el efecto de todo esto.',
    to: '/ayuda/permisos-por-rol',
    icon: 'i-lucide-shield-check'
  }
]
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Categorías de acciones
    </h1>
    <p class="mt-3 text-muted">
      Los bloques en los que se reparten las
      <NuxtLink
        to="/ayuda/acciones"
        class="text-primary underline"
      >acciones</NuxtLink> dentro de cada tarjeta de módulo, para que la matriz de permisos no sea una lista plana
      e interminable de verbos.
    </p>

    <HelpTakeaway
      :items="[
        'Es **solo organización visual**: no concede ni quita nada.',
        'Cada categoría se convierte en la **cabecera de un bloque** dentro de cada tarjeta de módulo.',
        'El **orden** decide en qué posición aparece el bloque; el más bajo, primero.',
        'Eliminar una categoría **no borra sus acciones**: caen en «Otras acciones».'
      ]"
    />

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Para qué sirven
    </h2>
    <p class="mt-2 text-sm text-muted">
      Un módulo puede tener quince acciones. Sin agrupar es una lista donde hay que leerlo todo para encontrar
      una; agrupadas, se va directo al bloque:
    </p>

    <HelpMockupFrame
      title="El mismo módulo, sin categorías y con ellas"
      caption="A la derecha no hay ni una acción más ni una menos: es exactamente la misma lista, repartida por lo que hace cada cosa."
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg border border-default bg-default p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
            Sin categorías
          </p>
          <div class="mt-3 space-y-2">
            <USwitch
              v-for="accion in ['Listar', 'Leer', 'Crear', 'Actualizar', 'Eliminar', 'Restaurar']"
              :key="accion"
              :model-value="false"
              :label="accion"
            />
          </div>
        </div>

        <div class="rounded-lg border border-default bg-default p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
            Con categorías
          </p>
          <div class="mt-3 space-y-4">
            <div
              v-for="bloque in [
                { icon: 'i-lucide-eye', label: 'Consulta', desc: 'Ver y extraer información', acciones: ['Listar', 'Leer'] },
                { icon: 'i-lucide-pencil', label: 'Gestión', desc: 'Crear y modificar registros', acciones: ['Crear', 'Actualizar'] },
                { icon: 'i-lucide-undo-2', label: 'Recuperación', desc: 'Devolver desde la papelera', acciones: ['Restaurar'] }
              ]"
              :key="bloque.label"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="bloque.icon"
                  class="size-4 shrink-0 text-dimmed"
                />
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide text-muted">
                    {{ bloque.label }}
                  </p>
                  <p class="text-xs text-dimmed">
                    {{ bloque.desc }}
                  </p>
                </div>
              </div>
              <div class="mt-2 space-y-2 ps-6">
                <USwitch
                  v-for="accion in bloque.acciones"
                  :key="accion"
                  :model-value="false"
                  :label="accion"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      El listado
    </h2>
    <p class="mt-2 text-sm text-muted">
      Se busca por nombre o descripción, y se ordena por posición: el mismo orden en el que los bloques aparecen
      dentro de cada módulo. Cada fila muestra el orden, el nombre con su icono, la descripción, cuántas acciones
      agrupa —con el detalle en el tooltip— y la fecha de creación.
    </p>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Agregar o editar
    </h2>
    <ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
      <li><strong class="text-highlighted">Nombre</strong> — el título del bloque, por ejemplo «Consulta».</li>
      <li><strong class="text-highlighted">Descripción</strong> — obligatoria, el subtítulo que acompaña al título.</li>
      <li><strong class="text-highlighted">Icono</strong> — cualquier nombre de la colección Lucide, con formato <code class="rounded bg-elevated px-1 py-0.5">i-lucide-nombre</code>; se puede elegir de una lista sugerida o escribir uno propio. Vacío usa uno neutro.</li>
      <li><strong class="text-highlighted">Orden</strong> — un número entero desde 0; el más bajo se muestra primero. Vacío la coloca al final.</li>
    </ul>
    <p class="mt-3 text-sm text-muted">
      El formulario incluye una vista previa de cómo quedará la cabecera del bloque, con el icono y los textos ya
      puestos.
    </p>

    <HelpMockupFrame
      title="De la categoría a la cabecera del bloque"
      caption="Lo que escribas aquí es literalmente lo que se va a leer arriba de cada grupo de interruptores, en todas las tarjetas de todos los módulos."
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg border border-default bg-default p-4">
          <div class="flex items-center gap-2">
            <HelpCalloutBadge :n="1" />
            <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
              El formulario
            </p>
          </div>
          <div class="mt-3 space-y-2">
            <UInput
              placeholder="Consulta"
              disabled
              class="w-full"
            />
            <UInput
              placeholder="Ver y extraer información"
              disabled
              class="w-full"
            />
            <UInput
              placeholder="i-lucide-eye"
              icon="i-lucide-eye"
              disabled
              class="w-full"
            />
            <UInput
              placeholder="1"
              disabled
              class="w-full"
            />
          </div>
        </div>

        <div class="rounded-lg border border-default bg-default p-4">
          <div class="flex items-center gap-2">
            <HelpCalloutBadge :n="2" />
            <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
              En la matriz de permisos
            </p>
          </div>
          <div class="mt-3">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-eye"
                class="size-4 shrink-0 text-dimmed"
              />
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-muted">
                  Consulta
                </p>
                <p class="text-xs text-dimmed">
                  Ver y extraer información
                </p>
              </div>
            </div>
            <div class="mt-3 space-y-2 ps-6">
              <USwitch
                :model-value="true"
                label="Listar"
              />
              <USwitch
                :model-value="false"
                label="Leer"
              />
            </div>
          </div>
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'Nombre, descripción, icono y orden de la categoría',
          'Se convierten en la cabecera del bloque, y debajo caen las acciones que la tengan asignada'
        ]"
      />
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Lo que conviene saber
    </h2>
    <ul class="mt-3 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        <strong class="text-highlighted">No otorga ni quita nada.</strong> Mover una acción de categoría solo
        cambia en qué bloque aparece su interruptor; quien la tenía concedida la sigue teniendo.
      </li>
      <li>
        <strong class="text-highlighted">Una categoría recién creada aparece aunque esté vacía</strong>, marcada
        como «Sin acciones todavía»: así se ve que se guardó, en lugar de quedarse dudando.
      </li>
      <li>
        <strong class="text-highlighted">Eliminar una categoría no elimina sus acciones:</strong> pasan al bloque
        «Otras acciones», al final de la tarjeta, hasta que se les asigne otra.
      </li>
      <li>
        <strong class="text-highlighted">Si dos categorías comparten el mismo orden</strong>, se desempata por
        nombre, para que la matriz no cambie de aspecto de una carga a otra.
      </li>
    </ul>

    <HelpNextSteps :links="SIGUIENTE" />
  </HelpDocsPage>
</template>
