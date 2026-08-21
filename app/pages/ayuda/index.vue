<script setup lang="ts">
import type { HelpNextStep, HelpRow } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({
  title: 'Cómo funciona',
  description: 'Guía de qué hace cada módulo del sistema y cómo se decide qué puede ver o hacer cada persona.'
})

/**
 * Las cuatro piezas con las que se construye cualquier permiso.
 *
 * Van primero porque el resto de la guía las da por sabidas: en las pantallas se
 * llaman así y quien no sepa qué es un «módulo» no entiende ni el menú. Cada una
 * dice además dónde se administra, para que la palabra tenga un sitio y no se
 * quede en abstracto.
 */
const PIEZAS = [
  {
    icon: 'i-lucide-circle-user',
    label: 'Usuario',
    what: 'Una persona con cuenta para entrar al sistema.',
    where: 'Se administra en Usuarios.',
    to: '/ayuda/usuarios'
  },
  {
    icon: 'i-lucide-shield',
    label: 'Rol',
    what: 'Un puesto con nombre —«Supervisor», «Recepción»— que agrupa permisos y se le asigna a la persona.',
    where: 'Se administra en Roles.',
    to: '/ayuda/roles'
  },
  {
    icon: 'i-lucide-box',
    label: 'Módulo',
    what: 'Una zona del sistema sobre la que se dan permisos: Usuarios, Roles, Reservaciones…',
    where: 'Se administra en Módulos del sistema.',
    to: '/ayuda/modulos-del-sistema'
  },
  {
    icon: 'i-lucide-list-checks',
    label: 'Acción',
    what: 'Algo que se puede hacer dentro de un módulo: listar, crear, eliminar, restaurar…',
    where: 'Se administra en Acciones.',
    to: '/ayuda/acciones'
  }
]

/**
 * El recorrido de las tres preguntas resuelto sobre una persona concreta.
 *
 * Es la tabla que contesta la duda más repetida —«¿por qué esta persona no puede,
 * si su rol sí lo tiene?»— y la que enseña las dos cosas que menos se esperan:
 * que una excepción le gana al rol, y que «Hereda» no significa «permitido» sino
 * «lo que diga el rol, sea lo que sea».
 */
const EJEMPLO: HelpRow[] = [
  {
    cells: ['Listar', 'Marcado', 'Hereda', { label: 'Puede', tone: 'success' }],
    note: 'Sin excepción, manda el rol'
  },
  {
    cells: ['Crear', 'Marcado', 'Bloquear', { label: 'No puede', tone: 'error' }],
    note: 'La excepción le gana al rol'
  },
  {
    cells: ['Eliminar', 'Sin marcar', 'Hereda', { label: 'No puede', tone: 'error' }],
    note: 'Sin excepción, manda el rol'
  },
  {
    cells: ['Restaurar', 'Sin marcar', 'Permitir', { label: 'Puede', tone: 'success' }],
    note: 'La excepción le gana al rol'
  }
]

/**
 * Por dónde seguir según la pregunta con la que se llega, no según el orden del
 * menú: casi nadie entra a la guía a leerla entera.
 */
