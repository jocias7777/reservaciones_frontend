<script setup lang="ts">
import type { UserPermission } from '~/types'

definePageMeta({
  layout: 'app'
})

const route = useRoute()
const userId = computed(() => String(route.params.id))

const usersApi = useUsersApi()
const rolesApi = useRolesApi()
const modulesApi = useModulesApi()
const actionsApi = useActionsApi()
const rolePermissionsApi = useRolePermissionsApi()
const userPermissionsApi = useUserPermissionsApi()
const notify = useNotify()

/**
 * Aquí se edita el permiso EFECTIVO del usuario. Lo que se guarda son las
 * diferencias respecto a su rol: cada interruptor que se aparta de lo heredado
 * se convierte en una fila de `sa_user_permissions` (conceder o revocar), y
 * volver a coincidir con el rol borra esa excepción.
 */
const { data, status, error, refresh } = useAsyncData(
  () => `user-permissions:${userId.value}`,
  async () => {
    const [user, modules, actions, overrides] = await Promise.all([
      usersApi.get(userId.value),
      modulesApi.list(),
      actionsApi.list(),
      userPermissionsApi.listByUser(userId.value)
    ])

    // Lo que otorga su rol. Si la cuenta que está editando no puede leer
    // `role-permissions`, se sigue trabajando sin la referencia heredada.
    let inheritedKeys: string[] = []
    let inheritedAvailable = true

    if (user.role_id) {
      try {
        const rows = await rolePermissionsApi.listByRole(user.role_id)
        inheritedKeys = rows.map(row => permissionKey(row.permission_id, row.action_id))
      } catch {
        inheritedAvailable = false
      }
    }

    const role = user.role_id
      ? await rolesApi.get(user.role_id).catch(() => null)
      : null

    return { user, role, modules, actions, overrides, inheritedKeys, inheritedAvailable }
  },
  { server: false, watch: [userId] }
)

useSeoMeta({
  title: () => (data.value ? `Permisos · ${data.value.user.email}` : 'Permisos del usuario')
})

const matrix = usePermissionMatrix({
  modules: () => data.value?.modules ?? [],
  actions: () => data.value?.actions ?? []
})

const inherited = computed(() => new Set(data.value?.inheritedKeys ?? []))

/** `moduleId::actionId` -> excepción guardada para esa celda. */
const overrideByKey = computed(() => {
  const map = new Map<string, UserPermission>()
  for (const row of data.value?.overrides ?? []) {
    map.set(permissionKey(row.permission_id, row.action_id), row)
  }
  return map
})

// El punto de partida es el permiso efectivo: la excepción manda sobre el rol.
watch(data, (value) => {
  if (!value) return

  const effective = new Set(value.inheritedKeys)
  for (const row of value.overrides) {
    const key = permissionKey(row.permission_id, row.action_id)
    if (row.is_grant) {
      effective.add(key)
    } else {
      effective.delete(key)
    }
  }

  matrix.setBaseline(effective)
}, { immediate: true })

/** Lo que concede el rol, en el mismo formato, para marcar las excepciones. */
const inheritedByModule = computed(() => matrix.toModuleValues(inherited.value))

/** Celdas que hoy se apartan de lo que da el rol. */
const overrideCount = computed(() => {
  const keys = new Set([...matrix.draft.value, ...inherited.value])
  return [...keys].filter(key => matrix.draft.value.has(key) !== inherited.value.has(key)).length
})

const userName = computed(() =>
  fullName(data.value?.user.profile) ?? data.value?.user.username ?? data.value?.user.email ?? 'Usuario'
)

const saving = ref(false)

/** Traduce el estado de la matriz a altas, bajas y cambios de excepciones. */
async function save() {
  if (!data.value || !matrix.isDirty.value) return

  saving.value = true

  const operations: Promise<unknown>[] = []

  for (const key of [...matrix.added.value, ...matrix.removed.value]) {
    const desired = matrix.isEnabled(key)
    const inheritedValue = inherited.value.has(key)
    const existing = overrideByKey.value.get(key)
    const { moduleId, actionId } = parsePermissionKey(key)

    if (desired === inheritedValue) {
      // Vuelve a coincidir con el rol: la excepción ya no hace falta.
      if (existing) {
        operations.push(userPermissionsApi.remove(existing.id))
      }
      continue
    }

    if (existing) {
      if (existing.is_grant !== desired) {
        operations.push(userPermissionsApi.update(existing.id, { is_grant: desired }))
      }
      continue
    }

    operations.push(userPermissionsApi.create({
      user_id: userId.value,
      permission_id: moduleId,
      action_id: actionId,
      is_grant: desired
    }))
  }

  try {
    const results = await Promise.allSettled(operations)
    const failed = results.filter(result => result.status === 'rejected')

    if (failed.length) {
      notify.warning('Se guardó parcialmente', `${failed.length} de ${operations.length} cambios fallaron: ${apiErrorMessage((failed[0] as PromiseRejectedResult).reason)}`)
    } else {
      notify.success('Permisos actualizados', `Se guardaron los permisos de ${userName.value}.`)
    }

    await refresh()
  } catch (err) {
    notify.error(err, 'No se pudieron guardar los permisos')
  } finally {
    saving.value = false
  }
}

