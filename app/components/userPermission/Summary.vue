<script setup lang="ts">
/**
 * Resumen de los permisos de un usuario, en la misma fila de celdas que el de
 * los roles (`PermissionSummary`).
 *
 * Las cifras no son las mismas y no pueden serlo: en un rol se cuenta lo que se
 * concede, y aquí lo que importa es de dónde sale cada permiso. Por eso van
 * separadas las tres procedencias —lo que hereda del rol, lo que se le concede
 * a mano y lo que se le bloquea— y al final lo que queda de verdad, que es la
 * suma de las tres y lo único que el usuario notará.
 */
const props = withDefaults(defineProps<{
  userName: string
  email?: string
  /** Nombre del rol del que hereda, o `null` si no tiene ninguno. */
  roleName?: string | null
  inheritedCount: number
  grantCount: number
  denyCount: number
  effectiveCount: number
  /** Combinaciones posibles de módulo × acción. */
  total: number
  /** Excepciones vigentes: sin ninguna, no hay nada que devolver a heredado. */
  exceptionCount: number
  disabled?: boolean
}>(), {
  email: '',
  roleName: null,
  disabled: false
})

const emit = defineEmits<{ resetAll: [] }>()

const percentage = computed(() =>
  props.total > 0 ? Math.round((props.effectiveCount / props.total) * 100) : 0
)

const metrics = computed(() => [
  {
    key: 'hereda',
    icon: 'i-lucide-corner-down-right',
    value: String(props.inheritedCount),
    label: props.roleName ? `Del rol «${props.roleName}»` : 'Sin rol asignado',
    tone: 'text-dimmed'
  },
  {
    key: 'concedidas',
    icon: 'i-lucide-check',
    value: String(props.grantCount),
    label: 'Concedidas',
    // Se tiñen solo cuando hay alguna: en cero son la ausencia de excepción.
    tone: props.grantCount ? 'text-success' : 'text-dimmed'
  },
  {
    key: 'bloqueadas',
    icon: 'i-lucide-ban',
    value: String(props.denyCount),
    label: 'Bloqueadas',
    tone: props.denyCount ? 'text-error' : 'text-dimmed'
  }
])
</script>

<template>
  <div class="rounded-lg border border-default bg-default">
    <div class="flex flex-col divide-y divide-default sm:flex-row sm:flex-wrap sm:items-stretch sm:divide-x sm:divide-y-0">
      <div class="flex min-w-0 items-center gap-3 p-4 sm:flex-1 sm:basis-64">
        <BaseIconTile
          icon="i-lucide-circle-user"
          size="lg"
        />

        <div class="min-w-0">
          <div class="flex min-w-0 items-center gap-2">
            <p class="truncate font-semibold text-highlighted">
              {{ props.userName }}
            </p>
            <UBadge
              label="Usuario"
              color="primary"
              variant="subtle"
              size="sm"
              class="shrink-0"
            />
          </div>
          <p
            v-if="props.email"
            class="truncate text-sm text-muted"
          >
            {{ props.email }}
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
        <div class="min-w-0">
          <p class="font-semibold text-highlighted tabular-nums">
            {{ metric.value }}
          </p>
          <p class="truncate text-xs text-muted">
            {{ metric.label }}
          </p>
        </div>
      </div>

      <!-- Lo que queda tras aplicar las excepciones: la cifra que de verdad importa. -->
      <div class="flex flex-col justify-center gap-1.5 p-4 sm:w-52">
        <div class="flex items-baseline justify-between gap-2">
          <p class="text-xs text-muted whitespace-nowrap">
            Permisos efectivos
          </p>
          <p class="text-sm font-semibold text-highlighted tabular-nums">
            {{ props.effectiveCount }}<span class="text-dimmed">/{{ props.total }}</span>
          </p>
        </div>
        <UProgress
          :model-value="percentage"
          size="sm"
        />
      </div>

      <div class="flex items-center p-4">
        <UButton
          label="Todo hereda del rol"
          icon="i-lucide-rotate-ccw"
          color="neutral"
          variant="outline"
          :disabled="props.disabled || !props.exceptionCount"
          @click="emit('resetAll')"
        />
      </div>
    </div>
  </div>
</template>
