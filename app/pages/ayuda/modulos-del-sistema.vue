<script setup lang="ts">
import type { HelpNextStep } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Módulos del sistema · Cómo funciona' })

const SIGUIENTE: HelpNextStep[] = [
  {
    label: 'Acciones',
    description: 'Lo que se puede hacer dentro de cada módulo. Un módulo sin acciones no sirve de nada.',
    to: '/ayuda/acciones',
    icon: 'i-lucide-list-checks'
  },
  {
    label: 'Permisos por rol',
    description: 'Donde los módulos se convierten en las tarjetas que se marcan.',
    to: '/ayuda/permisos-por-rol',
    icon: 'i-lucide-shield-check'
  }
]
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Módulos del sistema
    </h1>
    <p class="mt-3 text-muted">
      El catálogo de las zonas del sistema sobre las que se puede dar permisos: usuarios, roles, acciones, incluso
      este mismo catálogo. Cada módulo es una tarjeta en las pantallas de permisos.
    </p>

    <HelpTakeaway
      :items="[
        'Un módulo es **una zona del sistema**, y es el «dónde» de cada permiso.',
        'Aquí solo se le pone **código y nombre**: no se concede nada.',
        'Dar de alta un módulo **no restringe nada por sí solo** hasta que alguna parte del sistema lo comprueba.',
        'La etiqueta **«Sin uso en el código»** avisa justo de eso: existe, pero todavía no protege nada.'
      ]"
    />

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Dónde se usa lo que hay aquí
    </h2>
    <p class="mt-2 text-sm text-muted">
      Cada módulo de este listado se convierte en una tarjeta plegable en «Permisos por rol» y en «Permisos por
      usuario». Su nombre es el título de la tarjeta, y su código el identificador que aparece debajo.
    </p>

    <HelpMockupFrame
      title="El mismo módulo, en las dos pantallas"
      caption="Cambiarle el nombre aquí lo cambia en todas las pantallas de permisos. Cambiarle el código, en cambio, es lo que rompería la comprobación: el código es lo que reconoce el sistema."
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg border border-default bg-default p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
            Aquí, en el catálogo
          </p>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <UBadge
              label="users"
              color="neutral"
              variant="subtle"
            />
            <span class="text-sm text-highlighted">Usuarios</span>
          </div>
        </div>

        <div class="rounded-lg border border-default bg-default p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
            Allá, en Permisos por rol
          </p>
          <div class="mt-3 flex items-center gap-3">
            <BaseIconTile icon="i-lucide-users" />
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-highlighted">
                Usuarios
              </p>
              <p class="truncate text-xs text-muted">
                users
              </p>
            </div>
          </div>
        </div>
      </div>
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      El listado
    </h2>
    <p class="mt-2 text-sm text-muted">
      Se busca por código, nombre o descripción. La tabla es sencilla a propósito —módulo, descripción y fecha de
      creación—: no hay más que administrar aquí, ni papelera ni edición en lote.
    </p>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      «Sin uso en el código»
    </h2>
    <p class="mt-2 text-sm text-muted">
      Un módulo dado de alta que todavía no proteja ninguna parte del sistema lleva esa etiqueta. Se le pueden dar
      y quitar permisos, y no pasará nada: no hay ninguna pantalla ni operación que los consulte todavía.
    </p>

    <HelpMockupFrame
      title="Los dos estados posibles"
      caption="La etiqueta no es un error ni algo que haya que arreglar desde aquí: es normal que un módulo se dé de alta antes de que exista la parte del sistema que va a proteger."
    >
      <div class="space-y-3">
        <div class="flex flex-wrap items-center gap-3 rounded-lg border border-default bg-default p-3">
          <HelpCalloutBadge :n="1" />
          <UBadge
            label="users"
            color="neutral"
            variant="subtle"
          />
          <span class="text-sm text-highlighted">Usuarios</span>
          <UBadge
            label="En uso"
            color="success"
            variant="subtle"
            class="ms-auto"
          />
        </div>

        <div class="flex flex-wrap items-center gap-3 rounded-lg border border-default bg-default p-3">
          <HelpCalloutBadge :n="2" />
          <UBadge
            label="reservations"
            color="neutral"
            variant="subtle"
          />
          <span class="text-sm text-highlighted">Reservaciones</span>
          <UBadge
            label="Sin uso en el código"
            color="warning"
            variant="subtle"
            class="ms-auto"
          />
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'Ya hay partes del sistema que exigen permiso sobre este módulo: conceder o revocar aquí cambia algo de verdad',
          'Todavía nada lo comprueba: se puede marcar y desmarcar sin que cambie nada en la práctica'
        ]"
      />
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Lo que conviene saber
    </h2>
    <ul class="mt-3 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        <strong class="text-highlighted">El código es lo que importa.</strong> Es el identificador con el que el
        sistema reconoce el módulo; el nombre es solo lo que se lee en pantalla y se puede cambiar cuando se
        quiera.
      </li>
      <li>
        <strong class="text-highlighted">Un módulo sin acciones no aparece en la matriz</strong> con nada que
        marcar. Las acciones se dan de alta en
        <NuxtLink
          to="/ayuda/acciones"
          class="text-primary underline"
        >Acciones</NuxtLink>, cada una dentro de su módulo.
      </li>
      <li>
        <strong class="text-highlighted">Hay dos módulos que administran los propios permisos:</strong>
        <code class="rounded bg-elevated px-1 py-0.5">role_permissions</code> y
        <code class="rounded bg-elevated px-1 py-0.5">user_permissions</code>. Su acción «Asignar permisos» es la
        que abre las dos pantallas de permisos, y su acción «Delegar sin límite» es la más delicada del sistema
        (ver
        <NuxtLink
          to="/ayuda/limites-al-dar-permisos"
          class="text-primary underline"
        >Límites al dar permisos</NuxtLink>).
      </li>
    </ul>

    <HelpNextSteps :links="SIGUIENTE" />
  </HelpDocsPage>
</template>
