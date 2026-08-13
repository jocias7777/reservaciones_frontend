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

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      El listado
    </h2>
    <p class="mt-2 text-sm text-muted">
      Se busca por correo o nombre de usuario, y se filtra por estado con el desplegable de la barra de
      herramientas: todos, solo activos o solo inactivos.
    </p>
    <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-muted">
      <li><strong class="text-highlighted">Usuario</strong> — foto, nombre (o usuario, o correo si no hay perfil) y correo debajo.</li>
      <li><strong class="text-highlighted">Rol</strong> — el rol asignado, o «Sin rol» si no tiene.</li>
      <li><strong class="text-highlighted">Estado</strong> — «Activo» o «Inactivo».</li>
      <li><strong class="text-highlighted">Creado</strong> — fecha de alta de la cuenta.</li>
    </ul>
    <p class="mt-3 text-sm text-muted">
      Con varias cuentas seleccionadas aparece «Eliminar (N)» para mandarlas todas a la papelera de una vez, con
      su propia confirmación.
    </p>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Agregar o editar
    </h2>
    <p class="mt-2 text-sm text-muted">
      El formulario se reparte en dos tarjetas.
    </p>
    <p class="mt-4 text-sm font-medium text-highlighted">
      Cuenta — con qué inicia sesión
    </p>
    <ul class="mt-2 list-disc space-y-2 pl-5 text-sm text-muted">
      <li><strong class="text-highlighted">Correo</strong> — obligatorio, con formato válido.</li>
      <li><strong class="text-highlighted">Nombre de usuario</strong> — opcional.</li>
      <li><strong class="text-highlighted">Contraseña</strong> — obligatoria al crear (mínimo 8 caracteres); al editar se deja vacía para conservar la actual.</li>
      <li><strong class="text-highlighted">Rol</strong> — se elige de un buscador; «Sin rol asignado» es una opción explícita.</li>
      <li><strong class="text-highlighted">Cuenta activa</strong> — el interruptor que decide si puede iniciar sesión, sin tocar el rol.</li>
    </ul>
    <p class="mt-4 text-sm font-medium text-highlighted">
      Perfil — datos personales, todos opcionales
    </p>
    <ul class="mt-2 list-disc space-y-2 pl-5 text-sm text-muted">
      <li>Nombre, apellidos, teléfono (solo números, espacios y <code class="rounded bg-elevated px-1 py-0.5">+ ( ) -</code>) y dirección.</li>
      <li>Fecha de nacimiento — la edad se calcula sola, no se escribe a mano.</li>
      <li>Foto — se recorta en cuadrado y se comprime en el propio navegador antes de guardarse; no hay endpoint de subida de archivos todavía.</li>
    </ul>

    <HelpMockupFrame>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg border border-default bg-default p-4">
          <div class="flex items-center gap-2">
            <HelpCalloutBadge :n="1" />
            <p class="text-sm font-semibold text-highlighted">
              Cuenta
            </p>
          </div>
          <div class="mt-3 space-y-2">
            <UInput
              placeholder="ana.martinez@empresa.com"
              disabled
              class="w-full"
            />
            <UInput
              placeholder="••••••••"
              disabled
              class="w-full"
            />
            <UInput
              placeholder="Supervisor"
              icon="i-lucide-shield"
              disabled
              class="w-full"
            />
            <USwitch
              :model-value="true"
              label="Cuenta activa"
            />
          </div>
        </div>

        <div class="rounded-lg border border-default bg-default p-4">
          <div class="flex items-center gap-2">
            <HelpCalloutBadge :n="2" />
            <p class="text-sm font-semibold text-highlighted">
              Perfil
            </p>
          </div>
          <div class="mt-3 flex items-start gap-3">
            <UAvatar
              icon="i-lucide-user"
              size="lg"
            />
            <div class="min-w-0 flex-1 space-y-2">
              <UInput
                placeholder="Ana"
                disabled
                class="w-full"
              />
              <UInput
                placeholder="Martínez"
                disabled
                class="w-full"
              />
              <UInput
                placeholder="+52 55 1234 5678"
                disabled
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'Cuenta — con qué inicia sesión y qué rol tiene; sin esto no entra al sistema',
          'Perfil — sus datos personales, todos opcionales: la cuenta funciona igual sin ellos'
        ]"
      />
    </HelpMockupFrame>

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
