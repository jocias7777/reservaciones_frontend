<script setup lang="ts">
import type { HelpNextStep } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Acciones · Cómo funciona' })

const SIGUIENTE: HelpNextStep[] = [
  {
    label: 'Categorías de acciones',
    description: 'Los bloques en los que se agrupan estas acciones dentro de cada tarjeta.',
    to: '/ayuda/categorias',
    icon: 'i-lucide-shapes'
  },
  {
    label: 'Permisos por rol',
    description: 'Donde cada acción se convierte en un interruptor que se marca.',
    to: '/ayuda/permisos-por-rol',
    icon: 'i-lucide-shield-check'
  }
]
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Acciones
    </h1>
    <p class="mt-3 text-muted">
      Lo que se puede hacer dentro de cada módulo: listar, crear, editar, eliminar, restaurar… Cada acción es el
      «qué» de un permiso, y cada interruptor de las pantallas de permisos es una de estas.
    </p>

    <!--
      Esta página explica el CATÁLOGO (código, nombre, módulo, categoría); qué
      hace cada verbo en la práctica es un tema aparte y con su propio ejemplo
      visual por acción — demasiado para una sección de esta página sin
      convertirla en dos guías a la vez.
    -->
    <NuxtLink
      to="/ayuda/glosario-de-acciones"
      class="group mt-5 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 transition-colors duration-150 hover:bg-primary/10"
    >
      <UIcon
        name="i-lucide-sparkles"
        class="size-5 shrink-0 text-primary"
      />
      <div class="min-w-0 flex-1">
        <p class="font-medium text-highlighted">
          ¿No sabes qué hace «Seleccionar» o «Eliminar permanente»?
        </p>
        <p class="mt-0.5 text-sm text-muted">
          Ver «Qué hace cada acción»: las 17 acciones del catálogo, con un ejemplo de qué cambia encendidas y
          apagadas.
        </p>
      </div>
      <UIcon
        name="i-lucide-arrow-right"
        class="size-4 shrink-0 text-dimmed transition-transform duration-150 group-hover:translate-x-0.5"
      />
    </NuxtLink>

    <HelpTakeaway
      :items="[
        'Cada acción **pertenece a un módulo**: «Crear en Usuarios» y «Crear en Roles» son dos acciones distintas.',
        'Por eso el catálogo tiene **una fila por cada par** módulo + acción, y no una fila por verbo.',
        'El **código** es lo que reconoce el sistema; el nombre visible es solo lo que se lee en pantalla.',
        'Dar de alta una acción **no restringe nada** hasta que alguna parte del sistema la comprueba.'
      ]"
    />

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Por qué hay tantas filas
    </h2>
    <p class="mt-2 text-sm text-muted">
      Al abrir el listado sorprende la cantidad: «Crear» aparece muchas veces. No están repetidas — cada una es la
      de su módulo, y se conceden por separado:
    </p>

    <HelpMockupFrame
      title="Tres acciones que se llaman «Crear»"
      caption="Son tres permisos independientes. Conceder «Crear en Usuarios» no habilita nada en Roles, y por eso el catálogo tiene que listarlas por separado."
    >
      <div class="space-y-2">
        <div
          v-for="modulo in ['Usuarios', 'Roles', 'Acciones']"
          :key="modulo"
          class="flex flex-wrap items-center gap-3 rounded-lg border border-default bg-default p-3"
        >
          <UBadge
            label="create"
            color="neutral"
            variant="subtle"
          />
          <span class="text-sm text-highlighted">Crear</span>
          <UIcon
            name="i-lucide-arrow-right"
            class="size-4 text-dimmed"
          />
          <span class="text-sm text-muted">en {{ modulo }}</span>
        </div>
      </div>
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      El listado
    </h2>
    <p class="mt-2 text-sm text-muted">
      Se busca por código, nombre o descripción. Cada fila muestra:
    </p>
    <ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
      <li><strong class="text-highlighted">Acción</strong> — nombre visible y código debajo.</li>
      <li><strong class="text-highlighted">Módulo</strong> — a cuál pertenece. Es lo que distingue dos acciones que se llaman igual.</li>
      <li><strong class="text-highlighted">Categoría</strong> — el bloque en el que aparece dentro de la tarjeta, o «Sin categoría».</li>
      <li><strong class="text-highlighted">Efecto real</strong> — «En uso» si algo la comprueba de verdad en su módulo, o «Todavía sin efecto» si nada lo hace aún.</li>
      <li><strong class="text-highlighted">Descripción</strong> — es la que se lee en el «?» del interruptor, así que vale la pena escribirla bien.</li>
    </ul>

    <HelpMockupFrame
      title="«En uso» y «Todavía sin efecto»"
      caption="Igual que con los módulos: una acción con «Todavía sin efecto» se puede marcar y desmarcar en la matriz, y no cambiará nada hasta que exista la parte del sistema que la revise."
    >
      <div class="space-y-3">
        <div class="flex flex-wrap items-center gap-3 rounded-lg border border-default bg-default p-3">
          <HelpCalloutBadge :n="1" />
          <div class="min-w-0">
            <p class="text-sm text-highlighted">
              Listar
            </p>
            <p class="text-xs text-muted">
              list · Usuarios
            </p>
          </div>
          <UBadge
            label="En uso"
            color="success"
            variant="subtle"
            class="ms-auto"
          />
        </div>

        <div class="flex flex-wrap items-center gap-3 rounded-lg border border-default bg-default p-3">
          <HelpCalloutBadge :n="2" />
          <div class="min-w-0">
            <p class="text-sm text-highlighted">
              Exportar
            </p>
            <p class="text-xs text-muted">
              export · Usuarios
            </p>
          </div>
          <UBadge
            label="Todavía sin efecto"
            color="warning"
            variant="subtle"
            class="ms-auto"
          />
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'Ya se comprueba en su módulo: marcarla o desmarcarla cambia algo de verdad',
          'Nada la comprueba todavía: existe en el catálogo, pero no bloquea nada'
        ]"
      />
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Agregar o editar
    </h2>
    <ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
      <li><strong class="text-highlighted">Código</strong> — el identificador. Solo minúsculas, números y guion bajo, empezando por letra (por ejemplo <code class="rounded bg-elevated px-1 py-0.5">bulk_update</code>).</li>
      <li><strong class="text-highlighted">Nombre visible</strong> — el que aparece junto al interruptor en la matriz.</li>
      <li><strong class="text-highlighted">Módulo</strong> — a cuál pertenece. Es lo que la convierte en un permiso concreto.</li>
      <li><strong class="text-highlighted">Categoría</strong> — obligatoria: el bloque en el que caerá dentro de la tarjeta.</li>
      <li><strong class="text-highlighted">Descripción</strong> — opcional, se muestra en el «?» junto al interruptor.</li>
    </ul>

    <UAlert
      color="neutral"
      variant="subtle"
      icon="i-lucide-lock"
      class="mt-6"
      title="El código deja de poder cambiarse"
      description="En cuanto la acción está concedida en algún permiso, su código se bloquea: es justo lo que se compara al proteger cada operación, y cambiarlo dejaría esa comprobación mirando un código que ya no existe. El sistema lo rechaza con un aviso explicando por qué."
    />

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Lo que conviene saber
    </h2>
    <ul class="mt-3 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        <strong class="text-highlighted">Una acción concedida no se puede eliminar.</strong> Primero hay que
        quitarla de los roles y usuarios que la tengan; el aviso de confirmación lo recuerda antes de intentarlo.
      </li>
      <li>
        <strong class="text-highlighted">La categoría es solo orden visual.</strong> Cambiarla mueve el
        interruptor de bloque dentro de la tarjeta y no altera ningún permiso. Ver
        <NuxtLink
          to="/ayuda/categorias"
          class="text-primary underline"
        >Categorías de acciones</NuxtLink>.
      </li>
      <li>
        <strong class="text-highlighted">Los nombres visibles de las acciones conocidas están fijados.</strong>
        «Listar», «Asignar permisos», «Delegar sin límite»… se muestran siempre igual en la matriz para que
        signifiquen lo mismo en todos los módulos, aunque en el catálogo tengan otro nombre escrito.
      </li>
    </ul>

    <HelpNextSteps :links="SIGUIENTE" />
  </HelpDocsPage>
</template>
