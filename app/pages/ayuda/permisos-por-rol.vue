<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Permisos por rol · Cómo funciona' })
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Permisos por rol
    </h1>
    <p class="mt-3 text-muted">
      La matriz módulo × acción de un rol: qué puede hacer en cada zona del sistema. Se elige el rol, se marcan
      las casillas y se guarda.
    </p>

    <ul class="mt-6 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        Exige el permiso «Asignar permisos» de este mismo módulo, no «Listar»: así se puede dejar administrar la
        matriz sin dar acceso a la búsqueda avanzada sobre la tabla completa de asignaciones.
      </li>
      <li>
        Guardar solo toca lo que cambió: lo quitado se revoca en una sola llamada, lo agregado se concede en
        otra — no una petición por casilla.
      </li>
    </ul>

    <HelpMockupFrame>
      <div class="rounded-lg border border-default bg-default p-4">
        <div class="flex items-center gap-2">
          <HelpCalloutBadge :n="1" />
          <UIcon
            name="i-lucide-users"
            class="size-5 text-dimmed"
          />
          <p class="text-sm font-semibold text-highlighted">
            Usuarios
          </p>
          <UBadge
            label="2 / 3"
            color="neutral"
            variant="subtle"
            class="ms-auto"
          />
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <HelpCalloutBadge :n="2" />
          <USwitch
            :model-value="true"
            label="Listar"
          />
          <USwitch
            :model-value="true"
            label="Crear"
          />
          <USwitch
            :model-value="false"
            color="error"
            label="Eliminar"
          />
        </div>
      </div>

      <div class="mt-4 flex items-center gap-2">
        <HelpCalloutBadge :n="3" />
        <UButton
          label="Guardar cambios"
          color="primary"
          size="sm"
        />
      </div>

      <HelpCalloutLegend
        :items="[
          'Cada tarjeta es un módulo, con cuántas acciones tiene marcadas',
          'Cada interruptor es una acción de ese módulo — la roja avisa que es difícil de revertir',
          'El pie de guardar solo aplica lo que cambió desde que se abrió la pantalla'
        ]"
      />
    </HelpMockupFrame>
  </HelpDocsPage>
</template>
