<script setup lang="ts">
import type { Action, PermissionModule } from '~/types'

/**
 * Tarjeta de un módulo con sus interruptores de acción.
 *
 * Las 9 acciones se reparten en tres bloques (consulta / gestión / eliminación):
 * con la lista plana cuesta distinguir "Eliminar" de "Eliminar masivo
 * permanente", que es justo la diferencia que más importa no equivocarse.
 */
const props = withDefaults(defineProps<{
  module: PermissionModule
  actions: Action[]
  /** Estado actual por `actionId`. */
  values: Record<string, boolean>
  /**
   * Solo en permisos de usuario: lo que concede su rol por `actionId`. Sirve para
   * marcar qué celdas son una excepción y no lo heredado.
   */
  inherited?: Record<string, boolean> | null
  disabled?: boolean
  defaultOpen?: boolean
}>(), {
  inherited: null,
  disabled: false,
  defaultOpen: true
})

const emit = defineEmits<{
  toggle: [actionId: string, value: boolean]
  toggleModule: [value: boolean]
}>()

const open = ref(props.defaultOpen)

const groups = computed(() => groupActions(props.actions))

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

      <!--
        Un bloque de acciones por columna. Las columnas se ajustan a su contenido
        y el conjunto queda centrado en la tarjeta, separado por una línea para
        que se lean como tres grupos distintos.

        El salto es directo de una columna a tres (sin paso intermedio de dos) a
        propósito: así en pantallas anchas siempre hay una única fila y el
        separador de `first:` cae justo donde debe.
      -->
      <div
        class="grid gap-y-8 px-4 pb-5 lg:grid-cols-[repeat(3,minmax(0,auto))] lg:justify-center lg:gap-x-10 xl:gap-x-16"
      >
        <div
          v-for="group in groups"
          :key="group.id"
          class="space-y-3 lg:border-s lg:border-default lg:ps-10 lg:first:border-s-0 lg:first:ps-0"
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
              <p class="text-xs text-dimmed">
                {{ group.description }}
              </p>
            </div>
          </div>

          <div class="space-y-2.5">
            <div
              v-for="action in group.actions"
              :key="action.id"
              class="flex items-start gap-2"
            >
              <USwitch
                :model-value="Boolean(props.values[action.id])"
                :color="isIrreversibleAction(action) ? 'error' : 'primary'"
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
