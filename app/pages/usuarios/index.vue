<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Filters, UserWithRelations } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Usuarios' })

const usersApi = useUsersApi()
const toast = useToast()

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
const rowSelection = ref<Record<string, boolean>>({})
const selectedIds = computed(() => Object.keys(rowSelection.value).filter(id => rowSelection.value[id]))

const removing = ref(false)

async function removeUser(user: UserWithRelations) {
  removing.value = true
  try {
    await usersApi.remove(user.id)
    toast.add({
      title: 'Usuario eliminado',
      description: `${user.email} pasó a la papelera.`,
      color: 'success',
      icon: 'i-lucide-circle-check'
    })
    await refresh()
  } catch (error) {
    toast.add({
      title: 'No se pudo eliminar',
      description: apiErrorMessage(error),
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  } finally {
    removing.value = false
  }
}

async function removeSelected() {
  const count = selectedIds.value.length
  removing.value = true

  try {
    await usersApi.bulkRemove(selectedIds.value)
    toast.add({
      title: 'Usuarios eliminados',
      description: `${count} cuenta(s) pasaron a la papelera.`,
      color: 'success',
      icon: 'i-lucide-circle-check'
    })
    rowSelection.value = {}
    await refresh()
  } catch (error) {
    toast.add({
      title: 'No se pudo eliminar',
      description: apiErrorMessage(error),
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  } finally {
    removing.value = false
  }
}
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <UPageHeader
      title="Usuarios"
      description="Cuentas con acceso al sistema."
      :links="[{
        label: 'Nuevo usuario',
        icon: 'i-lucide-user-round-plus',
        to: '/usuarios/nuevo',
        color: 'primary',
        variant: 'solid'
      }]"
    />

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="No se pudieron cargar los usuarios"
      :description="apiErrorMessage(error)"
      :actions="[{ label: 'Reintentar', color: 'error', variant: 'outline', onClick: () => refresh() }]"
    />

    <BaseListToolbar
      v-model:search="searchInput"
      placeholder="Buscar por correo o nombre de usuario…"
      :loading="pending"
    >
      <template #actions>
        <USelect
          v-model="statusFilter"
          :items="[
            { label: 'Todos los estados', value: 'all' },
            { label: 'Solo activos', value: 'active' },
            { label: 'Solo inactivos', value: 'inactive' }
          ]"
          value-key="value"
          icon="i-lucide-filter"
          class="w-44"
        />

        <BaseConfirmPopover
          v-if="selectedIds.length"
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
          <UTooltip text="Editar">
            <UButton
              :to="`/usuarios/${row.original.id}`"
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              aria-label="Editar usuario"
            />
          </UTooltip>

          <UTooltip text="Permisos del usuario">
            <UButton
              :to="`/usuarios/${row.original.id}/permisos`"
              icon="i-lucide-key-round"
              color="neutral"
              variant="ghost"
              aria-label="Permisos del usuario"
            />
          </UTooltip>

          <BaseConfirmPopover
            title="¿Eliminar esta cuenta?"
            :description="`${row.original.email} dejará de poder iniciar sesión.`"
            :loading="removing"
            @confirm="removeUser(row.original)"
          >
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
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
          :actions="isFiltered ? [] : [{ label: 'Nuevo usuario', icon: 'i-lucide-user-round-plus', to: '/usuarios/nuevo' }]"
          variant="naked"
        />
      </template>
    </UTable>

    <div
      v-if="total > limit"
      class="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
    >
      <p class="text-sm text-muted">
        {{ total }} usuario(s) en total
      </p>

      <UPagination
        v-model:page="page"
        :items-per-page="limit"
        :total="total"
      />
    </div>
  </UContainer>
</template>
