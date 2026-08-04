<script setup lang="ts">
/**
 * Resumen de la matriz: a quién se le están dando permisos, cuántos hay activos
 * y el interruptor maestro.
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
</script>

<template>
  <div class="border border-default rounded-lg bg-default divide-y divide-default">
    <div class="grid gap-6 p-4 sm:p-5 lg:grid-cols-2 lg:items-center">
      <div class="flex items-start gap-3">
        <BaseIconTile
          :icon="props.icon"
          size="lg"
        />

        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
            {{ props.headline }}
          </p>
          <p class="text-lg font-semibold text-highlighted truncate">
            {{ props.title }}
          </p>
          <p
            v-if="props.description"
            class="text-sm text-muted"
          >
            {{ props.description }}
          </p>
        </div>
      </div>

      <div class="flex items-start gap-3 lg:justify-end">
        <USwitch
          :model-value="props.allSelected"
          :disabled="props.disabled"
          label="Seleccionar todo"
          :description="`Activa las ${props.total} combinaciones de módulo y acción.`"
          @update:model-value="emit('toggleAll', $event)"
        />
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
      <UBadge
        :label="`${props.activeCount} de ${props.total} permisos activos`"
        :color="props.activeCount ? 'primary' : 'neutral'"
        variant="subtle"
        icon="i-lucide-shield-check"
      />
      <UBadge
        :label="`${props.modulesCount} módulo(s)`"
        color="neutral"
        variant="subtle"
        icon="i-lucide-layers"
      />
      <UBadge
        :label="`${props.actionsCount} acción(es)`"
        color="neutral"
        variant="subtle"
        icon="i-lucide-list-checks"
      />

      <div class="ms-auto flex items-center gap-2 min-w-40">
        <UProgress
          :model-value="percentage"
          size="sm"
        />
        <span class="text-xs text-muted tabular-nums">{{ percentage }}%</span>
      </div>
    </div>

    <p
      v-if="props.hint"
      class="px-4 py-3 text-sm text-muted sm:px-5"
    >
      {{ props.hint }}
    </p>
  </div>
</template>
