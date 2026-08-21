<script setup lang="ts">
import type { HelpNextStep } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Usuarios · Cómo funciona' })

/**
 * Las tres cosas que deciden si alguien entra y qué ve, y que se confunden todo
 * el rato porque se administran en la misma pantalla.
 *
 * Van en tres cajas y no en una lista porque lo que hay que entender es que son
 * independientes: cada una puede fallar por su cuenta, y el síntoma es distinto
 * en cada caso.
 */
const TRES_COSAS = [
  {
    icon: 'i-lucide-key-round',
    title: 'Correo y contraseña',
    detail: 'Con qué se identifica. Sin esto no llega ni a la pantalla de inicio.',
    fail: 'Si falla: no puede iniciar sesión.'
  },
  {
    icon: 'i-lucide-toggle-right',
    title: 'Cuenta activa',
    detail: 'Un interruptor aparte del rol. Desactivarla cierra la puerta sin borrar nada ni tocar sus permisos.',
    fail: 'Si está apagado: no entra, aunque su rol siga vigente.'
  },
  {
    icon: 'i-lucide-shield',
    title: 'Rol asignado',
    detail: 'De dónde saca lo que puede hacer una vez dentro.',
    fail: 'Si no tiene: entra, pero no puede hacer casi nada.'
  }
]

