<script setup lang="ts">
/**
 * «En corto»: lo que hay que saber de la página, antes de la página.
 *
 * Va arriba del todo, justo bajo el título, y es lo único que se necesita leer
 * si uno solo venía a resolver una duda concreta. Todo lo demás de la página es
 * el detalle de estas frases, no información nueva — si algo importante solo
 * aparece más abajo, es que falta aquí.
 */
const props = defineProps<{ items: string[] }>()

/**
 * Cada frase se parte en trozos normales y trozos resaltados, marcados con
 * `**así**`.
 *
 * Se hace partiendo el texto en vez de pintarlo con `v-html` a propósito: lo que
 * llega aquí es texto y se muestra como texto, sin que ninguna página de la guía
 * pueda meter etiquetas por accidente. Un `**` suelto no rompe nada — sin pareja
 * que lo cierre, se queda tal cual dentro de su trozo.
 */
const lines = computed(() =>
  props.items.map(item => ({
    key: item,
    parts: item.split(/\*\*(.+?)\*\*/g).map((text, index) => ({
      text,
      // `split` con un grupo de captura devuelve los trozos capturados en las
      // posiciones impares: esos son justo los que iban entre asteriscos.
      strong: index % 2 === 1
    }))
  }))
)
</script>

<template>
  <div class="mt-6 rounded-lg border border-primary/25 bg-primary/5 p-4">
    <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
      <UIcon
        name="i-lucide-sparkles"
        class="size-4 shrink-0"
      />
      En corto
    </p>

    <ul class="mt-3 space-y-2">
      <li
        v-for="line in lines"
        :key="line.key"
        class="flex gap-2.5 text-sm text-default"
      >
        <UIcon
          name="i-lucide-check"
          class="mt-0.5 size-4 shrink-0 text-primary"
        />
        <span>
          <template
            v-for="(part, index) in line.parts"
            :key="index"
          >
            <strong
              v-if="part.strong"
              class="font-semibold text-highlighted"
            >{{ part.text }}</strong>
            <template v-else>{{ part.text }}</template>
          </template>
        </span>
      </li>
    </ul>
  </div>
</template>
