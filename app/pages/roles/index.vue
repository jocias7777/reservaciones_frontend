<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { RoleWithRelations } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Roles' })

const rolesApi = useRolesApi()
const toast = useToast()

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
  key: 'roles:list',
  fetcher: query => rolesApi.query(query),
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

const rowSelection = ref<Record<string, boolean>>({})
const selectedIds = computed(() => Object.keys(rowSelection.value).filter(id => rowSelection.value[id]))

const removing = ref(false)

async function removeRole(role: RoleWithRelations) {
  removing.value = true
  try {
    await rolesApi.remove(role.id)
    toast.add({
      title: 'Rol eliminado',
      description: `«${role.name}» pasó a la papelera.`,
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
    await rolesApi.bulkRemove(selectedIds.value)
    toast.add({
      title: 'Roles eliminados',
      description: `${count} rol(es) pasaron a la papelera.`,
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
      title="Roles"
      description="Cada rol define qué puede hacer un usuario."
      :links="[{
        label: 'Módulos del sistema',
        icon: 'i-lucide-key-round',
        to: '/roles/modulos',
        color: 'neutral',
        variant: 'outline'
      }, {
        label: 'Nuevo rol',
        icon: 'i-lucide-plus',
        to: '/roles/nuevo',
        color: 'primary',
        variant: 'solid'
      }]"
    />

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="No se pudieron cargar los roles"
      :description="apiErrorMessage(error)"
      :actions="[{ label: 'Reintentar', color: 'error', variant: 'outline', onClick: () => refresh() }]"
    />

    <BaseListToolbar
      v-model:search="searchInput"
      placeholder="Buscar por nombre o descripción…"
      :loading="pending"
    >
      <template #actions>
        <BaseConfirmPopover
          v-if="selectedIds.length"
          title="¿Eliminar los roles seleccionados?"
          :description="`Se enviarán ${selectedIds.length} rol(es) a la papelera. Los usuarios que los tuvieran asignados se quedan sin rol.`"
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
          <UButton
            :to="`/roles/${row.original.id}/permisos`"
            label="Permisos"
            icon="i-lucide-key-round"
            color="neutral"
            variant="subtle"
          />

          <UTooltip text="Editar datos del rol">
            <UButton
              :to="`/roles/${row.original.id}`"
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              aria-label="Editar rol"
            />
          </UTooltip>

          <BaseConfirmPopover
            title="¿Eliminar este rol?"
            :description="`«${row.original.name}» dejará de estar disponible y sus usuarios se quedarán sin rol.`"
            :loading="removing"
            @confirm="removeRole(row.original)"
          >
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              aria-label="Eliminar rol"
            />
          </BaseConfirmPopover>
        </div>
      </template>

      <template #empty>
        <UEmpty
          :icon="isFiltered ? 'i-lucide-search-x' : 'i-lucide-shield'"
          :title="isFiltered ? 'Sin resultados' : 'Todavía no hay roles'"
          :description="isFiltered
            ? 'Prueba con otro nombre o descripción.'
            : 'Crea un rol y asígnale permisos por módulo.'"
          :actions="isFiltered ? [] : [{ label: 'Nuevo rol', icon: 'i-lucide-plus', to: '/roles/nuevo' }]"
          variant="naked"
        />
      </template>
    </UTable>

    <div
      v-if="total > limit"
      class="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
    >
      <p class="text-sm text-muted">
        {{ total }} rol(es) en total
      </p>

      <UPagination
        v-model:page="page"
        :items-per-page="limit"
        :total="total"
      />
    </div>
  </UContainer>
</template>
