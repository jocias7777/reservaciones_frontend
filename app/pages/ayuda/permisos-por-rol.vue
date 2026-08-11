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

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Cómo se usa
    </h2>
    <ol class="mt-2 list-decimal space-y-2 pl-5 text-sm text-muted">
      <li>Se elige el rol en el buscador de arriba — si hay cambios sin guardar, avisa antes de dejarte cambiar de rol.</li>
      <li>El resumen muestra cuántos permisos tiene activos de su total, en cuántos módulos y acciones, con un botón para marcarlos o quitarlos todos de golpe.</li>
      <li>Cada módulo es una tarjeta plegable, con sus acciones repartidas por categoría (Consulta, Gestión, Eliminación…) y un interruptor por acción — en rojo las que son difíciles de revertir, como eliminar en lote.</li>
      <li>El pie de guardar solo aparece con cambios pendientes, y dice cuántos se van a conceder y cuántos a revocar.</li>
    </ol>

    <ul class="mt-6 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        Exige el permiso «Asignar permisos» de este mismo módulo, no «Listar»: así se puede dejar administrar la
        matriz sin dar acceso a la búsqueda avanzada sobre la tabla completa de asignaciones.
      </li>
      <li>
        Guardar solo toca lo que cambió: lo quitado se revoca en una sola llamada, lo agregado se concede en
        otra — no una petición por casilla.
      </li>
      <li>
        Ninguna de las dos llamadas es atómica: si una combinación falla (por ejemplo, por un duplicado suelto),
        no cancela el resto del lote. El aviso dice cuántas fallaron y por qué.
      </li>
      <li>
        Guardar refresca de inmediato los permisos de quien lo hizo, para que los botones que dependen de este
        mismo rol —Agregar, Editar, Eliminar, Papelera…— reflejen el cambio sin tener que cerrar sesión.
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
