<script setup lang="ts">
/**
 * Un permiso, escrito como la frase que es: «[quién] puede [qué] en [dónde]».
 *
 * Es la forma más corta de explicar por qué hacen falta las cuatro pantallas de
 * catálogo y no una lista de casillas: cada hueco de la frase se administra en su
 * propio sitio —el rol en Roles, la acción y el módulo en su catálogo— y un
 * permiso no existe hasta que los tres están puestos.
 *
 * Se rotula cada pieza con lo que es, no con lo que dice: quien lee la guía
 * necesita justo esa traducción («Supervisor» es un rol, «Crear» es una acción)
 * para reconocer después las mismas palabras en las pantallas.
 */
withDefaults(defineProps<{
  /** Quién: el nombre de un rol o de una persona. */
  subject: string
  /** Qué es ese quién, para el rótulo: «Rol», «Usuario»... */
  subjectKind?: string
  subjectIcon?: string
  action: string
  module: string
}>(), {
  subjectKind: 'Rol',
  subjectIcon: 'i-lucide-shield'
})
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
    <div class="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-center">
      <p class="text-[10px] font-semibold uppercase tracking-wide text-primary">
        {{ subjectKind }}
      </p>
      <p class="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-highlighted">
        <UIcon
          :name="subjectIcon"
          class="size-4 shrink-0 text-dimmed"
        />
        {{ subject }}
      </p>
    </div>

    <span class="text-sm text-muted">puede</span>

    <div class="rounded-lg border border-default bg-default px-3 py-2 text-center">
      <p class="text-[10px] font-semibold uppercase tracking-wide text-dimmed">
        Acción
      </p>
      <p class="mt-0.5 text-sm font-medium text-highlighted">
        {{ action }}
      </p>
    </div>

    <span class="text-sm text-muted">en</span>

    <div class="rounded-lg border border-default bg-default px-3 py-2 text-center">
      <p class="text-[10px] font-semibold uppercase tracking-wide text-dimmed">
        Módulo
      </p>
      <p class="mt-0.5 text-sm font-medium text-highlighted">
        {{ module }}
      </p>
    </div>
  </div>
</template>
