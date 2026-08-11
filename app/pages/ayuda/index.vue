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
