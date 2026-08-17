<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

const rolePermissionsApi = useRolePermissionsApi()
const notify = useNotify()
const access = useAccessControl()

/**
 * Catálogo común a todos los roles: se pide una sola vez y no se vuelve a pedir
 * al cambiar de rol.
 *
 * Va por `/role-permissions/catalog`, que exige el mismo `assign` que la propia
 * matriz. Antes eran cuatro llamadas —roles, módulos, acciones y categorías—,
 * cada una pidiendo el `list` de su módulo: para administrar esta pantalla
 * había que conceder además el listado de otros cuatro módulos.
 */
const {
  data: catalog,
  status: catalogStatus,
  error: catalogError,
  refresh: refreshCatalog
} = useAsyncData(
  'role-permissions:catalog',
  () => rolePermissionsApi.catalog(),
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

// Cada vez que llegan datos frescos del servidor, la matriz parte de ahí.
watch(granted, (rows) => {
  matrix.setBaseline((rows ?? []).map(row => row.action_id))
}, { immediate: true })

const saving = ref(false)
const loadingGranted = usePendingAfterHydration(grantedStatus)
const loadingRole = computed(() => Boolean(selectedRoleId.value) && loadingGranted.value)

/** Sin rol elegido la matriz se ve pero no se puede tocar, además de mientras se guarda. */
const matrixDisabled = computed(() => saving.value || !selectedRole.value)

/**
 * Cuántas acciones distintas hay, para la cifra del resumen.
 *
 * Se cuentan por código y no por fila: cada acción pertenece a un módulo, así
 * que «Crear» existe una vez por módulo y contarlas todas daría el número de
 * celdas —que es lo que ya dice `total`— en vez de cuántas cosas distintas se
 * pueden hacer.
 */
const distinctActionCount = computed(() =>
  new Set(matrix.actions.value.map(action => action.code)).size
)

/**
 * El atajo a los módulos, solo para quien pueda abrirlos: con «Asignar
 * permisos» a secas se administra esta matriz sin acceso a ese catálogo, y
 * ofrecer el botón sería mandarle a una pantalla que rebota.
 */
const irAModulos = computed(() =>
  access.canVisit('/roles/modulos')
    ? [{ label: 'Ir a módulos', icon: 'i-lucide-arrow-right', to: '/roles/modulos' }]
    : []
)

/**
 * Guarda la matriz de una vez: se manda el conjunto de combinaciones que debe
 * quedar y el backend calcula la diferencia contra lo que tiene.
 *
 * Antes eran dos llamadas —revocar lo quitado y conceder lo añadido—, que
 * pedían `bulk_delete` y `bulk_create` además de `assign`, y ninguna era
 * atómica: un fallo a media tanda dejaba el rol con parte de los cambios
 * aplicados. Ahora entra todo o no entra nada, y con `assign` basta.
 */
async function save() {
  if (!selectedRole.value || !matrix.isDirty.value) return

  saving.value = true

  const roleId = selectedRole.value.id

  try {
    await rolePermissionsApi.syncByRole(
      roleId,
      matrix.enabledKeys.value.map(actionId => ({ action_id: actionId }))
    )

    notify.success('Permisos actualizados', `«${selectedRole.value.name}» quedó con ${matrix.activeCount.value} permiso(s) activo(s).`)

    await refreshGranted()

    // Quien acaba de guardar puede estar viendo, en esta misma sesión, botones
    // que dependen de este mismo rol (la papelera, Agregar/Editar/Eliminar…).
    // Sin esto seguiría viendo el estado con el que entró hasta cerrar sesión.
    await access.refresh()
  } catch (err) {
    // `describeError` y no el mensaje pelado: un 403 de la política de
    // delegación nombra por id las acciones que no se pueden repartir, y así
    // sale «Usuarios · Crear» en vez de un UUID.
    notify.error(err, 'No se pudieron guardar los permisos', matrix.describeError(err))
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
        <!--
          Solo si esa ficha se puede abrir: con «Asignar permisos» a secas se
          administra esta matriz sin tener acceso al módulo de roles, y el
          botón llevaba a una pantalla que rebota.
        -->
        <UButton
          v-if="selectedRole && access.canVisit(`/roles/${selectedRole.id}`)"
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

    <!--
      Solo cuando la URL trae un rol que no está en la lista (borrado, o un
      enlace viejo): es un caso distinto de "todavía no he elegido nada", así
      que no comparte el bloque de abajo.
    -->
    <UEmpty
      v-else-if="selectedRoleId && !selectedRole && catalogStatus === 'success'"
      icon="i-lucide-search-x"
      title="Ese rol ya no existe"
      description="Puede que lo hayan eliminado. Elige otro en el selector de arriba."
    />

    <!--
      La matriz se ve siempre, elegido o no un rol: sin nada elegido se muestran
      los módulos reales pero en blanco y sin poder abrirse, para que la
      pantalla no cambie de forma en cuanto se elige uno.
    -->
    <template v-else-if="catalog">
      <PermissionSummary
        headline="Rol"
        :title="selectedRole?.name ?? 'Ningún rol elegido'"
        :description="selectedRole ? selectedRole.description : 'Elige uno arriba para ver y editar sus permisos.'"
        :active-count="matrix.activeCount.value"
        :total="matrix.total.value"
        :modules-count="matrix.modules.value.length"
        :actions-count="distinctActionCount"
        :all-selected="matrix.allSelected.value"
        :disabled="matrixDisabled"
        @toggle-all="matrix.setAll"
      />

      <UEmpty
        v-if="!matrix.modules.value.length"
        icon="i-lucide-key-round"
        title="No hay módulos definidos"
        description="Los permisos se construyen sobre los módulos del sistema. Crea al menos uno para poder asignarlos."
        :actions="irAModulos"
      />

      <PermissionModuleList
        v-else
        :modules="matrix.modules.value"
        :actions="matrix.actions.value"
        :categories="catalog?.categories ?? []"
        :values="matrix.valuesByModule.value"
        :disabled="matrixDisabled"
        @toggle="(moduleId, actionId, value) => matrix.set(actionId, value)"
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
  </UContainer>
</template>
