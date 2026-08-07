<script setup lang="ts">
import type { ButtonProps, TableColumn } from '@nuxt/ui'
import type { PermissionModule } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Módulos del sistema' })

/**
 * Catálogo de módulos: sobre qué se pueden conceder permisos en cada rol.
 *
 * Se pueden dar de alta, pero el módulo solo surte efecto cuando el backend
 * protege sus rutas con ese código (`require_permission('<code>', ...)`).
 */
const modulesApi = useModulesApi()

/** Acción principal de la pantalla: la misma en la cabecera y en el estado vacío. */
const addModule: ButtonProps = {
  label: 'Agregar módulo',
  icon: 'i-lucide-package-plus',
  to: '/roles/modulos/nuevo'
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

/**
 * Qué módulos comprueba de verdad el backend: `GET /permissions/available-actions`
 * lo saca del registro que llenan los propios `require_permission`.
 *
 * Sirve para marcar en la tabla los módulos dados de alta que no protegen
 * ninguna ruta todavía.
 */
const { data: enforcedCodes } = useAsyncData(
  'modules:enforced-codes',
  async () => Object.keys(await modulesApi.availableActions().catch(() => ({}))),
  { server: false, default: (): string[] => [] }
)

/** Un módulo dado de alta que todavía no protege ninguna ruta no hace nada. */
const isUnused = (module: PermissionModule) =>
  enforcedCodes.value.length > 0 && !enforcedCodes.value.includes(module.code)
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <BasePageHeader
      title="Módulos del sistema"
      description="Zonas del sistema sobre las que se conceden permisos."
    >
      <template #actions>
        <UButton v-bind="addModule" />
      </template>
    </BasePageHeader>

    <BaseErrorAlert
      :error="error"
      title="No se pudieron cargar los módulos"
      @retry="refresh"
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

          <!-- Existe en la tabla, pero ninguna ruta lo comprueba todavía. -->
          <UTooltip
            v-if="isUnused(row.original)"
            text="Ninguna ruta del backend usa este código todavía, así que sus permisos no restringen nada"
          >
            <UBadge
              label="Sin uso en el código"
              color="neutral"
              variant="subtle"
              icon="i-lucide-unplug"
            />
          </UTooltip>
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
            : 'Crea el primer módulo para poder conceder permisos sobre él.'"
          :actions="isFiltered ? [] : [addModule]"
          variant="naked"
        />
      </template>
    </UTable>

    <BaseListPagination
      v-model:page="page"
      :total="total"
      :items-per-page="limit"
      label="módulo(s)"
    />
  </UContainer>
</template>
