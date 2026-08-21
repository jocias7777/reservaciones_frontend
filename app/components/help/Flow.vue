<script setup lang="ts">
import type { HelpFlowStep } from '~/types'

/**
 * Diagrama de «esto lleva a esto»: una fila de cajas unidas por flechas, cada
 * flecha con lo que hay que hacer para pasar de una a la siguiente.
 *
 * Sirve para los recorridos que la guía cuenta hoy en prosa —del listado a la
 * papelera y de vuelta, del rol al usuario que lo tiene— donde lo que cuesta
 * entender es el orden, no cada paso por separado.
 */
defineProps<{ steps: HelpFlowStep[] }>()

const TONE_RING: Record<string, string> = {
  primary: 'border-primary/30 bg-primary/5',
  success: 'border-success/30 bg-success/5',
  error: 'border-error/30 bg-error/5',
  warning: 'border-warning/30 bg-warning/5',
  neutral: 'border-default bg-default'
}

const TONE_ICON: Record<string, string> = {
  primary: 'text-primary',
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  neutral: 'text-dimmed'
}
</script>

<template>
  <div class="flex flex-col gap-2 sm:flex-row sm:items-stretch">
    <template
      v-for="(step, index) in steps"
      :key="step.label"
    >
      <!--
        La flecha lleva encima lo que se hizo para llegar al paso siguiente: sin
        esa etiqueta el diagrama dice que hay un antes y un después, pero no qué
        lo provoca, que es justo lo que se viene a mirar.
      -->
      <div
        v-if="index > 0"
        class="flex shrink-0 items-center justify-center gap-1.5 text-xs text-muted sm:flex-col sm:justify-center sm:px-1"
      >
        <UIcon
          name="i-lucide-arrow-down"
          class="size-4 shrink-0 sm:hidden"
        />
        <UIcon
          name="i-lucide-arrow-right"
          class="hidden size-4 shrink-0 sm:block"
        />
        <span
          v-if="step.via"
          class="whitespace-nowrap"
        >{{ step.via }}</span>
      </div>

      <div
        class="min-w-0 flex-1 rounded-lg border p-3"
        :class="TONE_RING[step.tone ?? 'neutral']"
      >
        <div class="flex items-center gap-2">
          <UIcon
            v-if="step.icon"
            :name="step.icon"
            class="size-4 shrink-0"
            :class="TONE_ICON[step.tone ?? 'neutral']"
          />
          <p class="min-w-0 truncate text-sm font-medium text-highlighted">
            {{ step.label }}
          </p>
        </div>
        <p
          v-if="step.detail"
          class="mt-1 text-xs text-muted"
        >
          {{ step.detail }}
        </p>
      </div>
    </template>
  </div>
</template>
