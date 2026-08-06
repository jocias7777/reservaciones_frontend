<script setup lang="ts">
import type { Action, ActionCategory, OverrideState, PermissionModule } from '~/types'

/**
 * Tarjeta de un módulo en los permisos de un usuario.
 *
 * A propósito NO se parece a `PermissionModuleCard`, la de los roles: allí un
 * interruptor por acción basta, porque el rol es la fuente del permiso. Aquí lo
 * que se edita son las excepciones sobre ese rol, así que cada acción necesita
 * tres datos en la misma línea —qué da el rol, qué se decide para este usuario y
 * qué queda— y eso pide una tabla, no una rejilla de interruptores.
 */
const props = withDefaults(defineProps<{
  module: PermissionModule
  actions: Action[]
  /** Categorías con las que se agrupan las acciones (`sa_category_permissions`). */
  categories?: ActionCategory[]
  /** Estado elegido por `actionId`; `inherit` cuando no hay excepción. */
  states: Record<string, OverrideState>
  /** Lo que concede el rol del usuario, por `actionId`. */
  inherited: Record<string, boolean>
  disabled?: boolean
  defaultOpen?: boolean
}>(), {
  categories: () => [],
  disabled: false,
  defaultOpen: true
})

const emit = defineEmits<{
  toggle: [actionId: string, state: OverrideState]
  setModule: [state: OverrideState]
}>()

const open = ref(props.defaultOpen)

const groups = computed(() => groupActions(props.actions, props.categories))

const stateOf = (actionId: string): OverrideState => props.states[actionId] ?? 'inherit'

/** Lo que de verdad podrá hacer: la excepción manda sobre el rol. */
function effective(actionId: string): boolean {
  return resolveEffective(stateOf(actionId), Boolean(props.inherited[actionId]))
}

const exceptionCount = computed(() =>
  props.actions.filter(action => stateOf(action.id) !== 'inherit').length
)

const effectiveCount = computed(() => props.actions.filter(action => effective(action.id)).length)

/** Las filas con excepción se tiñen para separarlas de lo que solo se hereda. */
function rowClass(actionId: string): string {
  const state = stateOf(actionId)
  if (state === 'grant') return 'bg-success/5 ring-1 ring-inset ring-success/20'
  if (state === 'deny') return 'bg-error/5 ring-1 ring-inset ring-error/20'
  return ''
}

/**
 * Rejilla compartida por la cabecera de columnas y por cada fila, para que
 * queden alineadas. El `display` se pone fuera: la cabecera se oculta en móvil
 * (donde la fila se apila) y no puede llevar `grid` y `hidden` a la vez.
 *
 * Las tres últimas columnas tienen ancho FIJO y solo la primera es elástica.
 * Es lo que mantiene los botones en la misma vertical en todas las filas: cada
 * fila es su propia rejilla, así que en cuanto una columna se dimensiona por su
 * contenido, una fila con el resultado más largo arrastra sus botones fuera de
 * la vertical del resto.
 *
 * La columna del resultado es estrecha porque solo dice «Puede» o «No puede»:
 * repetir ahí el nombre de la acción («No puede eliminar masivo permanente»)
 * obligaba a reservar el ancho del texto más largo, y ese ancho se lo quitaba a
 * los botones, que acababan partiéndose en dos líneas.
 */
const COLUMNS = 'gap-x-4 gap-y-1 lg:grid-cols-[minmax(8rem,1fr)_19rem_6.5rem] lg:items-center'
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
        v-if="exceptionCount"
        :label="`${exceptionCount} excepción(es)`"
        color="warning"
        variant="subtle"
        class="hidden sm:inline-flex"
      />

      <UBadge
        :label="`${effectiveCount} / ${props.actions.length}`"
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
      <div class="flex flex-wrap gap-2 px-4 py-2.5">
        <UButton
          label="Todo hereda del rol"
          icon="i-lucide-corner-down-right"
          color="neutral"
          variant="subtle"
          size="xs"
          :disabled="props.disabled"
          @click="emit('setModule', 'inherit')"
        />
        <UButton
          label="Bloquear todo el módulo"
          icon="i-lucide-ban"
          color="error"
          variant="subtle"
          size="xs"
          :disabled="props.disabled"
          @click="emit('setModule', 'deny')"
        />
      </div>

      <div class="px-4 pb-4 space-y-3">
        <!-- Cabecera de columnas: en móvil cada fila lleva sus propias etiquetas. -->
        <div
          class="hidden lg:grid px-2 pb-1.5 border-b border-default text-xs font-semibold uppercase tracking-wide text-dimmed"
          :class="COLUMNS"
        >
          <span>Acción</span>
          <span>Para este usuario</span>
          <span>Resultado</span>
        </div>

        <div
          v-for="group in groups"
          :key="group.id || 'sin-categoria'"
          class="space-y-0.5"
        >
          <div class="flex items-center gap-2 px-2 pt-1">
            <UIcon
              :name="group.icon"
              class="size-3.5 text-dimmed"
            />
            <p class="text-xs font-semibold uppercase tracking-wide text-muted">
              {{ group.label }}
            </p>
            <p
              v-if="group.description"
              class="text-xs text-dimmed hidden sm:block"
            >
              · {{ group.description }}
            </p>
          </div>

          <!-- Categoría recién creada: se ve que existe, aunque aún esté vacía. -->
          <p
            v-if="!group.actions.length"
            class="px-2 py-1.5 text-sm text-dimmed"
          >
            Sin acciones todavía
          </p>

          <div
            v-for="action in group.actions"
            :key="action.id"
            class="grid grid-cols-1 rounded-md px-2 py-1"
            :class="[COLUMNS, rowClass(action.id)]"
          >
            <!-- Acción -->
            <span class="inline-flex items-center gap-1.5 text-sm text-highlighted">
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

              <UIcon
                v-if="isIrreversibleAction(action)"
                name="i-lucide-triangle-alert"
                class="size-4 text-error"
                aria-label="Acción irreversible"
              />
            </span>

            <!-- Lo que se decide para este usuario -->
            <UserPermissionOverrideControl
              :model-value="stateOf(action.id)"
              :label="`${actionLabel(action)} en ${props.module.name}`"
              :disabled="props.disabled"
              @update:model-value="emit('toggle', action.id, $event)"
            />

            <!--
              Lo que queda tras aplicar la excepción. Solo «Puede» o «No puede»:
              de qué acción se trata ya lo dice la primera columna.
            -->
            <span
              class="inline-flex items-center gap-1 text-sm font-medium"
              :class="effective(action.id) ? 'text-success' : 'text-error'"
            >
              <UIcon
                :name="effective(action.id) ? 'i-lucide-circle-check' : 'i-lucide-circle-slash'"
                class="size-4 shrink-0"
              />
              {{ effective(action.id) ? 'Puede' : 'No puede' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
