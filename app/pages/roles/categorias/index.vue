<script setup lang="ts">
import type { ButtonProps, TableColumn } from '@nuxt/ui'
import type { ActionCategory } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Categorías de acciones' })

/**
 * Catálogo de categorías (`sa_category_permissions`): los bloques en los que se
 * reparten las acciones dentro de la tarjeta de cada módulo.
 *
 * Cada fila es literalmente lo que se ve en la matriz de permisos: nombre =
 * título del bloque, descripción = subtítulo, icono y orden = cómo y dónde
 * aparece. Por eso el listado se ordena por `sort_order`: se lee en el mismo
 * orden en el que se mostrará.
 */
const categoriesApi = useActionCategoriesApi()
const access = useAccessControl()

/** La papelera solo se ofrece si el rol (o una excepción suya) tiene `restore` o `bulk_restore`. */
const canRestore = computed(() => access.canRestoreAny('action_categories'))

/** Agregar, editar y eliminar (uno o en lote) son permisos aparte: cada botón se ofrece por su cuenta. */
const canCreate = computed(() => access.can('action_categories', 'create'))
const canUpdate = computed(() => access.can('action_categories', 'update'))
const canDelete = computed(() => access.can('action_categories', 'delete'))
const canBulkDelete = computed(() => access.can('action_categories', 'bulk_delete'))

/** Botones de acción de cada fila: iconos algo menores que los del resto. */
const rowAction = {
  color: 'neutral',
  variant: 'ghost',
  ui: { leadingIcon: 'size-5' }
} satisfies ButtonProps

/** Acción principal de la pantalla: la misma en la cabecera y en el estado vacío. */
const addCategory: ButtonProps = {
  label: 'Agregar categoría',
  icon: 'i-lucide-shapes',
  to: '/roles/categorias/nueva'
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
} = useResourceList<ActionCategory>({
  key: 'action-categories:list',
  fetcher: query => categoriesApi.query(query),
  searchFields: ['name', 'description'],
  expand: ['actions'],
  sortBy: 'sort_order',
  sortOrder: 'ASC'
})

const columns: TableColumn<ActionCategory>[] = [
  { id: 'select' },
  { accessorKey: 'sort_order', header: 'Orden' },
  { accessorKey: 'name', header: 'Categoría' },
  { accessorKey: 'description', header: 'Descripción' },
  { accessorKey: 'actions', header: 'Acciones' },
  { accessorKey: 'created_at', header: 'Creada' },
  { id: 'row-actions' }
]

const { rowSelection, selectedIds, removing, removeOne, removeSelected } = useResourceRemoval<ActionCategory>({
  remove: category => categoriesApi.remove(category.id),
  bulkRemove: ids => categoriesApi.bulkRemove(ids),
  refresh,
  successOne: category => ['Categoría eliminada', `Las acciones de «${category.name}» pasan al bloque «Otras acciones».`],
  successMany: count => ['Categorías eliminadas', `${count} categoría(s) pasaron a la papelera.`]
})
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <BasePageHeader
      title="Categorías de acciones"
      description="Los bloques en los que se agrupan las acciones dentro de cada módulo, en el orden en que se muestran."
    >
      <template #actions>
        <UButton
          v-if="canCreate"
          v-bind="addCategory"
        />
      </template>
    </BasePageHeader>

    <BaseErrorAlert
      :error="error"
      title="No se pudieron cargar las categorías"
      @retry="refresh"
    />

    <BaseListToolbar
      v-model:search="searchInput"
      placeholder="Buscar por nombre o descripción…"
      :loading="pending"
    >
      <template #actions>
        <UButton
          v-if="canRestore"
          label="Papelera"
          icon="i-lucide-archive"
          color="neutral"
          variant="outline"
          to="/roles/categorias/papelera"
        />

        <BaseConfirmPopover
          v-if="selectedIds.length && canBulkDelete"
          title="¿Eliminar las categorías seleccionadas?"
          :description="`Se enviarán ${selectedIds.length} categoría(s) a la papelera. Sus acciones no se borran: pasan al bloque «Otras acciones».`"
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
      :get-row-id="(row: ActionCategory) => row.id"
      class="border border-default rounded-lg"
    >
      <template #select-header="{ table }">
        <UCheckbox
          :model-value="table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected()"
          aria-label="Seleccionar todas las categorías de la página"
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

      <template #sort_order-cell="{ row }">
        <span class="text-sm tabular-nums text-muted">{{ row.original.sort_order }}</span>
      </template>

      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <BaseIconTile
            :icon="categoryIcon(row.original)"
            size="sm"
          />
          <div class="min-w-0">
            <p class="font-medium text-highlighted truncate">
              {{ row.original.name }}
            </p>
            <span class="text-xs text-muted">{{ row.original.icon ?? 'Sin icono' }}</span>
          </div>
        </div>
      </template>

      <template #description-cell="{ row }">
        <span class="text-sm text-muted line-clamp-2">
          {{ row.original.description ?? '—' }}
        </span>
      </template>

      <!--
        Qué acciones cayeron en esta categoría. Es la comprobación de que lo que
        se elige al dar de alta una acción se ve luego desde el otro lado.
      -->
      <template #actions-cell="{ row }">
        <UTooltip
          v-if="row.original.actions?.length"
          :text="row.original.actions.map(action => action.name).join(', ')"
        >
          <UBadge
            :label="`${row.original.actions.length} acción(es)`"
            color="neutral"
            variant="subtle"
            icon="i-lucide-list-checks"
          />
        </UTooltip>
        <span
          v-else
          class="text-sm text-dimmed"
        >Sin acciones</span>
      </template>

      <template #created_at-cell="{ row }">
        <span class="text-sm text-muted">{{ formatDate(row.original.created_at) }}</span>
      </template>

      <template #row-actions-cell="{ row }">
        <div class="flex items-center justify-end gap-1">
          <UTooltip
            v-if="canUpdate"
            text="Editar categoría"
          >
            <UButton
              :to="`/roles/categorias/${row.original.id}`"
              icon="i-lucide-square-pen"
              v-bind="rowAction"
              aria-label="Editar categoría"
            />
          </UTooltip>

          <BaseConfirmPopover
            v-if="canDelete"
            title="¿Eliminar esta categoría?"
            :description="`Las acciones de «${row.original.name}» no se borran: pasan al bloque «Otras acciones» hasta que se les asigne otra.`"
            :loading="removing"
            @confirm="removeOne(row.original)"
          >
            <UButton
              icon="i-lucide-trash-2"
              v-bind="rowAction"
              color="error"
              aria-label="Eliminar categoría"
            />
          </BaseConfirmPopover>
        </div>
      </template>

      <template #empty>
        <UEmpty
          :icon="isFiltered ? 'i-lucide-search-x' : 'i-lucide-shapes'"
          :title="isFiltered ? 'Sin resultados' : 'No hay categorías'"
          :description="isFiltered
            ? 'Prueba con otro nombre o descripción.'
            : 'Crea la primera categoría para poder agrupar las acciones por lo que hacen.'"
          :actions="isFiltered || !canCreate ? [] : [addCategory]"
          variant="naked"
        />
      </template>
    </UTable>

    <BaseListPagination
      v-model:page="page"
      :total="total"
      :items-per-page="limit"
      label="categoría(s)"
    />
  </UContainer>
</template>