const CAMINOS: HelpNextStep[] = [
  {
    label: 'Quiero que todo un puesto pueda hacer algo',
    description: 'Se marca en el rol y lo hereda todo el que lo tenga. Es la vía normal.',
    to: '/ayuda/permisos-por-rol',
    icon: 'i-lucide-shield-check'
  },
  {
    label: 'Quiero una excepción para una sola persona',
    description: 'Permitirle algo que su rol no da, o bloquearle algo que sí da.',
    to: '/ayuda/permisos-por-usuario',
    icon: 'i-lucide-user-round-cog'
  },
  {
    label: 'Me sale «no puedes conceder…» al guardar',
    description: 'Hay límites a lo que uno puede repartir. Aquí están los cuatro, con su aviso.',
    to: '/ayuda/limites-al-dar-permisos',
    icon: 'i-lucide-shield-alert'
  },
  {
    label: '¿Qué es el superadmin y qué puede hacer?',
    description: 'El rol que se salta las tres preguntas, y lo que ni él hace desde estas pantallas.',
    to: '/ayuda/superadmin',
    icon: 'i-lucide-crown'
  },
  {
    label: 'No sé qué hace «Seleccionar» o «Delegar sin límite»',
    description: 'Las 17 acciones del catálogo, con un ejemplo de qué cambia encendidas y apagadas.',
    to: '/ayuda/glosario-de-acciones',
    icon: 'i-lucide-sparkles'
  }
]
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Cómo funciona
    </h1>
    <p class="mt-3 text-muted">
      Esta guía explica qué hace cada pantalla y, sobre todo, cómo se decide qué puede ver o hacer cada persona.
      Con esta página se entiende el sistema completo; el resto son detalles de cada pantalla.
    </p>

    <HelpTakeaway
      :items="[
        'Un permiso es una frase: **un rol puede una acción en un módulo**.',
        'Lo normal es dar permisos **al rol**, no a la persona: quien tenga ese rol los hereda solo.',
        'A una persona se le pueden poner **excepciones**, y la excepción siempre le gana al rol.',
        'El rol **superadmin** se salta todo esto: puede hacer cualquier cosa.',
        'Quien reparte permisos **no puede dar lo que él no tiene**, ni tocar su propio rol.'
      ]"
    />

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Las cuatro piezas
    </h2>
    <p class="mt-2 text-sm text-muted">
      Todo el sistema de permisos se arma con estas cuatro palabras. Son las mismas que aparecen en el menú y en
      cada pantalla:
    </p>

    <div class="mt-5 grid gap-3 sm:grid-cols-2">
      <NuxtLink
        v-for="pieza in PIEZAS"
        :key="pieza.label"
        :to="pieza.to"
        class="group flex gap-3 rounded-lg border border-default bg-default p-4 transition-colors duration-150 hover:border-primary/40 hover:bg-elevated/50"
      >
        <UIcon
          :name="pieza.icon"
          class="mt-0.5 size-5 shrink-0 text-dimmed transition-colors duration-150 group-hover:text-primary"
        />
        <div class="min-w-0">
          <p class="font-medium text-highlighted">
            {{ pieza.label }}
          </p>
          <p class="mt-0.5 text-sm text-muted">
            {{ pieza.what }}
          </p>
          <p class="mt-1 text-xs text-dimmed">
            {{ pieza.where }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Un permiso es una frase
    </h2>
    <p class="mt-2 text-sm text-muted">
      Marcar una casilla en «Permisos por rol» es escribir exactamente esto:
    </p>

    <HelpMockupFrame
      title="Lo que dice una casilla marcada"
      caption="Cambia cualquiera de las tres piezas y ya es otro permiso: «Crear en Usuarios» y «Crear en Roles» no tienen nada que ver, aunque las dos se llamen «Crear»."
    >
      <HelpPermissionSentence
        subject="Supervisor"
        subject-kind="Rol"
        action="Crear"
        module="Usuarios"
      />
    </HelpMockupFrame>

    <p class="mt-4 text-sm text-muted">
      Por eso los permisos se le dan al rol y no a la persona: la frase se escribe una vez y la hereda todo el
      que tenga ese rol, ahora y en el futuro. Asignarle un rol a alguien
      <strong class="text-highlighted">no le copia</strong> los permisos: los lee del rol cada vez, así que
      cambiar el rol cambia al instante lo que pueden hacer todos sus usuarios.
    </p>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Cómo se decide, en tres preguntas
    </h2>
    <p class="mt-2 text-sm text-muted">
      Cada vez que alguien pulsa un botón, el servidor hace estas tres preguntas
      <strong class="text-highlighted">en este orden</strong> y se detiene en la primera que tenga respuesta. No
      es un resumen para la interfaz: es literalmente lo que se comprueba en cada petición.
    </p>

    <HelpDecisionFlow />

    <UAlert
      color="neutral"
      variant="subtle"
      icon="i-lucide-info"
      class="mt-6"
      title="Ocultar un botón no es la barrera"
      description="Las pantallas esconden lo que no se puede usar por comodidad, para no ofrecer algo que va a fallar. La barrera de verdad está en el servidor: vuelve a hacer estas tres preguntas en cada petición y contesta «sin permisos» si no toca, aunque alguien llegue por otro camino."
    />

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Las tres preguntas, sobre un caso real
    </h2>
    <p class="mt-2 text-sm text-muted">
      Ana tiene el rol «Supervisor». En el módulo Usuarios, ese rol concede Listar y Crear, pero no Eliminar ni
      Restaurar. Además, alguien le puso dos excepciones propias. Esto es lo que puede hacer al final:
    </p>

    <HelpMockupFrame
      title="Ana Martínez · módulo Usuarios"
      caption="Fíjate en las filas de Crear y Restaurar: la excepción decide, aunque contradiga al rol. Y «Hereda» no quiere decir «permitido» — quiere decir «lo que diga el rol», que puede ser un no."
    >
      <HelpOutcomeTable
        :columns="['Acción', 'Su rol', 'Su excepción', 'Resultado']"
        :rows="EJEMPLO"
      />
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      ¿Por dónde sigo?
    </h2>
    <p class="mt-2 text-sm text-muted">
      Según lo que hayas venido a resolver:
    </p>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <NuxtLink
        v-for="camino in CAMINOS"
        :key="camino.to"
        :to="camino.to"
        class="group flex gap-3 rounded-lg border border-default bg-default p-4 transition-colors duration-150 hover:border-primary/40 hover:bg-elevated/50"
      >
        <UIcon
          :name="camino.icon"
          class="mt-0.5 size-5 shrink-0 text-dimmed transition-colors duration-150 group-hover:text-primary"
        />
        <div class="min-w-0">
          <p class="font-medium text-highlighted">
            {{ camino.label }}
          </p>
          <p class="mt-0.5 text-sm text-muted">
            {{ camino.description }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </HelpDocsPage>
</template>
