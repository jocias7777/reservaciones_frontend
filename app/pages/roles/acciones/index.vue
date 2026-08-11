<script setup lang="ts">
import type { ButtonProps, TableColumn } from '@nuxt/ui'
import type { Action } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Acciones' })

/**
 * Catálogo de acciones: qué se puede permitir o negar sobre cada módulo.
 *
 * Se pueden dar de alta, pero la acción solo restringe algo cuando el backend
 * protege alguna ruta con su código (`require_permission(modulo, '<code>')`).
 * Mientras tanto se puede conceder y revocar, pero no impide nada.
 */
const actionsApi = useActionsApi()
const modulesApi = useModulesApi()
const access = useAccessControl()

/** La papelera solo se ofrece si el rol (o una excepción suya) tiene `restore` o `bulk_restore`. */
const canRestore = computed(() => access.canRestoreAny('actions'))

/**
 * En qué módulos comprueba el backend cada acción.
 *
 * La matriz de permisos ofrece TODAS las acciones en todos los módulos, así que
 * una acción recién creada se puede conceder desde el primer momento. Otra cosa
 * es que restrinja algo: eso solo pasa donde alguna ruta la comprueba, y es lo
 * que dice esta columna para no dar por hecho un permiso que no frena nada.
 */
const { data: availableActions } = useAsyncData(
  'permissions:available-actions',
  () => modulesApi.availableActions().catch(() => ({})),
  { server: false, default: () => ({}) }
)

/** Códigos de acción que algún módulo comprueba. */
const usedCodes = computed(() => new Set(Object.values(availableActions.value).flat()))

/** Nombres de los módulos donde se comprueba una acción. */
function modulesUsing(code: string): string[] {
  return Object.entries(availableActions.value)
    .filter(([, codes]) => codes.includes(code))
    .map(([moduleCode]) => moduleCode)
}

/** Botones de acción de cada fila: iconos algo menores que los del resto. */
const rowAction = {
  color: 'neutral',
  variant: 'ghost',
  ui: { leadingIcon: 'size-5' }
} satisfies ButtonProps

/** Acción principal de la pantalla: la misma en la cabecera y en el estado vacío. */
const addAction: ButtonProps = {
  label: 'Agregar acción',
  icon: 'i-lucide-circle-plus',
  to: '/roles/acciones/nueva'
}

const {
  items,
  total,
  page,
  limit,
  pending,
  isFiltered,
  searchInput,
  error,
  refresh
} = useResourceList<Action>({
  key: 'actions:list',
  fetcher: query => actionsApi.query(query),
  searchFields: ['code', 'name', 'description'],
  expand: ['category'],
  sortBy: 'code',
  sortOrder: 'ASC'
})

const columns: TableColumn<Action>[] = [
  { id: 'select' },
  { accessorKey: 'name', header: 'Acción' },
  { accessorKey: 'category', header: 'Categoría' },
  { id: 'usage', header: 'Efecto real' },
  { accessorKey: 'description', header: 'Descripción' },
  { id: 'row-actions' }
]

