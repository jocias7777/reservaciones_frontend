<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { UserWithRelations } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Papelera de usuarios' })

const usersApi = useUsersApi()

/** `restore` (fila) y `bulk_restore` (lote) son permisos aparte: cada botón exige el suyo. */
const { canRestoreOne, canRestoreMany } = useModuleAccess('users')

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
} = useResourceList<UserWithRelations>({
  key: 'users:trash',
  fetcher: query => usersApi.trash(query),
  searchFields: ['email', 'username'],
  expand: ['role', 'profile'],
  sortBy: 'created_at',
  sortOrder: 'DESC'
})

const columns: TableColumn<UserWithRelations>[] = [
  { id: 'select' },
  { accessorKey: 'email', header: 'Usuario' },
  { accessorKey: 'role', header: 'Rol' },
  { accessorKey: 'is_active', header: 'Estado' },
  { accessorKey: 'created_at', header: 'Creado' },
  { id: 'actions' }
]

const { rowSelection, selectedIds, restoring, restoreOne, restoreSelected } = useResourceRestore<UserWithRelations>({
  restore: user => usersApi.restore(user.id),
  bulkRestore: ids => usersApi.bulkRestore(ids),
  refresh,
  successOne: user => ['Usuario restaurado', `${user.email} volvió al listado de usuarios.`],
  successMany: count => ['Usuarios restaurados', `${count} cuenta(s) volvieron al listado de usuarios.`]
})
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <BasePageHeader
      title="Papelera de usuarios"
      description="Cuentas eliminadas: se pueden recuperar mientras sigan aquí."
    >
      <template #actions>
        <UButton
          label="Volver"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="outline"
          to="/usuarios"
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
      placeholder="Buscar por correo o nombre de usuario…"
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
      :get-row-id="(row: UserWithRelations) => row.id"
      class="border border-default rounded-lg"
    >
      <template #select-header="{ table }">
        <UCheckbox
          :model-value="table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected()"
          aria-label="Seleccionar todos los usuarios de la página"
          @update:model-value="table.toggleAllPageRowsSelected(!!$event)"
        />
      </template>

      <template #select-cell="{ row }">
        <UCheckbox
          :model-value="row.getIsSelected()"
          :aria-label="`Seleccionar ${row.original.email}`"
          @update:model-value="row.toggleSelected(!!$event)"
        />
      </template>

      <template #email-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar
            :src="row.original.profile?.foto_url || undefined"
            :text="initials(fullName(row.original.profile) ?? row.original.email)"
            size="sm"
          />
          <div class="min-w-0">
            <p class="font-medium text-highlighted truncate">
              {{ fullName(row.original.profile) ?? row.original.username ?? row.original.email }}
            </p>
            <p class="text-sm text-muted truncate">
              {{ row.original.email }}
            </p>
          </div>
        </div>
      </template>

      <template #role-cell="{ row }">
        <UBadge
          v-if="row.original.role"
          :label="row.original.role.name"
          color="neutral"
          variant="subtle"
          icon="i-lucide-shield"
        />
        <span
          v-else
          class="text-sm text-muted"
        >Sin rol</span>
      </template>

      <template #is_active-cell="{ row }">
        <UBadge
          :label="row.original.is_active ? 'Activo' : 'Inactivo'"
          :color="row.original.is_active ? 'success' : 'neutral'"
          variant="subtle"
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
              aria-label="Recuperar usuario"
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
            ? 'Prueba con otro correo o nombre de usuario.'
            : 'Los usuarios que elimines aparecerán aquí.'"
          variant="naked"
        />
      </template>
    </UTable>

    <BaseListPagination
      v-model:page="page"
      :total="total"
      :items-per-page="limit"
      label="usuario(s)"
    />
  </UContainer>
</template>
