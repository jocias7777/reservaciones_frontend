<script setup lang="ts">
/**
 * Las tres preguntas que decide el servidor para saber si alguien puede hacer
 * algo, dibujadas como lo que son: una cadena de puertas que se recorre en
 * orden y se corta en la primera que responde.
 *
 * Es la pieza central de toda la guía, y por eso es un componente y no el
 * cuerpo de una página: la explican la introducción y la vuelven a necesitar
 * las pantallas de permisos por rol y por usuario, y tres copias del mismo
 * diagrama se separarían en cuanto se tocara una.
 *
 * El orden y los desenlaces son exactamente los de `require_permission`
 * (`app/decorators.py` del backend). No es una simplificación para la interfaz:
 * si esto y aquello dejan de coincidir, lo que está mal es esto.
 */

interface Branch {
  /** Qué hace falta para irse por esta salida. */
  when: string
  outcome: string
  allows: boolean
}

interface Gate {
  question: string
  detail: string
  branches: Branch[]
  /** Qué se pregunta a continuación si ninguna salida se cumple. */
  fallthrough?: string
}

const GATES: Gate[] = [
  {
    question: '¿Su rol es «superadmin»?',
    detail: 'Se mira solo el nombre del rol, y tiene que seguir vigente: un rol en la papelera no concede nada, ni siquiera este.',
    branches: [{ when: 'Sí', outcome: 'Puede. No se pregunta nada más.', allows: true }],
    fallthrough: 'No es superadmin: se sigue preguntando'
  },
  {
    question: '¿Tiene una excepción suya para esta acción?',
    detail: 'Una fila propia en «Permisos por usuario» para esta acción concreta. Si la hay, manda ella y el rol ya no se consulta.',
    branches: [
      { when: 'Sí, «Permitir»', outcome: 'Puede, aunque su rol no lo dé.', allows: true },
      { when: 'Sí, «Bloquear»', outcome: 'No puede, aunque su rol sí lo dé.', allows: false }
    ],
    fallthrough: 'No tiene excepción («Hereda»): decide el rol'
  },
  {
    question: '¿Su rol tiene marcada esta acción?',
    detail: 'El caso normal. Se mira la casilla del rol en «Permisos por rol» — y también aquí todo tiene que estar vigente: el rol, el módulo y la acción.',
    branches: [
      { when: 'Sí', outcome: 'Puede.', allows: true },
      { when: 'No', outcome: 'No puede.', allows: false }
    ]
  }
]
</script>

<template>
  <div class="mt-6 space-y-0">
    <div
      v-for="(gate, index) in GATES"
      :key="gate.question"
    >
      <!--
        La pregunta y sus salidas van lado a lado en pantallas anchas, porque
        así se lee «esto pregunta, y de aquí sale esto». Apiladas en estrecho el
        orden sigue siendo el mismo de arriba abajo.
      -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div class="flex min-w-0 flex-1 gap-3 rounded-lg border border-default bg-default p-4">
          <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold text-highlighted">
            {{ index + 1 }}
          </span>
          <div class="min-w-0">
            <p class="font-medium text-highlighted">
              {{ gate.question }}
            </p>
            <p class="mt-1 text-sm text-muted">
              {{ gate.detail }}
            </p>
          </div>
        </div>

        <div class="flex shrink-0 items-center justify-center text-dimmed">
          <UIcon
            name="i-lucide-arrow-right"
            class="hidden size-5 sm:block"
          />
          <UIcon
            name="i-lucide-arrow-down"
            class="size-5 sm:hidden"
          />
        </div>

        <div class="flex min-w-0 flex-col justify-center gap-2 sm:w-72">
          <div
            v-for="branch in gate.branches"
            :key="branch.when"
            class="rounded-lg border p-3"
            :class="branch.allows ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'"
          >
            <div class="flex items-center gap-2">
              <UIcon
                :name="branch.allows ? 'i-lucide-circle-check' : 'i-lucide-circle-slash'"
                class="size-4 shrink-0"
                :class="branch.allows ? 'text-success' : 'text-error'"
              />
              <p class="text-xs font-semibold uppercase tracking-wide text-muted">
                {{ branch.when }}
              </p>
            </div>
            <p class="mt-1 text-sm text-highlighted">
              {{ branch.outcome }}
            </p>
          </div>
        </div>
      </div>

      <!--
        El paso a la siguiente pregunta se dibuja: sin esto, las tres cajas
        parecen tres reglas sueltas que se comprueban a la vez, y lo que hay que
        entender es justo lo contrario — solo se llega a la de abajo si la de
        arriba no respondió.
      -->
      <div
        v-if="gate.fallthrough"
        class="flex items-center gap-2 py-2 ps-3 text-sm text-muted"
      >
        <UIcon
          name="i-lucide-corner-down-right"
          class="size-4 shrink-0 text-dimmed"
        />
        {{ gate.fallthrough }}
      </div>
    </div>
  </div>
</template>
