<script setup lang="ts">
import type { Action, ActionCategory, OverrideState, PermissionModule } from '~/types'

/**
 * Lista de tarjetas de módulo de la pantalla de permisos de un usuario.
 *
 * A diferencia de `PermissionModuleList` —la de los roles, que solo itera— esta
 * carga con el problema de escala de la pantalla: los módulos crecen con la
 * aplicación y la lista entera abierta es un scroll sin fondo. Por eso vive aquí
 * lo que decide QUÉ se ve: el buscador, el filtro de excepciones y qué tarjetas
 * están abiertas.
 *
 * El estado de apertura lo lleva la lista y no cada tarjeta porque hay cosas que
 * solo se pueden decidir viendo el conjunto: abrir de golpe lo que encuentre una
 * búsqueda, o plegarlo y desplegarlo todo con un botón.
 */
const props = withDefaults(defineProps<{
  modules: PermissionModule[]
  actions: Action[]
  /** Categorías con las que se agrupan las acciones dentro de cada tarjeta. */
  categories?: ActionCategory[]
  /** Estado elegido: `{ [moduleId]: { [actionId]: OverrideState } }`. */
  states: Record<string, Record<string, OverrideState>>
  /** Lo que concede el rol: `{ [moduleId]: { [actionId]: boolean } }`. */
  inherited: Record<string, Record<string, boolean>>
  disabled?: boolean
}>(), {
  categories: () => [],
  disabled: false
})

const emit = defineEmits<{
  toggle: [moduleId: string, actionId: string, state: OverrideState]
  setModule: [moduleId: string, state: OverrideState]
}>()

/**
 * Cada tarjeta recibe SUS acciones, no todas: una acción pertenece a un módulo,
 * así que la matriz es cada módulo con las suyas, no un producto de las dos
 * listas. Se reparte aquí una vez, en vez de que cada tarjeta filtre el total.
 */
const actionsByModule = computed(() =>
  Object.fromEntries(
    props.modules.map(module => [module.id, actionsOfModule(props.actions, module.id)])
  )
)

const query = ref('')
const onlyExceptions = ref(false)

const exceptionCountOf = (moduleId: string) =>
  Object.values(props.states[moduleId] ?? {}).filter(state => state !== 'inherit').length

const modulesWithExceptions = computed(() =>
  props.modules.filter(module => exceptionCountOf(module.id) > 0)
)

/**
 * Si algún módulo tiene una acción que coincide, se dejan ver todos los que la
 * tengan: buscar «eliminar» responde a «en qué módulos puede borrar este
 * usuario», que es la lectura útil. Cada módulo decide después si él coincide,
 * mirando solo SUS acciones.
 */
const someActionMatches = computed(() =>
  props.actions.some(action => actionMatchesQuery(action, query.value))
)

const visibleModules = computed(() => props.modules.filter((module) => {
  if (onlyExceptions.value && !exceptionCountOf(module.id)) return false
  if (!query.value.trim()) return true

  return moduleMatchesQuery(module, query.value) || someActionMatches.value
}))

const openIds = ref(new Set<string>())

const isOpen = (moduleId: string) => openIds.value.has(moduleId)

function setOpen(moduleId: string, open: boolean) {
  const next = new Set(openIds.value)
  if (open) next.add(moduleId)
  else next.delete(moduleId)
  openIds.value = next
}

/**
 * Todos los módulos arrancan plegados: así se ve la lista entera de un vistazo
 * y se abre el que se venía a tocar, en lugar de caer en medio de un scroll.
 *
 * Lo que hay que revisar no se esconde por eso: cada cabecera lleva su insignia
 * de excepciones y su recuento, que es lo que dice dónde mirar sin desplegar
 * nada. Y el buscador abre por su cuenta lo que encuentra.
 *
 * Se reinicia cuando cambian los módulos, que es lo que pasa al recargar los
 * datos después de guardar.
 */
watch(() => props.modules, () => {
  openIds.value = new Set()
}, { immediate: true })

