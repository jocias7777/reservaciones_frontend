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

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Cómo se usa
    </h2>
    <ol class="mt-2 list-decimal space-y-2 pl-5 text-sm text-muted">
      <li>Se elige la persona en el buscador — por nombre o correo.</li>
      <li>El resumen cuenta cuántas acciones hereda, cuántas concede y cuántas bloquea como excepción, y cuántas puede hacer en total (lo efectivo), con un botón para devolver todo a «Hereda» de una vez.</li>
      <li>Debajo, la misma matriz por módulos que en permisos por rol, pero con el control de tres estados en cada acción en vez de un simple interruptor.</li>
      <li>El pie de guardar solo aparece con cambios pendientes.</li>
    </ol>

    <HelpMockupFrame>
      <div class="rounded-lg border border-default bg-default p-4">
        <div class="flex items-center gap-2">
          <HelpCalloutBadge :n="1" />
          <UAvatar
            icon="i-lucide-user"
            size="sm"
          />
          <p class="text-sm font-medium text-highlighted">
            Ana Martínez
          </p>
          <UBadge
            label="Supervisor"
            color="neutral"
            variant="subtle"
          />
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
          <HelpCalloutBadge :n="2" />
          <div>
            <p class="text-lg font-semibold text-highlighted">
              41
            </p>
            <p class="text-xs text-muted">
              Hereda
            </p>
          </div>
          <div>
            <p class="text-lg font-semibold text-highlighted">
              4
            </p>
            <p class="text-xs text-muted">
              Concede
            </p>
          </div>
          <div>
            <p class="text-lg font-semibold text-highlighted">
              3
            </p>
            <p class="text-xs text-muted">
              Revoca
            </p>
          </div>
          <div class="ms-auto flex items-center gap-3">
            <HelpCalloutBadge :n="3" />
            <div>
              <p class="text-lg font-semibold text-highlighted">
                15
              </p>
              <p class="text-xs text-muted">
                Puede hacer en total
              </p>
            </div>
          </div>
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'La persona elegida y el rol del que hereda',
          'Cuántas acciones deja como estén, cuántas concede a mano y cuántas bloquea a mano',
          'Lo efectivo: lo que de verdad puede hacer una vez aplicadas sus excepciones sobre el rol'
        ]"
      />
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Avisos que pueden salir
    </h2>
    <ul class="mt-2 list-disc space-y-2 pl-5 text-sm text-muted">
      <li><strong class="text-highlighted">Este usuario no tiene rol</strong> — sin rol no hereda nada; lo único que le da permisos son las excepciones de esta pantalla.</li>
      <li><strong class="text-highlighted">No se pudo leer lo que otorga el rol</strong> — falta el permiso «Asignar permisos» sobre los permisos de rol; se puede seguir guardando, pero el «Hereda» de cada acción no es fiable en esa sesión.</li>
      <li><strong class="text-highlighted">Tu cuenta no puede leer las excepciones</strong> — falta el módulo <code class="rounded bg-elevated px-1 py-0.5">user_permissions</code> o el permiso «Asignar permisos» sobre él; mientras tanto solo un superadmin puede editar esta pantalla.</li>
    </ul>

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
        >Permisos por rol</NuxtLink>, con «Asignar permisos» de su propio módulo basta para todo: entrar, ver los
        catálogos y guardar.
      </li>
      <li>
        Guardar manda las excepciones tal y como quedaron en pantalla, en una sola petición: lo que volvió a
        «Hereda» deja de tener fila, y lo demás se concede o se bloquea. Entra entero o no entra nada.
      </li>
    </ul>
  </HelpDocsPage>
</template>
