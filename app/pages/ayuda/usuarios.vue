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
  </HelpDocsPage>
</template>
