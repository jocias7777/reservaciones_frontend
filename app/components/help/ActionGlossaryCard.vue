<script setup lang="ts">
import type { HelpActionExample } from '~/types'

/**
 * Una entrada del glosario de acciones: el mismo icono, pintado dos veces —
 * encendido y apagado— para que el efecto de un interruptor se VEA y no solo se
 * lea. Es literalmente lo que hace la matriz de permisos con esta misma acción,
 * en miniatura: por eso el icono de la izquierda va sólido y en color, y el de
 * la derecha va apagado y a media opacidad, igual que un botón deshabilitado de
 * verdad.
 *
 * `warning` reutiliza el mismo aviso que `actionWarning()` calcula para la
 * matriz real (ver `app/utils/permissions.ts`): si una acción es delicada ahí,
 * tiene que seguir pareciéndolo aquí, con las mismas palabras.
 */
defineProps<{ item: HelpActionExample }>()
</script>

<template>
  <div
    class="rounded-lg border bg-default p-4"
    :class="item.warning ? 'border-error/30' : 'border-default'"
  >
    <div class="flex items-start gap-3">
      <div
        class="flex size-9 shrink-0 items-center justify-center rounded-lg"
        :class="item.warning ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'"
      >
        <UIcon
          :name="item.icon"
          class="size-5"
        />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p class="font-medium text-highlighted">
            {{ item.label }}
          </p>
          <code class="rounded bg-elevated px-1.5 py-0.5 text-xs text-dimmed">{{ item.code }}</code>
          <UBadge
            v-if="item.bulk"
            label="Por lote"
            color="neutral"
            variant="subtle"
            size="sm"
          />
          <UBadge
            v-if="item.warning"
            :label="item.warning"
            color="error"
            variant="subtle"
            size="sm"
          />
        </div>
        <p class="mt-1 text-sm text-muted">
          {{ item.what }}
        </p>
      </div>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <!--
        Encendido: el mismo icono de arriba, ahora en una ficha sólida — la
        misma sensación que un botón activo de verdad, listo para pulsarse.
      -->
      <div class="rounded-lg border border-success/30 bg-success/5 p-3">
        <div class="flex items-center gap-2">
          <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-success text-inverted">
            <UIcon
              :name="item.icon"
              class="size-4"
            />
          </span>
          <p class="text-xs font-semibold uppercase tracking-wide text-success">
            Interruptor encendido
          </p>
        </div>
        <p class="mt-2 text-sm text-highlighted">
          {{ item.on }}
        </p>
      </div>

      <!--
        Apagado: el mismo icono, ahora a media opacidad y sin color — lo que se
        ve cuando un botón está deshabilitado, no un dibujo distinto que haya
        que interpretar aparte.
      -->
      <div class="rounded-lg border border-default bg-elevated/40 p-3">
        <div class="flex items-center gap-2">
          <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-default text-dimmed opacity-50">
            <UIcon
              :name="item.icon"
              class="size-4"
            />
          </span>
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
            Interruptor apagado
          </p>
        </div>
        <p class="mt-2 text-sm text-muted">
          {{ item.off }}
        </p>
      </div>
    </div>
  </div>
</template>
