<script setup lang="ts">
import type { HelpRule } from '~/types'

/**
 * Los límites al repartir permisos, cada uno con el aviso literal que sale
 * cuando se topa con él.
 *
 * El aviso va copiado tal cual del servidor a propósito: quien llega a esta
 * página casi siempre llega porque acaba de ver uno de esos textos en pantalla y
 * no entiende qué hizo mal. Poder buscar la frase exacta y encontrarla aquí es
 * la mitad de la explicación.
 */
defineProps<{ rules: HelpRule[] }>()
</script>

<template>
  <div class="mt-6 space-y-4">
    <div
      v-for="rule in rules"
      :key="rule.title"
      class="rounded-lg border border-default bg-default p-4"
    >
      <div class="flex items-start gap-2.5">
        <UIcon
          name="i-lucide-shield-alert"
          class="mt-0.5 size-5 shrink-0 text-warning"
        />
        <div class="min-w-0">
          <p class="font-medium text-highlighted">
            {{ rule.title }}
          </p>
          <p class="mt-1 text-sm text-muted">
            {{ rule.explanation }}
          </p>
        </div>
      </div>

      <!--
        El aviso se muestra como lo que es —una cita del servidor, en monoespacio
        y con su barra al costado— y no como una frase más del párrafo: así se ve
        que es la cadena exacta que hay que buscar, sin comerse ni una palabra.
      -->
      <p class="mt-3 border-s-2 border-error/40 bg-elevated/60 py-1.5 ps-3 font-mono text-xs text-highlighted">
        {{ rule.message }}
      </p>

      <p class="mt-3 flex gap-2 text-sm text-muted">
        <UIcon
          name="i-lucide-lightbulb"
          class="mt-0.5 size-4 shrink-0 text-dimmed"
        />
        <span>{{ rule.fix }}</span>
      </p>
    </div>
  </div>
</template>
