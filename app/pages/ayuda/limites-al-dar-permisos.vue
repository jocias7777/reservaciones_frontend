<script setup lang="ts">
import type { HelpNextStep, HelpRule } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({
  title: 'Límites al dar permisos · Cómo funciona',
  description: 'Por qué a veces el guardado se rechaza aunque tengas permiso para abrir la pantalla de permisos.'
})

/**
 * Los cuatro límites de la política de delegación, con el aviso literal que
 * devuelve el servidor al toparse con cada uno.
 *
 * Salen de `app/services/permission_delegation_policy.py` del backend, y los
 * mensajes están copiados palabra por palabra: quien llega a esta página suele
 * llegar buscando la frase que acaba de ver en pantalla.
 */
const REGLAS: HelpRule[] = [
  {
    title: 'No puedes darte permisos a ti mismo',
    explanation: 'Ni directamente, en tus propias excepciones, ni por la puerta de atrás editando el rol que tú tienes puesto. El bloqueo va aunque solo estés quitando permisos: la pantalla no distingue entre lo que das y lo que quitas cuando el afectado eres tú.',
    message: 'No puedes modificar los permisos de tu propio rol',
    fix: 'Que te lo cambie otra persona con permiso para hacerlo, o un superadmin. Si eres la única, necesitas la acción «Delegar sin límite».'
  },
  {
    title: 'No puedes repartir lo que tú no tienes',
    explanation: 'Solo puedes conceder acciones que tú mismo puedes hacer ahora mismo — contando lo que te da tu rol más tus propias excepciones. Si intentas dar «Eliminar en Usuarios» y tú no lo tienes, se rechaza el guardado entero y el aviso te dice exactamente qué acciones sobraban.',
    message: 'No puedes conceder una acción que no tienes efectivamente: Usuarios · Eliminar',
    fix: 'Desmarca las acciones que menciona el aviso, o pide que primero te las concedan a ti. Los nombres del mensaje son los mismos que ves en la matriz.'
  },
  {
    title: 'El rol superadmin es intocable desde aquí',
    explanation: 'No se le pueden editar los permisos, ni se le puede asignar a nadie, ni se pueden tocar las excepciones de quien ya lo tenga. Es lo que impide que alguien se ascienda solo aprovechando que administra los permisos.',
    message: 'El rol superadmin no se puede modificar desde aquí',
    fix: 'Lo tiene que hacer un superadmin. Ver «El superadmin» para entender por qué ese rol va aparte.'
  },
  {
    title: 'Cambiarle el rol a alguien cuenta como darle todo lo del rol',
    explanation: 'Poner a una persona en el rol «Supervisor» le concede de golpe todo lo que ese rol otorga, así que pasa por el mismo límite que si se lo hubieras dado acción por acción: no puedes moverla a un rol que tenga cosas que tú no tienes. Tampoco puedes cambiarte el rol a ti mismo.',
    message: 'No puedes cambiar tu propio rol',
    fix: 'Elige un rol que no exceda lo que tú puedes hacer, o pide el cambio a alguien con más alcance. El aviso aparece al guardar el formulario de Usuarios, no en las pantallas de permisos.'
  }
]

