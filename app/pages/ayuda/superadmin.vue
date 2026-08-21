<script setup lang="ts">
import type { HelpNextStep, HelpRow } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({
  title: 'El superadmin · Cómo funciona',
  description: 'Qué es el rol superadmin, qué puede hacer, y en qué se diferencia de un administrador con muchos permisos.'
})

/**
 * Qué puede cada uno de los tres perfiles que la gente confunde.
 *
 * El malentendido de siempre es creer que «superadmin» es solo un rol con todas
 * las casillas marcadas. No lo es: un rol con todo marcado sigue pasando por los
 * límites de la delegación, y superadmin no. Esta tabla es la forma más corta de
 * enseñar esa diferencia.
 */
const COMPARATIVA: HelpRow[] = [
  {
    cells: [
      'Usar cualquier pantalla del sistema',
      { label: 'Sí, siempre', tone: 'success' },
      { label: 'Solo lo marcado', tone: 'warning' },
      { label: 'Solo lo marcado', tone: 'warning' }
    ]
  },
  {
    cells: [
      'Que le afecte una excepción de usuario',
      { label: 'No', tone: 'success' },
      { label: 'Sí', tone: 'warning' },
      { label: 'Sí', tone: 'warning' }
    ]
  },
  {
    cells: [
      'Repartir una acción que él mismo no posee',
      { label: 'Sí', tone: 'success' },
      { label: 'Sí', tone: 'success' },
      { label: 'No', tone: 'error' }
    ],
    note: 'Solo puede delegar lo que ya tiene'
  },
  {
    cells: [
      'Editar los permisos de su propio rol',
      { label: 'Sí', tone: 'success' },
      { label: 'Sí', tone: 'success' },
      { label: 'No', tone: 'error' }
    ]
  },
  {
    cells: [
      'Tocar el rol superadmin, o a quien lo tenga',
      { label: 'Sí', tone: 'success' },
      { label: 'Sí', tone: 'success' },
      { label: 'No', tone: 'error' }
    ]
  },
  {
    cells: [
      'Quedarse sin permisos si su rol va a la papelera',
      { label: 'Sí', tone: 'warning' },
      { label: 'Sí', tone: 'warning' },
      { label: 'Sí', tone: 'warning' }
    ],
    note: 'Nadie se salva de esto'
  }
]

