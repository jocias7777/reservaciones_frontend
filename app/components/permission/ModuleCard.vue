<script setup lang="ts">
import type { Action, ActionCategory, PermissionModule } from '~/types'

/**
 * Tarjeta de un módulo con sus interruptores de acción.
 *
 * Las acciones se reparten en bloques según su categoría (Consulta / Gestión /
 * Eliminación...): con la lista plana cuesta distinguir "Eliminar" de "Eliminar
 * masivo permanente", que es justo la diferencia que más importa no equivocarse.
 *
 * Recibe solo las acciones que el módulo implementa de verdad, no el catálogo
 * entero.
 */
const props = withDefaults(defineProps<{
  module: PermissionModule
  actions: Action[]
  /** Categorías con las que se agrupan las acciones (`sa_category_permissions`). */
  categories?: ActionCategory[]
  /** Estado actual por `actionId`. */
  values: Record<string, boolean>
  /**
   * Solo en permisos de usuario: lo que concede su rol por `actionId`. Sirve para
   * marcar qué celdas son una excepción y no lo heredado.
   */
  inherited?: Record<string, boolean> | null
  disabled?: boolean
}>(), {
  categories: () => [],
  inherited: null,
  disabled: false
})

const emit = defineEmits<{
  toggle: [actionId: string, value: boolean]
  toggleModule: [value: boolean]
}>()

/**
 * Plegada de entrada. Con la lista completa a la vista se elige a qué módulo
 * entrar; abierta de arranque, la primera pantalla ya es un scroll.
 */
const open = ref(false)

const groups = computed(() => groupActions(props.actions, props.categories))

const activeCount = computed(() => props.actions.filter(action => props.values[action.id]).length)
const allSelected = computed(() => props.actions.length > 0 && activeCount.value === props.actions.length)

/** Una celda es excepción cuando difiere de lo que otorga el rol. */
function isOverride(actionId: string): boolean {
  if (!props.inherited) return false
  return Boolean(props.values[actionId]) !== Boolean(props.inherited[actionId])
}

const overrideCount = computed(() =>
  props.inherited ? props.actions.filter(action => isOverride(action.id)).length : 0
)
</script>

<template>
  <div class="border border-default rounded-lg bg-default">
    <!-- Cabecera del módulo -->
    <div class="flex items-center gap-3 p-4">
      <BaseIconTile :icon="moduleIcon(props.module)" />

      <div class="min-w-0 flex-1">
        <p class="font-semibold text-highlighted truncate">
          {{ props.module.name }}
        </p>
        <p class="text-sm text-muted truncate">
          <span class="text-xs">{{ props.module.code }}</span>
          <template v-if="props.module.description">
            · {{ props.module.description }}
          </template>
        </p>
      </div>

      <UBadge
        v-if="overrideCount"
        :label="`${overrideCount} excepción(es)`"
        color="warning"
        variant="subtle"
        class="hidden sm:inline-flex"
      />

      <UBadge
        :label="`${activeCount} / ${props.actions.length}`"
        color="neutral"
        variant="subtle"
      />

      <UButton
        :icon="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        color="neutral"
        variant="ghost"
        :disabled="props.disabled"
        :aria-label="open ? `Ocultar acciones de ${props.module.name}` : `Mostrar acciones de ${props.module.name}`"
        @click="open = !open"
      />
    </div>

    <div
      v-if="open"
      class="border-t border-default"
    >
      <div class="px-4 py-3">
        <UButton
          :label="allSelected ? 'Quitar todo el módulo' : 'Seleccionar todo el módulo'"
          :icon="allSelected ? 'i-lucide-square' : 'i-lucide-square-check-big'"
          color="neutral"
          variant="subtle"
          :disabled="props.disabled"
          @click="emit('toggleModule', !allSelected)"
        />
      </div>
      <div
        class="flex flex-wrap justify-center gap-x-6 gap-y-8 px-4 pb-5 lg:gap-x-8"
      >
        <div
          v-for="group in groups"
          :key="group.id || 'sin-categoria'"
          class="min-w-0 w-full space-y-3 sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.5rem)] lg:border-s lg:border-default lg:ps-8 lg:[&:nth-child(4n+1)]:border-s-0"
        >
          <div class="flex items-center gap-2">
            <UIcon
              :name="group.icon"
              class="size-4 text-dimmed"
            />
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-muted">
                {{ group.label }}
              </p>
              <p
                v-if="group.description"
                class="text-xs text-dimmed"
              >
                {{ group.description }}
              </p>
            </div>
          </div>

          <!-- Categoría recién creada: se ve que existe, aunque aún esté vacía. -->
          <p
            v-if="!group.actions.length"
            class="text-sm text-dimmed"
          >
            Sin acciones todavía
          </p>

          <div class="space-y-2.5">
            <div
              v-for="action in group.actions"
              :key="action.id"
              class="flex items-start gap-2"
            >
              <USwitch
                :model-value="Boolean(props.values[action.id])"
                :color="actionWarning(action) ? 'error' : 'primary'"
                :disabled="props.disabled"
                :aria-label="`${actionLabel(action)} en ${props.module.name}`"
                @update:model-value="emit('toggle', action.id, $event)"
              >
                <template #label>
                  <span class="inline-flex items-center gap-1.5">
                    {{ actionLabel(action) }}

                    <UTooltip
                      v-if="actionHint(action)"
                      :text="actionHint(action)"
                    >
                      <UIcon
                        name="i-lucide-circle-help"
                        class="size-4 text-dimmed"
                      />
                    </UTooltip>

                    <UBadge
                      v-if="isOverride(action.id)"
                      :label="props.values[action.id] ? 'Concedido' : 'Bloqueado'"
                      :color="props.values[action.id] ? 'success' : 'error'"
                      variant="subtle"
                    />
                  </span>
                </template>
              </USwitch>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
