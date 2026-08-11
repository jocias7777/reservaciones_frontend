<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Permisos por usuario · Cómo funciona' })
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Permisos por usuario
    </h1>
    <p class="mt-3 text-muted">
      Las excepciones de una persona sobre lo que le da su rol. Cada casilla tiene tres estados, no dos:
    </p>

    <HelpMockupFrame>
      <div class="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div class="flex items-center gap-3">
          <HelpCalloutBadge :n="1" />
          <UserPermissionOverrideControl
            model-value="inherit"
            :inherited="true"
            label="Editar en Roles"
          />
        </div>

        <div class="flex items-center gap-3">
          <HelpCalloutBadge :n="2" />
          <UserPermissionOverrideControl
            model-value="grant"
            :inherited="false"
            label="Editar en Roles"
          />
        </div>

        <div class="flex items-center gap-3">
          <HelpCalloutBadge :n="3" />
          <UserPermissionOverrideControl
            model-value="deny"
            :inherited="true"
            label="Editar en Roles"
          />
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'Hereda — manda lo que diga el rol, sea lo que sea',
          'Concede — puede, aunque el rol no lo dé',
          'Revoca — no puede, aunque el rol sí lo dé'
        ]"
      />
    </HelpMockupFrame>

    <ul class="mt-6 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        Es la herramienta para el caso puntual —«esta persona sí, aunque su rol no lo incluya» o al revés—, no
        para reemplazar el rol entero.
      </li>
      <li>
        Igual que en
        <NuxtLink
          to="/ayuda/permisos-por-rol"
          class="text-primary underline"
        >Permisos por rol</NuxtLink>, aquí también exige «Asignar permisos» de su propio módulo.
      </li>
    </ul>
  </HelpDocsPage>
</template>