const { rowSelection, selectedIds, removing, removeOne, removeSelected } = useResourceRemoval<Action>({
  remove: action => actionsApi.remove(action.id),
  bulkRemove: ids => actionsApi.bulkRemove(ids),
  refresh,
  successOne: action => ['Acción eliminada', `«${action.name}» ya no aparece en la matriz de permisos.`],
  successMany: count => ['Acciones eliminadas', `${count} acción(es) pasaron a la papelera.`]
})
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <BasePageHeader
      title="Acciones"
      description="Lo que se puede permitir o negar sobre cada módulo del sistema."
    >
      <template #actions>
        <UButton v-bind="addAction" />
      </template>
    </BasePageHeader>

    <BaseErrorAlert
      :error="error"
      title="No se pudieron cargar las acciones"
      @retry="refresh"
    />

    <BaseListToolbar
      v-model:search="searchInput"
      placeholder="Buscar por código o nombre…"
      :loading="pending"
    >
      <template #actions>
        <UButton
          v-if="canRestore"
          label="Papelera"
          icon="i-lucide-archive"
          color="neutral"
          variant="outline"
          to="/roles/acciones/papelera"
        />

        <BaseConfirmPopover
          v-if="selectedIds.length"
          title="¿Eliminar las acciones seleccionadas?"
          :description="`Se enviarán ${selectedIds.length} acción(es) a la papelera. Si alguna está concedida en permisos, no se eliminará ninguna.`"
          :loading="removing"
          @confirm="removeSelected"
        >
          <UButton
            :label="`Eliminar (${selectedIds.length})`"
            icon="i-lucide-trash-2"
            color="error"
            variant="subtle"
          />
        </BaseConfirmPopover>
      </template>
    </BaseListToolbar>

    <UTable
      v-model:row-selection="rowSelection"
      :data="items"
      :columns="columns"
      :loading="pending"
      :get-row-id="(row: Action) => row.id"
      class="border border-default rounded-lg"
    >
      <template #select-header="{ table }">
        <UCheckbox
          :model-value="table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected()"
          aria-label="Seleccionar todas las acciones de la página"
          @update:model-value="table.toggleAllPageRowsSelected(!!$event)"
        />
      </template>

      <template #select-cell="{ row }">
        <UCheckbox
          :model-value="row.getIsSelected()"
          :aria-label="`Seleccionar ${row.original.name}`"
          @update:model-value="row.toggleSelected(!!$event)"
        />
      </template>

      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <BaseIconTile
            :icon="row.original.category ? categoryIcon(row.original.category) : 'i-lucide-shapes'"
            size="sm"
          />
          <div class="min-w-0">
            <p class="font-medium text-highlighted truncate">
              {{ row.original.name }}
            </p>
            <span class="text-xs text-muted">{{ row.original.code }}</span>
          </div>
        </div>
      </template>

      <template #category-cell="{ row }">
        <UBadge
          v-if="row.original.category"
          :label="row.original.category.name"
          color="neutral"
          variant="subtle"
          :icon="categoryIcon(row.original.category)"
        />
        <UBadge
          v-else
          label="Sin categoría"
          color="warning"
          variant="subtle"
          icon="i-lucide-circle-help"
        />
      </template>

      <!--
        En cuántos módulos restringe algo de verdad. Se puede conceder en todos
        —la matriz ofrece el catálogo completo—, pero solo frena donde el backend
        comprueba el código, y eso conviene saberlo antes de darlo por hecho.
      -->
      <template #usage-cell="{ row }">
        <UTooltip
          v-if="usedCodes.has(row.original.code)"
          :text="`Se comprueba en: ${modulesUsing(row.original.code).join(', ')}`"
        >
          <UBadge
            :label="`${modulesUsing(row.original.code).length} módulo(s)`"
            color="neutral"
            variant="subtle"
            icon="i-lucide-shield-check"
          />
        </UTooltip>
        <UTooltip
          v-else
          text="Ya se puede conceder en cualquier módulo, pero todavía no restringe nada: ninguna ruta del backend comprueba este código. Empezará a surtir efecto en cuanto alguna lo haga."
        >
          <UBadge
            label="Todavía sin efecto"
            color="warning"
            variant="subtle"
            icon="i-lucide-circle-alert"
          />
        </UTooltip>
      </template>

      <template #description-cell="{ row }">
        <span class="text-sm text-muted line-clamp-2">
          {{ row.original.description ?? '—' }}
        </span>
      </template>

      <template #row-actions-cell="{ row }">
        <div class="flex items-center justify-end gap-1">
          <UTooltip text="Editar acción">
            <UButton
              :to="`/roles/acciones/${row.original.id}`"
              icon="i-lucide-square-pen"
              v-bind="rowAction"
              aria-label="Editar acción"
            />
          </UTooltip>

          <BaseConfirmPopover
            title="¿Eliminar esta acción?"
            :description="`«${row.original.name}» dejará de aparecer en la matriz de permisos. Si está concedida en algún permiso, primero hay que quitarla de ahí.`"
            :loading="removing"
            @confirm="removeOne(row.original)"
          >
            <UButton
              icon="i-lucide-trash-2"
              v-bind="rowAction"
              color="error"
              aria-label="Eliminar acción"
            />
          </BaseConfirmPopover>
        </div>
      </template>

      <template #empty>
        <UEmpty
          :icon="isFiltered ? 'i-lucide-search-x' : 'i-lucide-circle-plus'"
          :title="isFiltered ? 'Sin resultados' : 'No hay acciones'"
          :description="isFiltered
            ? 'Prueba con otro código o nombre.'
            : 'Crea la primera acción para poder concederla en los permisos de cada rol.'"
          :actions="isFiltered ? [] : [addAction]"
          variant="naked"
        />
      </template>
    </UTable>

    <BaseListPagination
      v-model:page="page"
      :total="total"
      :items-per-page="limit"
      label="acción(es)"
    />
  </UContainer>
</template>