const SIGUIENTE: HelpNextStep[] = [
  {
    label: 'El superadmin',
    description: 'El único que se salta estos cuatro límites sin más, y por qué existe.',
    to: '/ayuda/superadmin',
    icon: 'i-lucide-crown'
  },
  {
    label: 'Permisos por rol',
    description: 'La pantalla donde más aparecen estos avisos, explicada por partes.',
    to: '/ayuda/permisos-por-rol',
    icon: 'i-lucide-shield-check'
  }
]
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Límites al dar permisos
    </h1>
    <p class="mt-3 text-muted">
      Tener acceso a las pantallas de permisos no significa poder conceder cualquier cosa a cualquiera. Hay
      cuatro límites que se comprueban al guardar, y son la causa de casi todos los rechazos que salen en esas
      pantallas.
    </p>

    <HelpTakeaway
      :items="[
        'Puedes repartir **lo que tú tienes**, y nada más.',
        'No puedes tocar **tus propios permisos** ni el rol que llevas puesto.',
        'El rol **superadmin** y quien lo tenga están fuera de tu alcance.',
        'Cambiarle el rol a alguien cuenta como **darle todo lo que ese rol otorga**.',
        'La acción **«Delegar sin límite»** levanta los cuatro. Concédela solo a quien administre la seguridad.'
      ]"
    />

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Por qué existen
    </h2>
    <p class="mt-2 text-sm text-muted">
      Sin ellos, cualquiera que pudiera abrir «Permisos por usuario» sería el dueño del sistema: le bastaría con
      concederse a sí mismo todo lo que le faltara desde la misma pantalla que se supone que administra. Los
      cuatro límites existen para que administrar permisos
      <strong class="text-highlighted">no sea lo mismo que tenerlos todos</strong>.
    </p>

    <HelpMockupFrame
      title="Lo que estos límites impiden"
      caption="El intento de la izquierda es el que da nombre a todo esto: administrar los permisos de los demás no debe convertirse en el atajo para subirse los propios."
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg border border-error/30 bg-error/5 p-4">
          <p class="flex items-center gap-2 text-sm font-medium text-highlighted">
            <UIcon
              name="i-lucide-circle-slash"
              class="size-4 shrink-0 text-error"
            />
            Ascenderse a uno mismo
          </p>
          <p class="mt-2 text-sm text-muted">
            «Tengo la pantalla de permisos abierta, me marco Eliminar en todos los módulos y ya está.»
          </p>
        </div>
        <div class="rounded-lg border border-error/30 bg-error/5 p-4">
          <p class="flex items-center gap-2 text-sm font-medium text-highlighted">
            <UIcon
              name="i-lucide-circle-slash"
              class="size-4 shrink-0 text-error"
            />
            Repartir más de lo que se tiene
          </p>
          <p class="mt-2 text-sm text-muted">
            «Yo no puedo eliminar usuarios, pero se lo concedo a un compañero para que lo haga por mí.»
          </p>
        </div>
      </div>
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Los cuatro límites
    </h2>
    <p class="mt-2 text-sm text-muted">
      Cada uno con el aviso exacto que verás en pantalla si te topas con él:
    </p>

    <HelpRuleList :rules="REGLAS" />

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      «Delegar sin límite»
    </h2>
    <p class="mt-2 text-sm text-muted">
      Es una acción más del catálogo —aparece en la matriz de
      <code class="rounded bg-elevated px-1 py-0.5">role_permissions</code> y de
      <code class="rounded bg-elevated px-1 py-0.5">user_permissions</code>, y se concede como cualquier otra—,
      pero es la única que levanta los cuatro límites de arriba de golpe. Quien la tenga puede conceder cualquier
      acción del catálogo, incluidas las que él mismo no tiene, y sobre cualquier rol o usuario.
    </p>

    <UAlert
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      class="mt-4"
      title="Es la acción más delicada del sistema"
      description="Concederla no es dar un permiso más: es dar la capacidad de darse cualquier permiso. En la matriz sale marcada en rojo por eso. Debería tenerla únicamente quien administra la seguridad del sistema, y conviene que sean muy pocas personas."
    />

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Qué hacer cuando te rechaza
    </h2>
    <ol class="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
      <li>Lee el aviso: si menciona acciones concretas, son exactamente las que sobran en lo que intentaste guardar.</li>
      <li>Desmárcalas y vuelve a guardar. El resto de los cambios sí entrarán.</li>
      <li>Si de verdad hacen falta, pide que primero te las concedan a ti: en cuanto las tengas, podrás repartirlas.</li>
      <li>Si lo que estabas tocando era tu propio rol o el tuyo propio, lo tiene que hacer otra persona.</li>
    </ol>

    <UAlert
      color="neutral"
      variant="subtle"
      icon="i-lucide-info"
      class="mt-6"
      title="No se guarda a medias"
      description="Un rechazo no deja la mitad de los cambios aplicados: la tanda entera se descarta y el rol o el usuario se quedan exactamente como estaban. Puedes corregir y volver a intentarlo sin miedo a haber dejado algo a medio hacer."
    />

    <HelpNextSteps :links="SIGUIENTE" />
  </HelpDocsPage>
</template>
