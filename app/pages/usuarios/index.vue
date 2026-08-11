<script setup lang="ts">
import type { ButtonProps, TableColumn } from '@nuxt/ui'
import type { Filters, UserWithRelations } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Usuarios' })

const usersApi = useUsersApi()

/** Un indicador por permiso: agregar, editar, eliminar (uno o en lote) y papelera. */
const { canCreate, canUpdate, canDelete, canBulkDelete, canRestore } = useModuleAccess('users')

const rowAction = rowActionProps()

/** Acción principal de la pantalla: la misma en la cabecera y en el estado vacío. */
const addUser: ButtonProps = {
  label: 'Agregar usuario',
  icon: 'i-lucide-user-round-plus',
  to: '/usuarios/nuevo'
}

/** Filtro por estado de la cuenta (`is_active` está en la whitelist del backend). */
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

const filters = computed<Filters | undefined>(() => {
  if (statusFilter.value === 'all') return undefined
  return { is_active: statusFilter.value === 'active' }
})

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
  key: 'users:list',
  fetcher: query => usersApi.query(query),
  searchFields: ['email', 'username'],
  expand: ['role', 'profile'],
  filters,
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

/** Con `getRowId` las claves de la selección son los ids reales, no el índice. */
const { rowSelection, selectedIds, removing, removeOne, removeSelected } = useResourceRemoval<UserWithRelations>({
  remove: user => usersApi.remove(user.id),
  bulkRemove: ids => usersApi.bulkRemove(ids),
  refresh,
  successOne: user => ['Usuario eliminado', `${user.email} pasó a la papelera.`],
  successMany: count => ['Usuarios eliminados', `${count} cuenta(s) pasaron a la papelera.`]
})
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <BasePageHeader
      title="Usuarios"
      description="Cuentas con acceso al sistema."
    >
      <template #actions>
        <UButton
          v-if="canCreate"
          v-bind="addUser"
        />
      </template>
    </BasePageHeader>

    <BaseErrorAlert
      :error="error"
      title="No se pudieron cargar los usuarios"
      @retry="refresh"
    />

    <BaseListToolbar
      v-model:search="searchInput"
      placeholder="Buscar por correo o nombre de usuario…"
      :loading="pending"
    >
      <template #actions>
        <UButton
          v-if="canRestore"
          label="Papelera"
          icon="i-lucide-archive"
          color="neutral"
          variant="outline"
          to="/usuarios/papelera"
        />

        <USelect
          v-model="statusFilter"
          :items="[
            { label: 'Todos los estados', value: 'all' },
            { label: 'Solo activos', value: 'active' },
            { label: 'Solo inactivos', value: 'inactive' }
          ]"
          value-key="value"
          icon="i-lucide-filter"
          class="w-full sm:w-44"
        />

        <BaseConfirmPopover
          v-if="selectedIds.length && canBulkDelete"
          title="¿Eliminar las cuentas seleccionadas?"
          :description="`Se enviarán ${selectedIds.length} usuario(s) a la papelera.`"
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
            v-if="canUpdate"
            text="Editar"
          >
            <UButton
              :to="`/usuarios/${row.original.id}`"
              icon="i-lucide-square-pen"
              v-bind="rowAction"
              aria-label="Editar usuario"
            />
          </UTooltip>

          <BaseConfirmPopover
            v-if="canDelete"
            title="¿Eliminar esta cuenta?"
            :description="`${row.original.email} dejará de poder iniciar sesión.`"
            :loading="removing"
            @confirm="removeOne(row.original)"
          >
            <UButton
              icon="i-lucide-trash-2"
              v-bind="rowAction"
              color="error"
              aria-label="Eliminar usuario"
            />
          </BaseConfirmPopover>
        </div>
      </template>

      <template #empty>
        <UEmpty
          :icon="isFiltered ? 'i-lucide-search-x' : 'i-lucide-users'"
          :title="isFiltered ? 'Sin resultados' : 'Todavía no hay usuarios'"
          :description="isFiltered
            ? 'Prueba con otro correo o nombre de usuario.'
            : 'Crea la primera cuenta para empezar a dar acceso al sistema.'"
          :actions="isFiltered || !canCreate ? [] : [addUser]"
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
