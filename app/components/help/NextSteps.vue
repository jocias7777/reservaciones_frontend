<script setup lang="ts">
import type { HelpNextStep } from '~/types'

/**
 * El pie de «seguir leyendo».
 *
 * Cada página de la guía contesta una cosa y deja abiertas las de al lado —
 * quien acaba de entender los permisos de un rol casi siempre quiere saber ahora
 * cómo se le hace una excepción a una persona—. Sin esto hay que volver a la
 * barra lateral y adivinar por el título cuál era la siguiente.
 */
defineProps<{ links: HelpNextStep[] }>()
</script>

<template>
  <nav
    class="mt-10 border-t border-default pt-6"
    aria-label="Seguir leyendo"
  >
    <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
      Seguir leyendo
    </p>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="group flex gap-3 rounded-lg border border-default bg-default p-4 transition-colors duration-150 hover:border-primary/40 hover:bg-elevated/50"
      >
        <UIcon
          :name="link.icon"
          class="mt-0.5 size-5 shrink-0 text-dimmed transition-colors duration-150 group-hover:text-primary"
        />
        <div class="min-w-0">
          <p class="font-medium text-highlighted">
            {{ link.label }}
          </p>
          <p class="mt-0.5 text-sm text-muted">
            {{ link.description }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </nav>
</template>
