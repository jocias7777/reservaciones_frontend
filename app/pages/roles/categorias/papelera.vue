<script setup lang="ts">
import type { ButtonProps, TableColumn } from '@nuxt/ui'
import type { ActionCategory } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Papelera de categorías' })

const categoriesApi = useActionCategoriesApi()

/** `restore` (fila) y `bulk_restore` (lote) son permisos aparte: cada botón exige el suyo. */
const { canRestoreOne, canRestoreMany } = useModuleAccess('action_categories')

/** Botón de restaurar de cada fila: mismo tamaño de icono que el resto de la app. */
const rowAction = {
  color: 'success',
  variant: 'ghost',
  ui: { leadingIcon: 'size-5' }
} satisfies ButtonProps

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
  key: 'action-categories:trash',
  fetcher: query => categoriesApi.trash(query),
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

const { rowSelection, selectedIds, restoring, restoreOne, restoreSelected } = useResourceRestore<ActionCategory>({
  restore: category => categoriesApi.restore(category.id),
  bulkRestore: ids => categoriesApi.bulkRestore(ids),
  refresh,
  successOne: category => ['Categoría restaurada', `«${category.name}» volvió a estar disponible.`],
  successMany: count => ['Categorías restauradas', `${count} categoría(s) volvieron a estar disponibles.`]
})
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <BasePageHeader
      title="Papelera de categorías"
      description="Categorías eliminadas: se pueden recuperar mientras sigan aquí."
    >
      <template #actions>
        <UButton
          label="Volver"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="outline"
          to="/roles/categorias"
        />
      </template>
    </BasePageHeader>

    <BaseErrorAlert
      :error="error"
      title="No se pudo cargar la papelera"
      @retry="refresh"
    />

    <BaseListToolbar
      v-model:search="searchInput"
      placeholder="Buscar por nombre o descripción…"
      :loading="pending"
    >
      <template #actions>
        <UButton
          v-if="selectedIds.length && canRestoreMany"
          :label="`Restaurar masivo (${selectedIds.length})`"
          icon="i-lucide-archive-restore"
          color="success"
          variant="subtle"
          :loading="restoring"
          @click="restoreSelected"
        />
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
            v-if="canRestoreOne"
            text="Recuperar"
          >
            <UButton
              icon="i-lucide-archive-restore"
              v-bind="rowAction"
              :loading="restoring"
              aria-label="Recuperar categoría"
              @click="restoreOne(row.original)"
            />
          </UTooltip>
        </div>
      </template>

      <template #empty>
        <UEmpty
          :icon="isFiltered ? 'i-lucide-search-x' : 'i-lucide-trash-2'"
          :title="isFiltered ? 'Sin resultados' : 'La papelera está vacía'"
          :description="isFiltered
            ? 'Prueba con otro nombre o descripción.'
            : 'Las categorías que elimines aparecerán aquí.'"
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