const SIGUIENTE: HelpNextStep[] = [
  {
    label: 'Límites al dar permisos',
    description: 'Las cuatro reglas que se saltan el superadmin y «Delegar sin límite», explicadas una por una.',
    to: '/ayuda/limites-al-dar-permisos',
    icon: 'i-lucide-shield-alert'
  },
  {
    label: 'Permisos por rol',
    description: 'Dónde se arma un rol de administrador normal, casilla por casilla.',
    to: '/ayuda/permisos-por-rol',
    icon: 'i-lucide-shield-check'
  }
]
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      El superadmin
    </h1>
    <p class="mt-3 text-muted">
      Hay un rol con un trato especial: el que se llama exactamente
      <code class="rounded bg-elevated px-1 py-0.5">superadmin</code>. Quien lo tenga se salta el sistema de
      permisos entero.
    </p>

    <HelpTakeaway
      :items="[
        'Es **un rol con un nombre concreto**, no un interruptor ni una casilla: se reconoce por llamarse «superadmin».',
        'Se salta **las tres preguntas**: puede todo, en todos los módulos, sin que se le mire ni el rol ni las excepciones.',
        'También se salta **los límites al repartir permisos**: es el único que puede tocar su propio rol y el rol superadmin.',
        'Si su rol va **a la papelera**, deja de valer: el privilegio depende de que el rol siga vigente.',
        'No es lo mismo que **un rol con todo marcado**: ese sigue estando sujeto a los límites de la delegación.'
      ]"
    />

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Qué significa «se salta el sistema»
    </h2>
    <p class="mt-2 text-sm text-muted">
      Al comprobar si alguien puede hacer algo, la primera de las
      <NuxtLink
        to="/ayuda"
        class="text-primary underline"
      >tres preguntas</NuxtLink> es si su rol se llama «superadmin». Si la respuesta es sí, se autoriza y no se
      pregunta nada más: no se consultan sus permisos de rol, ni sus excepciones de usuario. Da igual que alguien
      le haya puesto un «Bloquear» en una acción — no se llega a mirar.
    </p>

    <HelpMockupFrame
      title="El mismo bloqueo, en dos personas distintas"
      caption="A la izquierda, la comprobación normal: la excepción decide. A la derecha, la misma excepción no se llega a consultar porque el rol ya respondió en el primer paso."
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg border border-default bg-default p-4">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-circle-user"
              class="size-5 shrink-0 text-dimmed"
            />
            <p class="text-sm font-medium text-highlighted">
              Ana · rol «Supervisor»
            </p>
          </div>
          <ul class="mt-3 space-y-1.5 text-sm text-muted">
            <li>Su rol concede «Eliminar en Usuarios»</li>
            <li>Tiene una excepción: <strong class="text-highlighted">Bloquear</strong></li>
          </ul>
          <div class="mt-3 border-t border-default pt-3">
            <UBadge
              label="No puede eliminar"
              color="error"
              variant="subtle"
            />
          </div>
        </div>

        <div class="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-crown"
              class="size-5 shrink-0 text-warning"
            />
            <p class="text-sm font-medium text-highlighted">
              Luis · rol «superadmin»
            </p>
          </div>
          <ul class="mt-3 space-y-1.5 text-sm text-muted">
            <li>Su rol no concede «Eliminar en Usuarios»</li>
            <li>Tiene una excepción: <strong class="text-highlighted">Bloquear</strong></li>
          </ul>
          <div class="mt-3 border-t border-default pt-3">
            <UBadge
              label="Sí puede eliminar"
              color="success"
              variant="subtle"
            />
            <p class="mt-2 text-xs text-dimmed">
              Ni el rol ni la excepción se llegan a consultar
            </p>
          </div>
        </div>
      </div>
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Superadmin, administrador y el resto
    </h2>
    <p class="mt-2 text-sm text-muted">
      La confusión más común es pensar que basta con crear un rol y marcarle todas las casillas. No es lo mismo:
      ese rol podrá usar todas las pantallas, pero seguirá teniendo prohibido lo que
      <NuxtLink
        to="/ayuda/limites-al-dar-permisos"
        class="text-primary underline"
      >los límites al dar permisos</NuxtLink> le prohíben a cualquiera.
    </p>

    <HelpMockupFrame
      title="Qué puede cada uno"
      caption="La columna del medio —«Delegar sin límite»— es una acción del catálogo que se concede como cualquier otra, y que levanta los límites de la delegación sin dar acceso a nada más. Es lo más parecido a un superadmin que se puede armar desde las pantallas."
    >
      <HelpOutcomeTable
        :columns="['Comportamiento', 'superadmin', 'Con «Delegar sin límite»', 'Administrador normal']"
        :rows="COMPARATIVA"
      />
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Cosas que sorprenden
    </h2>
    <ul class="mt-3 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        <strong class="text-highlighted">Se reconoce por el nombre del rol.</strong> No hay una casilla
        «es superadmin» en ninguna parte: lo que se comprueba es que el rol se llame exactamente
        <code class="rounded bg-elevated px-1 py-0.5">superadmin</code>. Renombrarlo le quita el privilegio a
        todos sus usuarios de golpe.
      </li>
      <li>
        <strong class="text-highlighted">Mandar el rol a la papelera lo desactiva.</strong> Un rol eliminado no
        concede nada, y este no es una excepción: sus usuarios se quedan sin permisos hasta que se restaure. Es a
        propósito — si no, eliminar un rol no serviría de nada justo en el rol que más importa.
      </li>
      <li>
        <strong class="text-highlighted">Un administrador normal no puede nombrar a otro superadmin.</strong>
        Asignarle a alguien ese rol está bloqueado, igual que editar sus permisos: es la puerta por la que, si no,
        cualquiera con «Actualizar» en Usuarios se ascendería a sí mismo. Solo lo pueden hacer un superadmin o
        alguien con «Delegar sin límite».
      </li>
      <li>
        <strong class="text-highlighted">Las pantallas siguen ocultándole cosas por un momento.</strong> Al
        entrar, el menú se dibuja con los permisos que el servidor publica; hasta que llegan, se muestra todo. Lo
        que decide de verdad es siempre el servidor.
      </li>
      <li>
        <strong class="text-highlighted">Por eso conviene que sea el rol de nadie en el día a día.</strong> Un
        superadmin no deja rastro de «no pudo»: todo lo que intente, lo consigue. Para administrar a diario es
        mejor un rol normal con «Asignar permisos» y, si de verdad hace falta, «Delegar sin límite».
      </li>
    </ul>

    <UAlert
      color="neutral"
      variant="subtle"
      icon="i-lucide-info"
      class="mt-8"
      title="Si te quedaste sin ningún superadmin"
      description="Desde las pantallas solo lo puede rehacer alguien con «Delegar sin límite»: nadie más puede asignar ese rol. Si el rol se mandó a la papelera, basta con restaurarlo desde Roles; si no queda nadie que pueda, hay que rehacerlo desde el servidor."
    />

    <HelpNextSteps :links="SIGUIENTE" />
  </HelpDocsPage>
</template>
