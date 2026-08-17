<script setup lang="ts">
import type { Action, ActionCategory, OverrideState, PermissionModule } from '~/types'

/**
 * Tarjeta de un módulo en los permisos de un usuario.
 *
 * Reparte las acciones en bloques por categoría, igual que `PermissionModuleCard`
 * —la de los roles—, y por el mismo motivo: una acción por fila no escala. El
 * catálogo de acciones crece (leer, exportar, imprimir, eliminar masivo...) y con
 * una fila por acción y un módulo debajo de otro la pantalla se convierte en un
 * scroll sin fondo. En bloques, doce acciones ocupan tres filas en vez de doce.
 *
 * Esta tarjeta tiene que decir tres cosas por acción donde la de roles dice una,
 * y ninguna de las tres tiene columna propia:
 *
 * - qué se decide para este usuario → el control segmentado;
 * - qué queda al final → el nombre de la acción, atenuado cuando no puede;
 * - qué concede su rol → el tooltip de la opción «Hereda», que es el único
 *   momento en que alguien se lo pregunta («si lo dejo heredando, ¿qué pasa?»).
 *
 * Antes eran cuatro columnas de tabla con «Sí/No» y «Puede/No puede» escritos en
 * cada fila. Cabían las tres cosas, pero solo cabía una acción por línea.
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
  /** Búsqueda activa en la lista; estrecha las acciones que se pintan. */
  query?: string
  disabled?: boolean
  open?: boolean
}>(), {
  categories: () => [],
  query: '',
  disabled: false,
  open: false
})

const emit = defineEmits<{
  'toggle': [actionId: string, state: OverrideState]
  'setModule': [state: OverrideState]
  'update:open': [value: boolean]
}>()

const stateOf = (actionId: string): OverrideState => props.states[actionId] ?? 'inherit'

const inheritedOf = (actionId: string): boolean => Boolean(props.inherited[actionId])

/** Lo que de verdad podrá hacer: la excepción manda sobre el rol. */
function effective(actionId: string): boolean {
  return resolveEffective(stateOf(actionId), inheritedOf(actionId))
}

/**
 * El resultado se lee en el nombre de la acción, que no es texto accesible: para
 * el lector de pantalla se dice aparte.
 */
function outcomeText(actionId: string): string {
  return effective(actionId) ? 'Puede hacerlo' : 'No puede hacerlo'
}

const moduleMatches = computed(() => moduleMatchesQuery(props.module, props.query))

/**
 * Con búsqueda activa se pintan solo las acciones que coinciden. Si lo que
 * coincidió fue el módulo, se muestran todas: buscar «usuarios» es querer ver
 * ese módulo entero, no ninguna de sus acciones en particular.
 */
const visibleActions = computed(() => {
  if (!props.query.trim() || moduleMatches.value) return props.actions
  return props.actions.filter(action => actionMatchesQuery(action, props.query))
})

const groups = computed(() => {
  const all = groupActions(visibleActions.value, props.categories)

  // Filtrando, un bloque vacío no es «una categoría sin acciones todavía» sino
  // una categoría sin coincidencias, y ese aviso solo estorba.
  return props.query.trim() && !moduleMatches.value
    ? all.filter(group => group.actions.length)
    : all
})

/** Los recuentos son siempre sobre el módulo entero, nunca sobre lo filtrado. */
const exceptionCount = computed(() =>
  props.actions.filter(action => stateOf(action.id) !== 'inherit').length
)

const effectiveCount = computed(() => props.actions.filter(action => effective(action.id)).length)

const exceptionLabel = computed(() =>
  exceptionCount.value === 1 ? '1 excepción' : `${exceptionCount.value} excepciones`
)
</script>

