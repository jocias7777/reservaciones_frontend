<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { PermissionModule } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Módulos del sistema' })

/**
 * Catálogo de módulos, en modo consulta.
 *
 * No se crean ni se borran desde aquí a propósito: el backend comprueba los
 * permisos con códigos fijos escritos en el código
 * (`require_permission('users', 'read')`), así que un módulo inventado desde la
 * interfaz no tendría ninguna ruta que lo verificara. Esta pantalla sirve para
 * saber sobre qué se pueden conceder permisos en cada rol.
 */
const modulesApi = useModulesApi()

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
} = useResourceList<PermissionModule>({
  key: 'modules:list',
  fetcher: query => modulesApi.query(query),
  searchFields: ['code', 'name', 'description'],
  sortBy: 'name',
  sortOrder: 'ASC'
})

const columns: TableColumn<PermissionModule>[] = [
  { accessorKey: 'name', header: 'Módulo' },
  { accessorKey: 'description', header: 'Descripción' },
  { accessorKey: 'created_at', header: 'Creado' }
]
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <UPageHeader
      title="Módulos del sistema"
      description="Zonas del sistema sobre las que se conceden permisos."
    />

    <UAlert
      color="neutral"
      variant="subtle"
      icon="i-lucide-info"
      title="Solo consulta"
      description="Los módulos los define el backend. Aquí se listan para saber sobre qué puedes dar permisos en cada rol."
    />

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="No se pudieron cargar los módulos"
      :description="apiErrorMessage(error)"
      :actions="[{ label: 'Reintentar', color: 'error', variant: 'outline', onClick: () => refresh() }]"
    />

    <BaseListToolbar
      v-model:search="searchInput"
      placeholder="Buscar por código o nombre…"
      :loading="pending"
    />

    <UTable
      :data="items"
      :columns="columns"
      :loading="pending"
      class="border border-default rounded-lg"
    >
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <BaseIconTile
            :icon="moduleIcon(row.original)"
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

      <template #description-cell="{ row }">
        <span class="text-sm text-muted line-clamp-2">
          {{ row.original.description ?? '—' }}
        </span>
      </template>

      <template #created_at-cell="{ row }">
        <span class="text-sm text-muted">{{ formatDate(row.original.created_at) }}</span>
      </template>

      <template #empty>
        <UEmpty
          :icon="isFiltered ? 'i-lucide-search-x' : 'i-lucide-key-round'"
          :title="isFiltered ? 'Sin resultados' : 'No hay módulos'"
          :description="isFiltered
            ? 'Prueba con otro código o nombre.'
            : 'El backend todavía no tiene módulos registrados.'"
          variant="naked"
        />
      </template>
    </UTable>

    <div
      v-if="total > limit"
      class="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
    >
      <p class="text-sm text-muted">
        {{ total }} módulo(s) en total
      </p>

      <UPagination
        v-model:page="page"
        :items-per-page="limit"
        :total="total"
      />
    </div>
  </UContainer>
</template>
