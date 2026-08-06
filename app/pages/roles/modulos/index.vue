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
 * La tabla contrastada con el código: qué módulos comprueba de verdad el backend
 * (`GET /permissions/available-actions`, que sale del registro que llena
 * `require_permission`) frente a los que están dados de alta.
 *
 * Se piden todos los módulos, no los de la página actual, para que el aviso no
 * dependa de por dónde vaya el listado.
 */
const { data: audit } = useAsyncData(
  'modules:audit',
  async () => {
    const [enforced, registered] = await Promise.all([
      modulesApi.availableActions().catch(() => ({})),
      modulesApi.list().catch(() => [])
    ])

    return {
      enforcedCodes: Object.keys(enforced),
      registeredCodes: registered.map(module => module.code)
    }
  },
  {
    server: false,
    default: (): { enforcedCodes: string[], registeredCodes: string[] } =>
      ({ enforcedCodes: [], registeredCodes: [] })
  }
)

/**
 * Módulos que el backend exige y que nadie ha dado de alta: mientras falten, ese
 * permiso no se le puede conceder a ningún rol y solo el superadmin pasa.
 */
const missingCodes = computed(() =>
  audit.value.enforcedCodes.filter(code => !audit.value.registeredCodes.includes(code))
)

/** Un módulo dado de alta que todavía no protege ninguna ruta no hace nada. */
const isUnused = (module: PermissionModule) =>
  audit.value.enforcedCodes.length > 0 && !audit.value.enforcedCodes.includes(module.code)
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

    <!--
      El backend comprueba estos códigos en sus rutas, pero no existen como
      módulo: no hay forma de concedérselos a un rol.
    -->
    <UAlert
      v-for="code in missingCodes"
      :key="code"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      :title="`Falta dar de alta el módulo «${code}»`"
      description="El backend protege rutas con este código, pero no está en la lista: mientras no exista, ese permiso no se le puede conceder a ningún rol y solo el superadmin puede entrar."
      :actions="[{
        label: 'Darlo de alta',
        color: 'warning',
        variant: 'outline',
        to: `/roles/modulos/nuevo?code=${code}`
      }]"
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
