<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Action } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Papelera de acciones' })

const actionsApi = useActionsApi()

/** `restore` (fila) y `bulk_restore` (lote) son permisos aparte: cada botón exige el suyo. */
const { canRestoreOne, canRestoreMany } = useModuleAccess('actions')

const rowAction = rowActionProps('success')

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
  key: 'actions:trash',
  fetcher: query => actionsApi.trash(query),
  searchFields: ['code', 'name', 'description'],
  expand: ['category', 'permission'],
  sortBy: 'code',
  sortOrder: 'ASC'
})

const columns: TableColumn<Action>[] = [
  { id: 'select' },
  { accessorKey: 'name', header: 'Acción' },
  // Igual que en el listado: desde que cada acción pertenece a un módulo, hay
  // una «Crear» por módulo, y sin esta columna la papelera parece llena de
  // duplicados y no se sabe cuál se está recuperando.
  { accessorKey: 'permission', header: 'Módulo' },
  { accessorKey: 'category', header: 'Categoría' },
  { accessorKey: 'description', header: 'Descripción' },
  { id: 'row-actions' }
]

const { rowSelection, selectedIds, restoring, restoreOne, restoreSelected } = useResourceRestore<Action>({
  restore: action => actionsApi.restore(action.id),
  bulkRestore: ids => actionsApi.bulkRestore(ids),
  refresh,
  successOne: action => ['Acción restaurada', `«${action.name}» volvió a la matriz de permisos.`],
  successMany: count => ['Acciones restauradas', `${count} acción(es) volvieron a la matriz de permisos.`]
})
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <BasePageHeader
      title="Papelera de acciones"
      description="Acciones eliminadas: se pueden recuperar mientras sigan aquí."
    >
      <template #actions>
        <UButton
          label="Volver"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="outline"
          to="/roles/acciones"
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
      placeholder="Buscar por código o nombre…"
      :loading="pending"
    >
      <template #actions>
        <UButton
          v-if="selectedIds.length && canRestoreMany"
          :label="`Restaurar (${selectedIds.length})`"
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

      <template #description-cell="{ row }">
        <span class="text-sm text-muted line-clamp-2">
          {{ row.original.description ?? '—' }}
        </span>
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
              aria-label="Recuperar acción"
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
            ? 'Prueba con otro código o nombre.'
            : 'Las acciones que elimines aparecerán aquí.'"
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
