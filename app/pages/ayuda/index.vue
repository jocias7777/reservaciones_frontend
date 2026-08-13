<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

useSeoMeta({
  title: 'Cómo funciona',
  description: 'Guía de qué hace cada módulo del sistema y cómo se decide qué puede ver o hacer cada persona.'
})

interface PermissionStepOutcome {
  label: string
  color: 'success' | 'error'
}

interface PermissionStep {
  title: string
  description: string
  outcomes: PermissionStepOutcome[]
}

/**
 * Los tres pasos de `require_permission` (`app/decorators.py` del backend),
 * en el mismo orden en el que se comprueban. Es la pieza más importante de
 * toda esta guía: casi todas las dudas de permisos se resuelven volviendo
 * aquí.
 */
const steps: PermissionStep[] = [
  {
    title: '¿El rol activo es «superadmin»?',
    description: 'Si es así, se saltan los otros dos pasos, en cualquier módulo y cualquier acción. Se exige además que ese rol siga vigente: mandarlo a la papelera le quita el privilegio también a quien lo tenga.',
    outcomes: [{ label: 'Permite todo, sin más preguntas', color: 'success' }]
  },
  {
    title: '¿Tiene una excepción suya en «Permisos por usuario»?',
    description: 'Una excepción es una fila propia para ese módulo y esa acción, y manda siempre, sin importar lo que diga el rol.',
    outcomes: [
      { label: 'Con «Concede»: permite', color: 'success' },
      { label: 'Con «Revoca»: deniega', color: 'error' }
    ]
  },
  {
    title: '¿Su rol lo concede en «Permisos por rol»?',
    description: 'Sin excepción de por medio —el caso más común—, manda lo que tenga marcado el rol para ese módulo y esa acción.',
    outcomes: [
      { label: 'Marcado: permite', color: 'success' },
      { label: 'Sin marcar: deniega', color: 'error' }
    ]
  }
]

/**
 * El mismo recorrido de arriba, pero resuelto sobre una persona concreta: es
 * la forma más rápida de ver por qué una excepción le gana al rol y por qué
 * «Hereda» no significa «permitido».
 */
const ejemplo = [
  { accion: 'Listar', rol: 'Marcado', excepcion: 'Hereda', permite: true, porque: 'Sin excepción, manda el rol' },
  { accion: 'Crear', rol: 'Marcado', excepcion: 'Revoca', permite: false, porque: 'La excepción gana al rol' },
  { accion: 'Eliminar', rol: 'Sin marcar', excepcion: 'Hereda', permite: false, porque: 'Sin excepción, manda el rol' },
  { accion: 'Restaurar', rol: 'Sin marcar', excepcion: 'Concede', permite: true, porque: 'La excepción gana al rol' }
]
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Cómo funciona
    </h1>
    <p class="mt-3 text-muted">
      Esta guía explica qué hace cada módulo del sistema y, sobre todo, cómo se decide qué puede ver o hacer cada
      persona. Empieza por aquí; el resto son detalles de cada pantalla.
    </p>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Cómo se decide qué puede hacer alguien
    </h2>
    <p class="mt-2 text-sm text-muted">
      El backend comprueba estos tres pasos, en este orden, en <strong>cada</strong> petición — no solo al entrar a
      una pantalla. Esto no es una simplificación de la interfaz: es exactamente lo que hace
      <code class="rounded bg-elevated px-1 py-0.5">require_permission</code> en el servidor.
    </p>

    <ol class="mt-6 space-y-6">
      <li
        v-for="(step, index) in steps"
        :key="step.title"
        class="flex gap-3"
      >
        <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold text-highlighted">
          {{ index + 1 }}
        </span>
        <div class="min-w-0">
          <p class="font-medium text-highlighted">
            {{ step.title }}
          </p>
          <p class="mt-1 text-sm text-muted">
            {{ step.description }}
          </p>
          <div class="mt-2 flex flex-wrap gap-2">
            <UBadge
              v-for="outcome in step.outcomes"
              :key="outcome.label"
              :label="outcome.label"
              :color="outcome.color"
              variant="subtle"
              size="sm"
            />
          </div>
        </div>
      </li>
    </ol>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Los tres pasos, sobre un caso concreto
    </h2>
    <p class="mt-2 text-sm text-muted">
      Ana tiene el rol «Supervisor», que en Usuarios concede Listar y Crear, pero no Eliminar ni Restaurar. Además
      tiene dos excepciones propias. Esto es lo que puede hacer al final:
    </p>

    <HelpMockupFrame>
      <div class="overflow-x-auto">
        <table class="w-full min-w-125 text-sm">
          <thead>
            <tr class="border-b border-default text-left text-xs uppercase tracking-wide text-dimmed">
              <th class="pb-2 pe-4 font-medium">
                Acción
              </th>
              <th class="pb-2 pe-4 font-medium">
                Su rol
              </th>
              <th class="pb-2 pe-4 font-medium">
                Su excepción
              </th>
              <th class="pb-2 font-medium">
                Resultado
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="fila in ejemplo"
              :key="fila.accion"
              class="border-b border-default last:border-0"
            >
              <td class="py-3 pe-4 font-medium text-highlighted">
                {{ fila.accion }}
              </td>
              <td class="py-3 pe-4 text-muted">
                {{ fila.rol }}
              </td>
              <td class="py-3 pe-4 text-muted">
                {{ fila.excepcion }}
              </td>
              <td class="py-3">
                <UBadge
                  :label="fila.permite ? 'Puede' : 'No puede'"
                  :color="fila.permite ? 'success' : 'error'"
                  variant="subtle"
                  size="sm"
                />
                <span class="ms-2 text-xs text-dimmed">{{ fila.porque }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </HelpMockupFrame>

    <UAlert
      color="neutral"
      variant="subtle"
      icon="i-lucide-info"
      class="mt-8"
      title="Esto no es la barrera de seguridad"
      description="Ocultar un botón en el navegador es una comodidad, no protección: el backend vuelve a comprobar estos tres pasos por su cuenta en cada petición, y responde 403 si de verdad no toca."
    />
  </HelpDocsPage>
</template>
