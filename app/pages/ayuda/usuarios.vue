<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Usuarios · Cómo funciona' })
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Usuarios
    </h1>
    <p class="mt-3 text-muted">
      Las cuentas con acceso al sistema. Cada una puede tener un rol asignado y un perfil con sus datos
      personales —nombre, teléfono, foto—, guardado aparte de la cuenta.
    </p>

    <ul class="mt-6 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        El estado activo/inactivo y el rol son cosas separadas: una cuenta inactiva no puede iniciar sesión
        aunque su rol siga vigente.
      </li>
      <li>
        El login cuenta los intentos fallidos por correo y por IP a la vez; tras varios seguidos, bloquea unos
        minutos antes de dejar reintentar.
      </li>
      <li>
        Eliminar una cuenta es borrado lógico: pasa a la papelera y se puede recuperar. Ver
        <NuxtLink
          to="/ayuda/papelera"
          class="text-primary underline"
        >Papelera y restaurar</NuxtLink>.
      </li>
    </ul>

    <HelpMockupFrame>
      <div class="flex flex-wrap items-center gap-6 rounded-lg border border-default bg-default p-4">
        <div class="flex items-center gap-3">
          <HelpCalloutBadge :n="1" />
          <UAvatar
            icon="i-lucide-user"
            size="md"
          />
          <div>
            <p class="text-sm font-medium text-highlighted">
              Ana Martínez
            </p>
            <p class="text-xs text-muted">
              ana.martinez@empresa.com
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <HelpCalloutBadge :n="2" />
          <UBadge
            label="Supervisor"
            color="neutral"
            variant="subtle"
          />
        </div>

        <div class="flex items-center gap-2">
          <HelpCalloutBadge :n="3" />
          <UBadge
            label="Activo"
            color="success"
            variant="subtle"
          />
        </div>

        <div class="ms-auto flex items-center gap-2">
          <HelpCalloutBadge :n="4" />
          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="sm"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="neutral"
            variant="ghost"
            size="sm"
          />
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'Nombre y correo de la cuenta',
          'Rol asignado — de aquí saca sus permisos',
          'Activo o inactivo, aparte del rol: inactiva no entra aunque el rol siga vigente',
          'Editar o enviar esta cuenta a la papelera'
        ]"
      />
    </HelpMockupFrame>
  </HelpDocsPage>
</template>
