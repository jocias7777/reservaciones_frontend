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

    <HelpMockupFrame>
      <div class="flex flex-wrap items-center gap-4 rounded-lg border border-default bg-default p-4">
        <HelpCalloutBadge :n="1" />
        <div>
          <p class="text-sm font-semibold text-highlighted">
            Supervisor
          </p>
          <p class="text-xs text-muted">
            12 de 92 permisos · 7 módulos · 14 acciones
          </p>
        </div>
        <UButton
          label="Marcar todo"
          color="neutral"
          variant="subtle"
          size="sm"
          class="ms-auto"
        />
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-default bg-default p-3">
        <HelpCalloutBadge :n="2" />
        <UBadge
          label="+3 conceder"
          color="success"
          variant="subtle"
        />
        <UBadge
          label="−1 revocar"
          color="error"
          variant="subtle"
        />
        <UButton
          label="Guardar cambios"
          color="primary"
          size="sm"
          class="ms-auto"
        />
      </div>

      <HelpCalloutLegend
        :items="[
          'El resumen del rol elegido: cuántos permisos tiene activos de su total, y en cuántos módulos y acciones',
          'El pie solo aparece con cambios pendientes, y separa lo que se va a conceder de lo que se va a revocar'
        ]"
      />
    </HelpMockupFrame>

    <ul class="mt-6 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        Con «Asignar permisos» de este mismo módulo basta: ni «Listar» aquí, ni el listado de módulos, acciones,
        categorías o roles. Esta pantalla pide sus catálogos con ese mismo permiso, así que se puede dejar
        administrar la matriz sin abrir de paso ninguna otra pantalla del menú.
      </li>
      <li>
        Guardar manda el cuadro completo tal y como quedó en pantalla, en una sola petición, y el servidor calcula
        la diferencia contra lo que tenía.
      </li>
      <li>
        Se guarda entero o no se guarda nada: si algo falla a media tanda, el rol se queda exactamente como
        estaba, sin la mitad de los cambios aplicados.
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
