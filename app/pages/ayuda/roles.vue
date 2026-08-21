<script setup lang="ts">
import type { HelpFlowStep, HelpNextStep } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Roles · Cómo funciona' })

/**
 * Qué pasa cuando un rol se manda a la papelera y se restaura.
 *
 * Se dibuja porque en prosa suena a contradicción —«no les quita el rol pero
 * dejan de tener permisos»— y en tres cajas se entiende de una: la asignación no
 * se toca en ningún momento, lo único que cambia es si ese rol concede o no.
 */
const CICLO: HelpFlowStep[] = [
  {
    label: 'Rol «Supervisor» vigente',
    detail: 'Sus 12 usuarios pueden lo que el rol concede',
    icon: 'i-lucide-shield',
    tone: 'success'
  },
  {
    label: 'En la papelera',
    detail: 'Los 12 siguen teniéndolo asignado, pero no les da nada',
    icon: 'i-lucide-archive',
    tone: 'error',
    via: 'Eliminar'
  },
  {
    label: 'Vigente otra vez',
    detail: 'Los 12 lo recuperan de golpe, sin reasignar a nadie',
    icon: 'i-lucide-archive-restore',
    tone: 'success',
    via: 'Restaurar'
  }
]

const SIGUIENTE: HelpNextStep[] = [
  {
    label: 'Permisos por rol',
    description: 'Lo que de verdad puede hacer el rol se marca allí, no en esta pantalla.',
    to: '/ayuda/permisos-por-rol',
    icon: 'i-lucide-shield-check'
  },
  {
    label: 'Usuarios',
    description: 'Dónde se le asigna el rol a cada persona.',
    to: '/ayuda/usuarios',
    icon: 'i-lucide-circle-user'
  }
]
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Roles
    </h1>
    <p class="mt-3 text-muted">
      Un rol es un puesto de trabajo con nombre: «Supervisor», «Recepción». Sirve para no repetir la misma
      combinación de permisos persona por persona.
    </p>

    <HelpTakeaway
      :items="[
        'Aquí solo se le pone **nombre y descripción** al rol.',
        'Qué puede hacer se marca en **Permisos por rol**, en otra pantalla.',
        'Cambiar los permisos de un rol afecta **al instante** a todos los que lo tengan.',
        'Mandar un rol a la papelera **no se lo quita** a sus usuarios: solo deja de darles permisos mientras esté ahí.'
      ]"
    />

    <UAlert
      color="neutral"
      variant="subtle"
      icon="i-lucide-split"
      class="mt-6"
      title="Dos pantallas, dos cosas distintas"
      description="«Roles» crea el puesto y le pone nombre. «Permisos por rol» decide qué puede hacer ese puesto. Es la separación que más confunde al principio, y es a propósito: los permisos cambian mucho más a menudo que el nombre."
    />

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      El listado
    </h2>
    <p class="mt-2 text-sm text-muted">
      Se busca por nombre o descripción. Cada fila muestra el rol, en cuántos usuarios está asignado ahora mismo y
      cuándo se creó.
    </p>

    <HelpMockupFrame
      title="Una fila del listado"
      caption="El número de usuarios es la cifra que conviene mirar antes de tocar nada: dice a cuántas personas les va a cambiar el acceso si editas los permisos de este rol."
    >
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
          'Nombre y descripción del rol',
          'Cuántas personas lo tienen asignado ahora mismo',
          'Editar sus datos, o mandarlo a la papelera'
        ]"
      />
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Agregar o editar
    </h2>
    <p class="mt-2 text-sm text-muted">
      Solo dos campos, que son los únicos que hay que dar de alta:
    </p>
    <ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
      <li><strong class="text-highlighted">Nombre</strong> — entre 3 y 50 caracteres: letras, números, guiones o espacios (por ejemplo «recepcion» o «supervisor»).</li>
      <li><strong class="text-highlighted">Descripción</strong> — obligatoria, para qué sirve el rol. Es lo que va a leer quien lo asigne dentro de seis meses.</li>
    </ul>

    <HelpMockupFrame
      title="Dónde se hace cada cosa"
      caption="Crear el rol y darle permisos son dos pasos, y no hace falta hacerlos seguidos: se puede crear hoy y configurarlo mañana, o cambiarle los permisos mil veces sin volver a esta pantalla."
    >
      <div class="flex flex-wrap items-stretch gap-3">
        <div class="min-w-0 flex-1 rounded-lg border border-default bg-default p-4">
          <div class="flex items-center gap-2">
            <HelpCalloutBadge :n="1" />
            <p class="text-sm font-semibold text-highlighted">
              Aquí: Roles
            </p>
          </div>
          <div class="mt-3 space-y-2">
            <UInput
              placeholder="supervisor"
              disabled
              class="w-full"
            />
            <UInput
              placeholder="Acceso de solo lectura a reportes"
              disabled
              class="w-full"
            />
          </div>
        </div>

        <div class="flex items-center px-1 text-dimmed">
          <UIcon
            name="i-lucide-arrow-right"
            class="size-5"
          />
        </div>

        <div class="min-w-0 flex-1 rounded-lg border border-default bg-default p-4">
          <div class="flex items-center gap-2">
            <HelpCalloutBadge :n="2" />
            <p class="text-sm font-semibold text-highlighted">
              Allá: Permisos por rol
            </p>
          </div>
          <div class="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            <USwitch
              :model-value="true"
              label="Listar"
            />
            <USwitch
              :model-value="false"
              label="Crear"
            />
          </div>
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'En esta pantalla solo se le pone nombre y descripción al rol',
          'Qué puede hacer ese rol se marca en otra pantalla, y se puede cambiar sin volver aquí'
        ]"
      />
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Eliminar un rol
    </h2>
    <p class="mt-2 text-sm text-muted">
      Es borrado lógico: el rol pasa a la papelera y sus usuarios lo conservan asignado, pero mientras esté ahí no
      les concede nada. Es como si de repente no tuvieran rol.
    </p>

    <HelpMockupFrame
      title="El rol en la papelera, y de vuelta"
      caption="Restaurarlo se los devuelve a todos de una vez: no hay que volver a asignar a nadie ni a reconfigurar sus permisos, porque nunca se perdieron."
    >
      <HelpFlow :steps="CICLO" />
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Lo que conviene saber
    </h2>
    <ul class="mt-3 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        <strong class="text-highlighted">Asignarle un rol a alguien no le copia los permisos.</strong> El usuario
        lee lo que el rol tenga configurado en cada momento, no una foto de cómo estaba el día que se lo
        asignaron.
      </li>
      <li>
        <strong class="text-highlighted">Cambiar un rol le cambia el acceso a todos sus usuarios a la vez.</strong>
        Si son doce personas, son doce accesos. Para tocar solo a una, están las
        <NuxtLink
          to="/ayuda/permisos-por-usuario"
          class="text-primary underline"
        >excepciones por usuario</NuxtLink>.
      </li>
      <li>
        <strong class="text-highlighted">Hay un rol que no se puede tocar desde aquí:</strong> el que se llama
        <code class="rounded bg-elevated px-1 py-0.5">superadmin</code>. Ni sus permisos, ni asignárselo a nadie.
        Ver
        <NuxtLink
          to="/ayuda/superadmin"
          class="text-primary underline"
        >El superadmin</NuxtLink>.
      </li>
      <li>
        <strong class="text-highlighted">No puedes editar los permisos del rol que tú tienes puesto.</strong> Es
        uno de los
        <NuxtLink
          to="/ayuda/limites-al-dar-permisos"
          class="text-primary underline"
        >límites al dar permisos</NuxtLink>: te lo tiene que cambiar otra persona.
      </li>
    </ul>

    <HelpNextSteps :links="SIGUIENTE" />
  </HelpDocsPage>
</template>
