<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

const route = useRoute()
const roleId = computed(() => String(route.params.id))

const rolesApi = useRolesApi()
const modulesApi = useModulesApi()
const actionsApi = useActionsApi()
const rolePermissionsApi = useRolePermissionsApi()
const toast = useToast()

/**
 * Los cuatro datos que necesita la matriz se piden juntos: el rol, el catálogo de
 * módulos, el de acciones y las combinaciones ya concedidas.
 */
const { data, status, error, refresh } = useAsyncData(
  () => `role-permissions:${roleId.value}`,
  async () => {
    const [role, modules, actions, rows] = await Promise.all([
      rolesApi.get(roleId.value),
      modulesApi.list(),
      actionsApi.list(),
      rolePermissionsApi.listByRole(roleId.value)
    ])

    return { role, modules, actions, rows }
  },
  { server: false, watch: [roleId] }
)

useSeoMeta({
  title: () => (data.value ? `Permisos · ${data.value.role.name}` : 'Permisos del rol')
})

const matrix = usePermissionMatrix({
  modules: () => data.value?.modules ?? [],
  actions: () => data.value?.actions ?? []
})

/** `moduleId::actionId` -> id de la fila en `sa_role_permissions`, para poder borrarla. */
const rowIdByKey = computed(() => {
  const map = new Map<string, string>()
  for (const row of data.value?.rows ?? []) {
    map.set(permissionKey(row.permission_id, row.action_id), row.id)
  }
  return map
})

// Cada vez que llegan datos frescos del servidor, la matriz parte de ahí.
watch(data, (value) => {
  if (!value) return
  matrix.setBaseline(value.rows.map(row => permissionKey(row.permission_id, row.action_id)))
}, { immediate: true })

/** Estado por módulo y acción, en el formato que espera la tarjeta. */
const valuesByModule = computed(() => {
  const result: Record<string, Record<string, boolean>> = {}

  for (const module of matrix.modules.value) {
    const actions: Record<string, boolean> = {}
    for (const action of matrix.actions.value) {
      actions[action.id] = matrix.isEnabled(permissionKey(module.id, action.id))
    }
    result[module.id] = actions
  }

  return result
})

const isSuperadmin = computed(() => data.value?.role.name === 'superadmin')

const saving = ref(false)

/**
 * Guarda la diferencia entre lo que hay en pantalla y lo que había en el
 * servidor:
 *  - lo añadido se concede con un POST por combinación (el backend reactiva la
 *    fila si ya existía borrada);
 *  - lo quitado se revoca en una sola llamada al borrado masivo.
 *
 * PENDIENTE DE BACKEND: con un endpoint tipo `PUT /roles/:id/permissions` que
 * recibiera la matriz completa, esto sería una única petición atómica.
 */
async function save() {
  if (!data.value || !matrix.isDirty.value) return

  saving.value = true

  const added = matrix.added.value
  const removed = matrix.removed.value

  try {
    const removedIds = removed
      .map(key => rowIdByKey.value.get(key))
      .filter((id): id is string => Boolean(id))

    if (removedIds.length) {
      await rolePermissionsApi.bulkRemove(removedIds)
    }

    const results = await Promise.allSettled(
      added.map((key) => {
        const { moduleId, actionId } = parsePermissionKey(key)
        return rolePermissionsApi.create({
          role_id: roleId.value,
          permission_id: moduleId,
          action_id: actionId
        })
      })
    )

    const failed = results.filter(result => result.status === 'rejected')

    if (failed.length) {
      toast.add({
        title: 'Se guardó parcialmente',
        description: `${failed.length} de ${added.length} permisos no se pudieron conceder: ${apiErrorMessage((failed[0] as PromiseRejectedResult).reason)}`,
        color: 'warning',
        icon: 'i-lucide-triangle-alert'
      })
    } else {
      toast.add({
        title: 'Permisos actualizados',
        description: `«${data.value.role.name}» quedó con ${matrix.activeCount.value} permiso(s) activo(s).`,
        color: 'success',
        icon: 'i-lucide-circle-check'
      })
    }

    await refresh()
  } catch (err) {
    toast.add({
      title: 'No se pudieron guardar los permisos',
      description: apiErrorMessage(err),
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  } finally {
    saving.value = false
  }
}

// Aviso del navegador si se intenta salir con cambios sin guardar.
onBeforeRouteLeave(() => {
  if (!matrix.isDirty.value) return true
  return window.confirm('Hay cambios de permisos sin guardar. ¿Salir de todos modos?')
})
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <UPageHeader
      :title="data?.role.name ?? 'Permisos del rol'"
      description="Define con los interruptores qué puede hacer este rol en cada módulo."
      :ui="{ title: 'text-2xl' }"
      :links="[{
        label: 'Datos del rol',
        icon: 'i-lucide-pencil',
        to: `/roles/${roleId}`,
        color: 'neutral',
        variant: 'outline'
      }, {
        label: 'Volver a roles',
        icon: 'i-lucide-arrow-left',
        to: '/roles',
        color: 'neutral',
        variant: 'ghost'
      }]"
    />

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="No se pudieron cargar los permisos"
      :description="apiErrorMessage(error)"
      :actions="[{ label: 'Reintentar', color: 'error', variant: 'outline', onClick: () => refresh() }]"
    />

    <div
      v-else-if="status === 'pending'"
      class="space-y-4"
    >
      <USkeleton class="h-32 w-full" />
      <USkeleton class="h-64 w-full" />
      <USkeleton class="h-64 w-full" />
    </div>

    <template v-else-if="data">
      <UAlert
        v-if="isSuperadmin"
        color="info"
        variant="subtle"
        icon="i-lucide-info"
        title="Este rol no depende de esta pantalla"
        description="El rol «superadmin» omite la comprobación de permisos en el backend: puede hacer todo aunque aquí no marques nada."
      />

      <PermissionSummary
        headline="Rol"
        :title="data.role.name"
        :description="data.role.description"
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

      <div
        v-else
        class="space-y-4"
      >
        <PermissionModuleCard
          v-for="module in matrix.modules.value"
          :key="module.id"
          :module="module"
          :actions="matrix.actions.value"
          :values="valuesByModule[module.id] ?? {}"
          :disabled="saving"
          @toggle="(actionId, value) => matrix.set(permissionKey(module.id, actionId), value)"
          @toggle-module="value => matrix.setModule(module.id, value)"
        />
      </div>

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
