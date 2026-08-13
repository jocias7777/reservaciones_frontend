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

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      El listado
    </h2>
    <p class="mt-2 text-sm text-muted">
      Se busca por código, nombre o descripción. La tabla es sencilla a propósito: módulo, descripción y fecha de
      creación — no hay más que administrar aquí, ni papelera ni edición en lote.
    </p>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      «Sin uso en el código»
    </h2>
    <p class="mt-2 text-sm text-muted">
      La pantalla pide al backend en qué módulos comprueba de verdad alguna acción
      (<code class="rounded bg-elevated px-1 py-0.5">GET /permissions/available-actions</code>) y compara ese
      resultado con el catálogo. Un módulo dado de alta que no aparezca ahí lleva esa etiqueta: se puede conceder
      y revocar sin que nada cambie en la práctica, hasta que alguna ruta lo proteja con
      <code class="rounded bg-elevated px-1 py-0.5">require_permission('&lt;código&gt;', ...)</code>.
    </p>

    <HelpMockupFrame>
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
          'Alguna ruta del backend ya exige permiso sobre este módulo: conceder o revocar aquí cambia algo de verdad',
          'Todavía ninguna ruta lo comprueba: se puede marcar y desmarcar sin que nada cambie en la práctica'
        ]"
      />
    </HelpMockupFrame>

    <ul class="mt-6 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        Dar de alta un módulo aquí no restringe nada por sí solo: solo importa cuando alguna ruta del backend lo
        comprueba de verdad con su código. La pantalla marca con «Sin uso en el código» los que todavía no
        protegen nada.
      </li>
    </ul>

    <HelpMockupFrame>
      <div class="flex flex-wrap items-center gap-6 rounded-lg border border-default bg-default p-4">
        <div class="flex items-center gap-2">
          <HelpCalloutBadge :n="1" />
          <UBadge
            label="users"
            color="neutral"
            variant="subtle"
          />
        </div>
        <div class="flex items-center gap-2">
          <HelpCalloutBadge :n="2" />
          <p class="text-sm text-highlighted">
            Usuarios
          </p>
        </div>
        <div class="flex items-center gap-2">
          <HelpCalloutBadge :n="3" />
          <UBadge
            label="En uso"
            color="success"
            variant="subtle"
          />
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'Código — el identificador que usa el backend para reconocerlo',
          'Nombre — lo que se muestra en las pantallas de permisos',
          'Si ya hay una ruta del backend que lo comprueba de verdad, o todavía no'
        ]"
      />
    </HelpMockupFrame>
  </HelpDocsPage>
</template>
