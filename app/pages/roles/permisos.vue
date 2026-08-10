<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

const rolesApi = useRolesApi()
const rolePermissionsApi = useRolePermissionsApi()
const { fetchPermissionCatalog } = usePermissionCatalog()
const notify = useNotify()

/**
 * Catálogo común a todos los roles: se pide una sola vez y no se vuelve a pedir
 * al cambiar de rol.
 */
const {
  data: catalog,
  status: catalogStatus,
  error: catalogError,
  refresh: refreshCatalog
} = useAsyncData(
  'role-permissions:catalog',
  async () => {
    const [rolesPage, catalogo] = await Promise.all([
      // Con `expand` cada tarjeta puede decir a cuánta gente afecta el rol.
      rolesApi.query({ limit: 100, sortBy: 'name', sortOrder: 'ASC', expand: ['users'] }),
      fetchPermissionCatalog()
    ])

    return { roles: rolesPage.items, ...catalogo }
  },
  { server: false }
)

const matrix = usePermissionMatrix({
  modules: () => catalog.value?.modules ?? [],
  actions: () => catalog.value?.actions ?? []
})

/** Rol elegido en la URL (`?rol=<id>`), con aviso si hay cambios sin guardar. */
const { selectedId: selectedRoleId, picked: pickedRoleId } = usePermissionSelection({
  queryKey: 'rol',
  noun: 'rol',
  isDirty: matrix.isDirty
})

/** Lo concedido al rol elegido; se recarga solo cuando cambia el rol. */
const {
  data: granted,
  status: grantedStatus,
  error: grantedError,
  refresh: refreshGranted
} = useAsyncData(
  () => `role-permissions:granted:${selectedRoleId.value || 'ninguno'}`,
  async () => (selectedRoleId.value ? rolePermissionsApi.listByRole(selectedRoleId.value) : []),
  { server: false, watch: [selectedRoleId] }
)

const roles = computed(() => catalog.value?.roles ?? [])

/** Opciones del selector: nombre del rol y su descripción debajo. */
const roleItems = computed(() =>
  roles.value.map(role => ({
    value: role.id,
    label: role.name,
    description: role.description ?? 'Sin descripción',
    icon: 'i-lucide-shield'
  }))
)
const selectedRole = computed(() => roles.value.find(role => role.id === selectedRoleId.value) ?? null)

useSeoMeta({
  title: () => (selectedRole.value ? `Permisos · ${selectedRole.value.name}` : 'Permisos por rol')
})

/** `moduleId::actionId` -> id de la fila en `sa_role_permissions`, para poder borrarla. */
const rowIdByKey = computed(() => {
  const map = new Map<string, string>()
  for (const row of granted.value ?? []) {
    map.set(permissionKey(row.permission_id, row.action_id), row.id)
  }
  return map
})

// Cada vez que llegan datos frescos del servidor, la matriz parte de ahí.
watch(granted, (rows) => {
  matrix.setBaseline((rows ?? []).map(row => permissionKey(row.permission_id, row.action_id)))
}, { immediate: true })

const saving = ref(false)
const loadingGranted = usePendingAfterHydration(grantedStatus)
const loadingRole = computed(() => Boolean(selectedRoleId.value) && loadingGranted.value)

/**
 * Guarda la diferencia entre lo que hay en pantalla y lo que había en el
 * servidor: lo quitado se revoca con un borrado masivo y lo añadido se
 * concede con una sola llamada a `bulk/create`, que reemplaza lo que antes
 * era un `POST` por combinación.
 *
 * `bulk/create` no es atómico —cada fila se confirma por su cuenta—, así que
 * un duplicado suelto no cancela el lote: viene detallado en `errores` junto
 * con lo que sí se guardó.
 */