const SIGUIENTE: HelpNextStep[] = [
  {
    label: 'Permisos por usuario',
    description: 'Excepciones sobre lo que le da su rol, para una persona concreta.',
    to: '/ayuda/permisos-por-usuario',
    icon: 'i-lucide-user-round-cog'
  },
  {
    label: 'Roles',
    description: 'De dónde salen los roles que aparecen en el desplegable de esta pantalla.',
    to: '/ayuda/roles',
    icon: 'i-lucide-shield'
  }
]
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Usuarios
    </h1>
    <p class="mt-3 text-muted">
      Las cuentas con acceso al sistema. Cada una puede tener un rol asignado y un perfil con sus datos
      personales —nombre, teléfono, foto—, que se guarda aparte de la cuenta.
    </p>

    <HelpTakeaway
      :items="[
        'La **cuenta** es con lo que entra; el **perfil** son sus datos y es todo opcional.',
        '**Activa** y **rol** son cosas independientes: una cuenta inactiva no entra aunque su rol esté perfecto.',
        'El rol se elige aquí, pero **lo que ese rol permite** se configura en Permisos por rol.',
        'Eliminar una cuenta la manda a la **papelera**: no se pierde y se puede recuperar.'
      ]"
    />

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Tres cosas que se confunden
    </h2>
    <p class="mt-2 text-sm text-muted">
      «No puede entrar» y «entra pero no ve nada» son problemas distintos, y se arreglan en sitios distintos:
    </p>

    <div class="mt-4 grid gap-3 sm:grid-cols-3">
      <div
        v-for="cosa in TRES_COSAS"
        :key="cosa.title"
        class="rounded-lg border border-default bg-default p-4"
      >
        <p class="flex items-center gap-2 font-medium text-highlighted">
          <UIcon
            :name="cosa.icon"
            class="size-4 shrink-0 text-dimmed"
          />
          {{ cosa.title }}
        </p>
        <p class="mt-2 text-sm text-muted">
          {{ cosa.detail }}
        </p>
        <p class="mt-2 border-t border-default pt-2 text-xs text-dimmed">
          {{ cosa.fail }}
        </p>
      </div>
    </div>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      El listado
    </h2>
    <p class="mt-2 text-sm text-muted">
      Se busca por correo o nombre de usuario, y se filtra por estado desde la barra de herramientas: todos, solo
      activos o solo inactivos. Con varias cuentas seleccionadas aparece «Eliminar (N)» para mandarlas todas a la
      papelera de una vez.
    </p>

    <HelpMockupFrame
      title="Una fila del listado"
      caption="El rol y el estado se leen juntos pero no dependen uno del otro: una cuenta puede estar inactiva con un rol potente, o activa y sin ningún rol."
    >
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
          'Foto, nombre y correo. Si no hay perfil, se muestra el usuario o el correo',
          'Rol asignado, o «Sin rol» — de aquí saca sus permisos',
          'Activa o inactiva: si está inactiva no entra, tenga el rol que tenga',
          'Editar la cuenta, o mandarla a la papelera'
        ]"
      />
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Agregar o editar
    </h2>
    <p class="mt-2 text-sm text-muted">
      El formulario se reparte en dos tarjetas, y solo la primera es obligatoria.
    </p>

    <p class="mt-5 text-sm font-medium text-highlighted">
      Cuenta — con qué inicia sesión
    </p>
    <ul class="mt-2 list-disc space-y-2 pl-5 text-sm text-muted">
      <li><strong class="text-highlighted">Correo</strong> — obligatorio, con formato válido.</li>
      <li><strong class="text-highlighted">Nombre de usuario</strong> — opcional.</li>
      <li><strong class="text-highlighted">Contraseña</strong> — obligatoria al crear (mínimo 8 caracteres). Al editar se deja vacía para conservar la actual.</li>
      <li><strong class="text-highlighted">Rol</strong> — se elige de un buscador; «Sin rol asignado» es una opción explícita, no un olvido.</li>
      <li><strong class="text-highlighted">Cuenta activa</strong> — el interruptor que decide si puede iniciar sesión, sin tocar el rol.</li>
    </ul>

    <p class="mt-5 text-sm font-medium text-highlighted">
      Perfil — datos personales, todos opcionales
    </p>
    <ul class="mt-2 list-disc space-y-2 pl-5 text-sm text-muted">
      <li>Nombre, apellidos, teléfono (solo números, espacios y <code class="rounded bg-elevated px-1 py-0.5">+ ( ) -</code>) y dirección.</li>
      <li>Fecha de nacimiento — la edad se calcula sola, no se escribe a mano.</li>
      <li>Foto — se recorta en cuadrado y se comprime en el propio navegador antes de guardarse.</li>
    </ul>

    <HelpMockupFrame
      title="Las dos tarjetas del formulario"
      caption="Sin perfil la cuenta funciona igual: el perfil solo cambia cómo se ve la persona en los listados. Sin cuenta, en cambio, no hay nada."
    >
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

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Lo que conviene saber
    </h2>
    <ul class="mt-3 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        <strong class="text-highlighted">Cambiarle el rol a alguien es concederle todo lo que ese rol
          otorga</strong>, así que pasa por los mismos
        <NuxtLink
          to="/ayuda/limites-al-dar-permisos"
          class="text-primary underline"
        >límites</NuxtLink> que la matriz de permisos: no puedes moverla a un rol con cosas que tú no tienes, ni
        cambiarte el rol a ti mismo, ni asignar el rol superadmin.
      </li>
      <li>
        <strong class="text-highlighted">Desactivar la cuenta es lo más rápido para cortar el acceso</strong> sin
        perder nada: se conserva el rol, el perfil y el historial, y basta volver a encenderla para restablecerlo
        todo.
      </li>
      <li>
        <strong class="text-highlighted">El login se protege solo.</strong> Cuenta los intentos fallidos por
        correo y por IP a la vez; tras varios seguidos bloquea unos minutos antes de dejar reintentar.
      </li>
      <li>
        <strong class="text-highlighted">Eliminar una cuenta es borrado lógico:</strong> pasa a la papelera y se
        puede recuperar tal cual estaba. Ver
        <NuxtLink
          to="/ayuda/papelera"
          class="text-primary underline"
        >Papelera y restaurar</NuxtLink>.
      </li>
    </ul>

    <HelpNextSteps :links="SIGUIENTE" />
  </HelpDocsPage>
</template>