// Una búsqueda tiene que enseñar lo que encuentra: no vale devolver tarjetas
// cerradas y obligar a abrirlas una a una.
watch(query, (value) => {
  if (!value.trim()) return

  const next = new Set(openIds.value)
  for (const module of visibleModules.value) next.add(module.id)
  openIds.value = next
})

const allOpen = computed(() =>
  visibleModules.value.length > 0 && visibleModules.value.every(module => isOpen(module.id))
)

function toggleAll() {
  const next = new Set(openIds.value)
  for (const module of visibleModules.value) {
    if (allOpen.value) next.delete(module.id)
    else next.add(module.id)
  }
  openIds.value = next
}

function clearFilters() {
  query.value = ''
  onlyExceptions.value = false
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
      <UInput
        v-model="query"
        icon="i-lucide-search"
        placeholder="Buscar módulo o acción"
        class="w-full sm:w-64"
        aria-label="Buscar módulo o acción"
        :disabled="props.disabled"
      >
        <template
          v-if="query"
          #trailing
        >
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="link"
            size="xs"
            aria-label="Limpiar la búsqueda"
            @click="query = ''"
          />
        </template>
      </UInput>

      <!--
        Es la pregunta que más se hace esta pantalla: «¿en qué se sale este
        usuario de su rol?». Se desactiva cuando no hay ninguna, porque un filtro
        que solo puede dejar la lista vacía no es una opción.
      -->
      <USwitch
        v-model="onlyExceptions"
        label="Solo con excepciones"
        :disabled="props.disabled || !modulesWithExceptions.length"
      />

      <UButton
        :label="allOpen ? 'Plegar todo' : 'Abrir todo'"
        :icon="allOpen ? 'i-lucide-chevrons-down-up' : 'i-lucide-chevrons-up-down'"
        color="neutral"
        variant="ghost"
        size="xs"
        :disabled="props.disabled || !visibleModules.length"
        @click="toggleAll"
      />

      <!--
        El control de cada acción es solo iconos para que quepan tres columnas de
        acciones por módulo. La leyenda va aquí, una vez, en lugar de repetir tres
        palabras en cada una de las ciento y pico celdas.
      -->
      <div
        class="ms-auto hidden items-center gap-3 text-xs text-dimmed sm:flex"
        aria-hidden="true"
      >
        <span class="inline-flex items-center gap-1">
          <UIcon
            name="i-lucide-corner-down-right"
            class="size-3.5"
          />
          Hereda
        </span>
        <span class="inline-flex items-center gap-1">
          <UIcon
            name="i-lucide-check"
            class="size-3.5"
          />
          Permitir
        </span>
        <span class="inline-flex items-center gap-1">
          <UIcon
            name="i-lucide-ban"
            class="size-3.5"
          />
          Bloquear
        </span>
      </div>
    </div>

    <UEmpty
      v-if="!visibleModules.length"
      icon="i-lucide-search-x"
      title="Ningún módulo coincide"
      :description="onlyExceptions && !modulesWithExceptions.length
        ? 'Este usuario no tiene ninguna excepción: todo lo que puede hacer sale de su rol.'
        : 'Prueba con otro término o quita el filtro.'"
      :actions="[{
        label: 'Quitar filtros',
        icon: 'i-lucide-rotate-ccw',
        color: 'neutral',
        variant: 'outline',
        onClick: clearFilters
      }]"
    />

    <UserPermissionModuleCard
      v-for="module in visibleModules"
      :key="module.id"
      :module="module"
      :actions="actionsByModule[module.id] ?? []"
      :categories="props.categories"
      :states="props.states[module.id] ?? {}"
      :inherited="props.inherited[module.id] ?? {}"
      :query="query"
      :disabled="props.disabled"
      :open="isOpen(module.id)"
      @update:open="setOpen(module.id, $event)"
      @toggle="(actionId, state) => emit('toggle', module.id, actionId, state)"
      @set-module="state => emit('setModule', module.id, state)"
    />
  </div>
</template>