async function save() {
  if (!selectedRole.value || !matrix.isDirty.value) return

  saving.value = true

  const roleId = selectedRole.value.id
  const added = matrix.added.value
  const removed = matrix.removed.value

  try {
    const removedIds = removed
      .map(key => rowIdByKey.value.get(key))
      .filter((id): id is string => Boolean(id))

    if (removedIds.length) {
      await rolePermissionsApi.bulkRemove(removedIds)
    }

    let failedCount = 0
    let firstError = ''

    if (added.length) {
      const result = await rolePermissionsApi.bulkCreate(
        added.map((key) => {
          const { moduleId, actionId } = parsePermissionKey(key)
          return { role_id: roleId, permission_id: moduleId, action_id: actionId }
        })
      )

      failedCount = result.fallidos
      firstError = result.errores[0]?.error ?? ''
    }

    if (failedCount) {
      notify.warning('Se guardó parcialmente', `${failedCount} de ${added.length} permisos no se pudieron conceder: ${firstError}`)
    } else {
      notify.success('Permisos actualizados', `«${selectedRole.value.name}» quedó con ${matrix.activeCount.value} permiso(s) activo(s).`)
    }

    await refreshGranted()
  } catch (err) {
    notify.error(err, 'No se pudieron guardar los permisos')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <BasePageHeader
      title="Permisos por rol"
      description="Elige un rol y define con los interruptores qué puede hacer en cada módulo."
    >
      <template #actions>
        <UButton
          v-if="selectedRole"
          label="Datos del rol"
          icon="i-lucide-square-pen"
          color="neutral"
          variant="outline"
          :to="`/roles/${selectedRole.id}`"
        />
      </template>
    </BasePageHeader>

    <BasePickerSelect
      v-model="pickedRoleId"
      :items="roleItems"
      icon="i-lucide-shield"
      placeholder="Elige un rol"
      search-placeholder="Buscar rol…"
      :loading="!catalog && !catalogError"
      :disabled="saving"
    />

    <BaseErrorAlert
      :error="catalogError"
      title="No se pudo cargar el catálogo de permisos"
      @retry="refreshCatalog"
    />

    <BaseErrorAlert
      :error="grantedError"
      title="No se pudieron cargar los permisos del rol"
      @retry="refreshGranted"
    />

    <div
      v-if="loadingRole"
      class="space-y-4"
    >
      <USkeleton class="h-32 w-full" />
      <USkeleton class="h-64 w-full" />
      <USkeleton class="h-64 w-full" />
    </div>

    <template v-else-if="selectedRole">
      <PermissionSummary
        headline="Rol"
        :title="selectedRole.name"
        :description="selectedRole.description"
        :active-count="matrix.activeCount.value"
        :total="matrix.total.value"
        :modules-count="matrix.modules.value.length"
        :actions-count="matrix.actions.value.length"
        :all-selected="matrix.allSelected.value"
        :disabled="saving"
        @toggle-all="matrix.setAll"
      />

      <UEmpty
        v-if="!matrix.modules.value.length"
        icon="i-lucide-key-round"
        title="No hay módulos definidos"
        description="Los permisos se construyen sobre los módulos del sistema. Crea al menos uno para poder asignarlos."
        :actions="[{ label: 'Ir a módulos', icon: 'i-lucide-arrow-right', to: '/roles/modulos' }]"
      />

      <PermissionModuleList
        v-else
        :modules="matrix.modules.value"
        :actions="matrix.actions.value"
        :categories="catalog?.categories ?? []"
        :values="matrix.valuesByModule.value"
        :disabled="saving"
        @toggle="(moduleId, actionId, value) => matrix.set(permissionKey(moduleId, actionId), value)"
        @toggle-module="matrix.setModule"
      />

      <PermissionSaveBar
        :change-count="matrix.changeCount.value"
        :added-count="matrix.added.value.length"
        :removed-count="matrix.removed.value.length"
        :saving="saving"
        @discard="matrix.reset"
        @save="save"
      />
    </template>

    <!--
      Solo cuando la URL trae un rol que no está en la lista (borrado, o un
      enlace viejo). Sin nada elegido no se dice nada: debajo del selector no
      hay más que el hueco, como en los permisos por usuario.
    -->
    <UEmpty
      v-else-if="selectedRoleId && catalogStatus === 'success'"
      icon="i-lucide-search-x"
      title="Ese rol ya no existe"
      description="Puede que lo hayan eliminado. Elige otro en el selector de arriba."
    />
  </UContainer>
</template>