<template>
  <!--
    `UCollapsible` en lugar de un `v-if`: el cuerpo entra y sale animando su
    altura (200 ms) en vez de aparecer de golpe, y además marca el `aria-expanded`
    y el `aria-controls` de la cabecera sin tener que escribirlos.

    Abierto o cerrado lo decide la lista, no la tarjeta: de arranque solo se abren
    los módulos con excepciones, y una búsqueda tiene que enseñar lo que encuentra.

    Su ranura por defecto se monta con `as-child`, así que ahí dentro va un único
    elemento y nada más, ni un comentario. Ese elemento es la cabecera entera, no
    solo la flecha: el objetivo de pulsación pasa de 36px a toda la fila, y por
    eso la flecha ya no es un botón (uno dentro de otro no es HTML válido) sino
    un icono que gira.
  -->
  <UCollapsible
    :open="props.open"
    :disabled="props.disabled"
    class="border border-default rounded-lg bg-default"
    :ui="{ content: 'motion-reduce:animate-none' }"
    @update:open="emit('update:open', $event)"
  >
    <button
      type="button"
      class="flex w-full items-center gap-3 rounded-t-lg p-4 text-start transition-colors duration-150 ease-out-quint hover:not-disabled:bg-elevated/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed motion-reduce:transition-none"
      :class="!props.open && 'rounded-b-lg'"
    >
      <BaseIconTile :icon="moduleIcon(props.module)" />

      <div class="min-w-0 flex-1">
        <p class="font-semibold text-highlighted truncate">
          {{ props.module.name }}
        </p>
        <p class="text-sm text-muted truncate">
          <span class="text-xs text-dimmed">{{ props.module.code }}</span>
          <template v-if="props.module.description">
            · {{ props.module.description }}
          </template>
        </p>
      </div>

      <!--
        Con los módulos plegados de arranque, esta insignia es lo único que
        delata que aquí dentro hay algo fuera de lo normal. Se ve siempre, también
        en móvil.
      -->
      <UBadge
        v-if="exceptionCount"
        :label="exceptionLabel"
        color="warning"
        variant="subtle"
        class="shrink-0"
      />

      <span class="shrink-0 text-sm text-muted tabular-nums whitespace-nowrap">
        {{ effectiveCount }}<span class="text-dimmed">/{{ props.actions.length }}</span>
        <span class="hidden sm:inline"> permisos</span>
      </span>

      <UIcon
        name="i-lucide-chevron-down"
        class="size-5 shrink-0 text-dimmed transition-transform duration-200 ease-out-quint motion-reduce:transition-none"
        :class="props.open && 'rotate-180'"
      />
    </button>

    <template #content>
      <div class="border-t border-default">
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

        <!--
          Tres bloques por fila, no cuatro como en la tarjeta de roles: allí cada
          acción lleva un interruptor y aquí un control de tres posiciones, que es
          el doble de ancho.

          Es flex y no grid a propósito: con `grid-cols-3` las columnas existen
          aunque estén vacías, así que dos categorías quedarían pegadas a la
          izquierda con un hueco muerto a la derecha.

          El separador se quita al primero DE CADA FILA (`nth-child(3n+1)`), no
          solo al primero de todos, porque las categorías se administran y pueden
          ser tantas como haga falta. Se le quita la línea pero NO el hueco: el
          ancho incluye el relleno (`border-box`), así que dejarlo sin relleno le
          daría al primer bloque de cada fila más sitio que a los demás.
        -->
        <div class="flex flex-wrap justify-center gap-x-6 gap-y-8 px-4 pb-5 lg:gap-x-8">
          <div
            v-for="group in groups"
            :key="group.id || 'sin-categoria'"
            class="min-w-0 w-full space-y-3 sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1.334rem)] lg:border-s lg:border-default lg:ps-8 lg:[&:nth-child(3n+1)]:border-s-0"
          >
            <div class="flex items-center gap-2">
              <UIcon
                :name="group.icon"
                class="size-4 shrink-0 text-dimmed"
              />
              <div class="min-w-0">
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

            <div class="space-y-1.5">
              <div
                v-for="action in group.actions"
                :key="action.id"
                class="flex items-center gap-2"
              >
                <UserPermissionOverrideControl
                  :model-value="stateOf(action.id)"
                  :inherited="inheritedOf(action.id)"
                  :label="`${actionLabel(action)} en ${props.module.name}`"
                  :disabled="props.disabled"
                  @update:model-value="emit('toggle', action.id, $event)"
                />

                <!--
                  El resultado vive aquí: atenuado = no puede. No se trunca a
                  propósito; un nombre de permiso cortado a media palabra
                  («Eliminar masivo perman…») es justo el sitio donde no conviene
                  adivinar.
                -->
                <span
                  class="inline-flex min-w-0 flex-wrap items-center gap-x-1.5 text-sm transition-colors duration-200 ease-out-quint motion-reduce:transition-none"
                  :class="effective(action.id) ? 'text-highlighted' : 'text-dimmed'"
                >
                  {{ actionLabel(action) }}

                  <UTooltip
                    v-if="actionHint(action)"
                    :text="actionHint(action)"
                  >
                    <UIcon
                      name="i-lucide-circle-help"
                      class="size-4 shrink-0 text-dimmed"
                    />
                  </UTooltip>

                  <UIcon
                    v-if="actionWarning(action)"
                    name="i-lucide-triangle-alert"
                    class="size-4 shrink-0 text-error"
                    :aria-label="actionWarning(action)"
                  />

                  <span class="sr-only">{{ outcomeText(action.id) }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UCollapsible>
</template>
