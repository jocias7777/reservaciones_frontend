<script setup lang="ts">
/**
 * Resumen de la matriz: a quién se le están dando permisos, cuántos hay activos
 * y el interruptor maestro.
 *
 * Va todo en una fila de celdas separadas por líneas. Son cifras de un vistazo
 * —cuántos permisos, cuántos módulos, cuántas acciones—: apiladas en dos filas
 * costaba relacionarlas, y la barra de progreso quedaba lejos del número que
 * resume. Cuando no cabe, las celdas se reparten en varias líneas solas.
 */
const props = withDefaults(defineProps<{
  /** `ROL` o `USUARIO`. */
  headline: string
  title: string
  description?: string | null
  icon?: string
  activeCount: number
  total: number
  modulesCount: number
  actionsCount: number
  allSelected?: boolean
  disabled?: boolean
  /** Texto extra bajo el interruptor maestro (por ejemplo, el rol heredado). */
  hint?: string
}>(), {
  icon: 'i-lucide-shield',
  description: null,
  allSelected: false,
  disabled: false
})

const emit = defineEmits<{ toggleAll: [value: boolean] }>()

const percentage = computed(() =>
  props.total > 0 ? Math.round((props.activeCount / props.total) * 100) : 0
)

/** Las tres cifras salen igual; se declaran juntas para que no se separen. */
const metrics = computed(() => [
  {
    key: 'activos',
    icon: 'i-lucide-circle-check',
    value: `${props.activeCount} / ${props.total}`,
    label: 'Permisos activos',
    // El verde solo cuando hay algo concedido: en cero no hay nada que celebrar.
    tone: props.activeCount ? 'text-success' : 'text-dimmed'
  },
  {
    key: 'modulos',
    icon: 'i-lucide-box',
    value: String(props.modulesCount),
    label: 'Módulos',
    tone: 'text-dimmed'
  },
  {
    key: 'acciones',
    icon: 'i-lucide-list-checks',
    value: String(props.actionsCount),
    label: 'Acciones',
    tone: 'text-dimmed'
  }
])
</script>

<template>
  <div class="rounded-lg border border-default bg-default">
    <!--
      `divide-x` dibuja el separador entre celdas sin añadir un elemento por
      medio, y al envolverse a otra línea se recoloca solo. En móvil las celdas
      van una debajo de otra y el separador pasa a ser horizontal.
    -->
    <div class="flex flex-col divide-y divide-default sm:flex-row sm:flex-wrap sm:items-stretch sm:divide-x sm:divide-y-0">
      <!-- De quién son los permisos: se lleva el espacio sobrante. -->
      <div class="flex min-w-0 items-center gap-3 p-4 sm:flex-1 sm:basis-64">
        <BaseIconTile
          :icon="props.icon"
          size="lg"
        />

        <div class="min-w-0">
          <div class="flex min-w-0 items-center gap-2">
            <p class="truncate font-semibold text-highlighted">
              {{ props.title }}
            </p>
            <UBadge
              :label="props.headline"
              color="primary"
              variant="subtle"
              size="sm"
              class="shrink-0"
            />
          </div>
          <p
            v-if="props.description"
            class="truncate text-sm text-muted"
          >
            {{ props.description }}
          </p>
        </div>
      </div>

      <div
        v-for="metric in metrics"
        :key="metric.key"
        class="flex items-center gap-2.5 p-4"
      >
        <UIcon
          :name="metric.icon"
          class="size-5 shrink-0"
          :class="metric.tone"
        />
        <div>
          <p class="font-semibold text-highlighted tabular-nums whitespace-nowrap">
            {{ metric.value }}
          </p>
          <p class="text-xs text-muted whitespace-nowrap">
            {{ metric.label }}
          </p>
        </div>
      </div>

      <div class="flex flex-col justify-center gap-1.5 p-4 sm:w-52">
        <div class="flex items-baseline justify-between gap-2">
          <p class="text-xs text-muted">
            Progreso de permisos
          </p>
          <p class="text-sm font-semibold text-highlighted tabular-nums">
            {{ percentage }}%
          </p>
        </div>
        <UProgress
          :model-value="percentage"
          size="sm"
        />
      </div>

      <!--
        El interruptor maestro cierra la fila, separado del resto por su línea:
        es lo único que actúa, todo lo demás solo informa.
      -->
      <div class="flex items-center p-4">
        <USwitch
          :model-value="props.allSelected"
          :disabled="props.disabled"
          label="Seleccionar todo"
          :description="`Activa las ${props.total} combinaciones.`"
          :ui="{ description: 'text-xs' }"
          @update:model-value="emit('toggleAll', $event)"
        />
      </div>
    </div>

    <p
      v-if="props.hint"
      class="border-t border-default px-4 py-3 text-sm text-muted"
    >
      {{ props.hint }}
    </p>
  </div>
</template>
