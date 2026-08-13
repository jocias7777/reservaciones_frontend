<script setup lang="ts">
import type { ButtonProps, TableColumn } from '@nuxt/ui'
import type { Action, AvailableActions } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Acciones' })

/**
 * Catálogo de acciones: qué se puede permitir o negar en cada módulo.
 *
 * Cada acción pertenece a un módulo, así que «Crear» aparece una vez por cada
 * módulo que lo implemente: `users.create` y `roles.create` son dos permisos
 * distintos. Lo normal es no darlas de alta a mano —el seeder las genera a
 * partir de las rutas que existen—, y una creada a mano solo restringe algo
 * cuando el backend protege alguna ruta con su código.
 */
const actionsApi = useActionsApi()
const modulesApi = useModulesApi()

/** Un indicador por permiso: agregar, editar, eliminar (uno o en lote) y papelera. */
const { canCreate, canUpdate, canDelete, canBulkDelete, canRestore } = useModuleAccess('actions')

/**
 * Qué acciones comprueba de verdad el backend, por módulo.
 *
 * Sirve para avisar de las que existen en el catálogo pero no frenan nada:
 * normalmente son las creadas a mano antes de que exista la ruta que las
 * comprueba.
 */
const { data: availableActions } = useAsyncData<AvailableActions>(
  'permissions:available-actions',
  () => modulesApi.availableActions().catch(() => ({})),
  { server: false, default: () => ({}) }
)

/**
 * Si esta acción concreta la comprueba alguna ruta.
 *
 * Se mira por módulo Y código, no solo por código: desde que cada acción
 * pertenece a un módulo, que `roles` compruebe `hard_delete` no dice nada sobre
 * si `actions` lo comprueba.
 */
function isChecked(action: Action): boolean {
  const moduleCode = action.permission?.code
  if (!moduleCode) return false
  return (availableActions.value[moduleCode] ?? []).includes(action.code)
}

const rowAction = rowActionProps()

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
  expand: ['category', 'permission'],
  sortBy: 'code',
  sortOrder: 'ASC'
})

const columns: TableColumn<Action>[] = [
  { id: 'select' },
  { accessorKey: 'name', header: 'Acción' },
  // El módulo va primero de las dos: es lo que distingue dos acciones con el
  // mismo nombre, y sin él la tabla parece llena de duplicados.
  { accessorKey: 'permission', header: 'Módulo' },
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
        <UButton
          v-if="canCreate"
          v-bind="addAction"
        />
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
          v-if="selectedIds.length && canBulkDelete"
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
        Si esta acción frena algo de verdad. Casi todas sí: las genera el seeder
        a partir de las rutas que existen. Las que no suelen ser altas a mano
        hechas antes de que exista la ruta que las comprueba.
      -->
      <template #usage-cell="{ row }">
        <UTooltip
          v-if="isChecked(row.original)"
          :text="`El backend la comprueba en ${row.original.permission?.name}`"
        >
          <UBadge
            label="En uso"
            color="neutral"
            variant="subtle"
            icon="i-lucide-shield-check"
          />
        </UTooltip>
        <UTooltip
          v-else
          text="Se puede conceder, pero todavía no restringe nada: ninguna ruta de este módulo comprueba este código. Empezará a surtir efecto en cuanto alguna lo haga."
        >
          <UBadge
            label="Todavía sin efecto"
            color="warning"
            variant="subtle"
            icon="i-lucide-circle-alert"
          />
        </UTooltip>
      </template>

      <template #permission-cell="{ row }">
        <UBadge
          v-if="row.original.permission"
          :label="row.original.permission.name"
          color="neutral"
          variant="subtle"
          :icon="moduleIcon(row.original.permission)"
        />
        <span
          v-else
          class="text-sm text-muted"
        >—</span>
      </template>

      <template #description-cell="{ row }">
        <span class="text-sm text-muted line-clamp-2">
          {{ row.original.description ?? '—' }}
        </span>
      </template>

      <template #row-actions-cell="{ row }">
        <div class="flex items-center justify-end gap-1">
          <UTooltip
            v-if="canUpdate"
            text="Editar acción"
          >
            <UButton
              :to="`/roles/acciones/${row.original.id}`"
              icon="i-lucide-square-pen"
              v-bind="rowAction"
              aria-label="Editar acción"
            />
          </UTooltip>

          <BaseConfirmPopover
            v-if="canDelete"
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
          :actions="isFiltered || !canCreate ? [] : [addAction]"
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
