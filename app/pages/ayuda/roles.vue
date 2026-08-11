<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Roles · Cómo funciona' })
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Roles
    </h1>
    <p class="mt-3 text-muted">
      Un conjunto de permisos con nombre, para no repetir la misma combinación módulo × acción usuario por
      usuario. Aquí solo se administran sus datos (nombre, descripción); qué puede hacer se configura en
      <NuxtLink
        to="/ayuda/permisos-por-rol"
        class="text-primary underline"
      >Permisos por rol</NuxtLink>.
    </p>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      El listado
    </h2>
    <p class="mt-2 text-sm text-muted">
      Se busca por nombre o descripción. Cada fila muestra el rol con su descripción, en cuántos usuarios está
      asignado ahora mismo y cuándo se creó.
    </p>
    <p class="mt-3 text-sm text-muted">
      Eliminar uno o varios roles seleccionados los manda a la papelera; el aviso de confirmación recuerda que
      sus usuarios se quedan sin rol mientras tanto.
    </p>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Agregar o editar
    </h2>
    <p class="mt-2 text-sm text-muted">
      Solo dos campos, los únicos que el backend acepta al crear un rol:
    </p>
    <ul class="mt-2 list-disc space-y-2 pl-5 text-sm text-muted">
      <li><strong class="text-highlighted">Nombre</strong> — entre 3 y 50 caracteres: letras, números, guiones o espacios (por ejemplo «recepcion» o «supervisor»).</li>
      <li><strong class="text-highlighted">Descripción</strong> — obligatoria, para qué sirve el rol.</li>
    </ul>
    <p class="mt-3 text-sm text-muted">
      Qué puede hacer el rol no se toca aquí: eso se define en
      <NuxtLink
        to="/ayuda/permisos-por-rol"
        class="text-primary underline"
      >Permisos por rol</NuxtLink>.
    </p>

    <ul class="mt-6 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        Asignarle un rol a alguien no le copia los permisos: el usuario sigue leyendo lo que el rol tenga
        configurado en cada momento, no una foto de cómo estaba el día que se lo asignaron.
      </li>
      <li>
        Enviar un rol a la papelera <strong>no</strong> le quita el rol a sus usuarios — solo deja de darles
        permisos mientras esté ahí. Restaurarlo se los devuelve a todos de una vez, sin tener que reasignar a
        nadie.
      </li>
    </ul>

    <HelpMockupFrame>
      <div class="flex flex-wrap items-center gap-6 rounded-lg border border-default bg-default p-4">
        <div class="flex items-center gap-3">
          <HelpCalloutBadge :n="1" />
          <UIcon
            name="i-lucide-shield"
            class="size-5 text-dimmed"
          />
          <div>
            <p class="text-sm font-medium text-highlighted">
              Supervisor
            </p>
            <p class="text-xs text-muted">
              Acceso de solo lectura a reportes
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <HelpCalloutBadge :n="2" />
          <UBadge
            label="12 usuarios"
            color="neutral"
            variant="subtle"
          />
        </div>

        <div class="ms-auto flex items-center gap-2">
          <HelpCalloutBadge :n="3" />
          <UButton
            icon="i-lucide-archive"
            label="Papelera"
            color="neutral"
            variant="subtle"
            size="sm"
          />
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'Nombre y descripción del rol',
          'Cuántos usuarios lo tienen asignado ahora mismo',
          'Enviarlo a la papelera no les quita el rol a esos usuarios: solo deja de darles permisos mientras esté ahí'
        ]"
      />
    </HelpMockupFrame>
  </HelpDocsPage>
</template>