/**
 * Iguala la matriz a lo que dicta el rol. Queda como cambio pendiente: al
 * guardar se borran todas las excepciones del usuario.
 */
function resetToRole() {
  matrix.draft.value = new Set(inherited.value)
}

onBeforeRouteLeave(() => {
  if (!matrix.isDirty.value) return true
  return window.confirm('Hay cambios de permisos sin guardar. ¿Salir de todos modos?')
})
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <UPageHeader
      :title="userName"
      description="Lo que se aparte de su rol se guarda como excepción."
      :ui="{ title: 'text-2xl' }"
      :links="[{
        label: 'Datos del usuario',
        icon: 'i-lucide-pencil',
        to: `/usuarios/${userId}`,
        color: 'neutral',
        variant: 'outline'
      }, {
        label: 'Volver a usuarios',
        icon: 'i-lucide-arrow-left',
        to: '/usuarios',
        color: 'neutral',
        variant: 'ghost'
      }]"
    />

    <BaseErrorAlert
      :error="error"
      title="No se pudieron cargar los permisos"
      @retry="refresh"
    />

    <div
      v-if="status === 'pending'"
      class="space-y-4"
    >
      <USkeleton class="h-32 w-full" />
      <USkeleton class="h-64 w-full" />
    </div>

    <template v-else-if="data">
      <UAlert
        v-if="!data.user.role_id"
        color="warning"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        title="Este usuario no tiene rol"
        description="Sin rol no hereda nada: todo lo que marques aquí se guardará como una excepción individual. Asignarle un rol es lo más mantenible."
        :actions="[{ label: 'Asignar rol', color: 'warning', variant: 'outline', to: `/usuarios/${userId}` }]"
      />

      <UAlert
        v-else-if="!data.inheritedAvailable"
        color="warning"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        title="No se pudo leer lo que otorga el rol"
        description="Falta el permiso de lectura sobre los permisos de rol, así que no se puede distinguir lo heredado de las excepciones. Los cambios se guardarán como excepciones."
      />

      <UAlert
        v-if="data.role?.name === 'superadmin'"
        color="info"
        variant="subtle"
        icon="i-lucide-info"
        title="Este usuario es superadmin"
        description="El backend omite la comprobación de permisos para el rol «superadmin»: lo que se marque aquí no le limita."
      />

      <PermissionSummary
        headline="Usuario"
        :title="userName"
        :description="data.user.email"
        icon="i-lucide-circle-user"
        :active-count="matrix.activeCount.value"
        :total="matrix.total.value"
        :modules-count="matrix.modules.value.length"
        :actions-count="matrix.actions.value.length"
        :all-selected="matrix.allSelected.value"
        :disabled="saving"
        :hint="data.role
          ? `Hereda de «${data.role.name}»: ${inherited.size} permiso(s). Excepciones activas: ${overrideCount}.`
          : `Sin rol asignado. Excepciones activas: ${overrideCount}.`"
        @toggle-all="matrix.setAll"
      />

      <div
        v-if="data.role"
        class="flex justify-end"
      >
        <UButton
          label="Volver a lo que da el rol"
          icon="i-lucide-rotate-ccw"
          color="neutral"
          variant="ghost"
          :disabled="saving"
          @click="resetToRole"
        />
      </div>

      <UEmpty
        v-if="!matrix.modules.value.length"
        icon="i-lucide-key-round"
        title="No hay módulos definidos"
        description="Los permisos se construyen sobre los módulos del sistema."
        :actions="[{ label: 'Ir a módulos', icon: 'i-lucide-arrow-right', to: '/roles/modulos' }]"
      />

      <PermissionModuleList
        v-else
        :modules="matrix.modules.value"
        :actions="matrix.actions.value"
        :values="matrix.valuesByModule.value"
        :inherited="inheritedByModule"
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
  </UContainer>
</template>
