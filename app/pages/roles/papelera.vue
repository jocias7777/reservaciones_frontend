<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { RoleWithRelations } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Papelera de roles' })

const rolesApi = useRolesApi()

/** `restore` (fila) y `bulk_restore` (lote) son permisos aparte: cada botón exige el suyo. */
const { canRestoreOne, canRestoreMany } = useModuleAccess('roles')

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
} = useResourceList<RoleWithRelations>({
  key: 'roles:trash',
  fetcher: query => rolesApi.trash(query),
  searchFields: ['name', 'description'],
  expand: ['users'],
  sortBy: 'name',
  sortOrder: 'ASC'
})

const columns: TableColumn<RoleWithRelations>[] = [
  { id: 'select' },
  { accessorKey: 'name', header: 'Rol' },
  { accessorKey: 'users', header: 'Usuarios' },
  { accessorKey: 'created_at', header: 'Creado' },
  { id: 'actions' }
]

const { rowSelection, selectedIds, restoring, restoreOne, restoreSelected } = useResourceRestore<RoleWithRelations>({
  restore: role => rolesApi.restore(role.id),
  bulkRestore: ids => rolesApi.bulkRestore(ids),
  refresh,
  successOne: role => ['Rol restaurado', `«${role.name}» volvió a estar disponible.`],
  successMany: count => ['Roles restaurados', `${count} rol(es) volvieron a estar disponibles.`]
})
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <BasePageHeader
      title="Papelera de roles"
      description="Roles eliminados: se pueden recuperar mientras sigan aquí."
    >
      <template #actions>
        <UButton
          label="Volver"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="outline"
          to="/roles"
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
      :get-row-id="(row: RoleWithRelations) => row.id"
      class="border border-default rounded-lg"
    >
      <template #select-header="{ table }">
        <UCheckbox
          :model-value="table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected()"
          aria-label="Seleccionar todos los roles de la página"
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
            icon="i-lucide-shield"
            size="sm"
          />
          <div class="min-w-0">
            <p class="font-medium text-highlighted truncate">
              {{ row.original.name }}
            </p>
            <p class="text-sm text-muted truncate">
              {{ row.original.description ?? 'Sin descripción' }}
            </p>
          </div>
        </div>
      </template>

      <template #users-cell="{ row }">
        <UBadge
          :label="`${row.original.users?.length ?? 0} usuario(s)`"
          color="neutral"
          variant="subtle"
          icon="i-lucide-users"
        />
      </template>

      <template #created_at-cell="{ row }">
        <span class="text-sm text-muted">{{ formatDate(row.original.created_at) }}</span>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center justify-end gap-1">
          <UTooltip
            v-if="canRestoreOne"
            text="Recuperar"
          >
            <UButton
              icon="i-lucide-archive-restore"
              v-bind="rowAction"
              :loading="restoring"
              aria-label="Recuperar rol"
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
            : 'Los roles que elimines aparecerán aquí.'"
          variant="naked"
        />
      </template>
    </UTable>

    <BaseListPagination
      v-model:page="page"
      :total="total"
      :items-per-page="limit"
      label="rol(es)"
    />
  </UContainer>
</template>
