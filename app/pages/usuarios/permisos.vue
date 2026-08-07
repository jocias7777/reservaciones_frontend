<script setup lang="ts">
import type { UserPermission } from '~/types'

definePageMeta({
  layout: 'app'
})

const usersApi = useUsersApi()
const rolesApi = useRolesApi()
const rolePermissionsApi = useRolePermissionsApi()
const userPermissionsApi = useUserPermissionsApi()
const { fetchPermissionCatalog } = usePermissionCatalog()
const notify = useNotify()

/**
 * Usuario elegido en la URL (`?usuario=<id>`), con aviso si hay cambios sin
 * guardar. `editor` se declara más abajo porque necesita los datos cargados; el
 * getter no se evalúa hasta que hay algo que preguntar.
 */
const { selectedId: selectedUserId, picked: pickedUserId } = usePermissionSelection({
  queryKey: 'usuario',
  noun: 'usuario',
  isDirty: () => editor.isDirty.value
})

/** Usuarios del selector: se piden una vez, no en cada cambio. */
const {
  data: users,
  error: usersError,
  refresh: refreshUsers
} = useAsyncData(
  'user-permissions:users',
  async () => {
    const page = await usersApi.query({
      limit: 100,
      sortBy: 'email',
      sortOrder: 'ASC',
      expand: ['role', 'profile']
    })
    return page.items
  },
  { server: false }
)

/**
 * Aquí se editan las EXCEPCIONES de un usuario sobre lo que concede su rol, no
 * su permiso efectivo. Cada celda tiene tres estados y se guarda tal cual está
 * en `sa_user_permissions`: sin fila (hereda), `is_grant = true` (concede
 * aunque el rol no lo dé) o `is_grant = false` (bloquea aunque el rol sí lo dé).
 */
const { data, status, error, refresh } = useAsyncData(
  () => `user-permissions:${selectedUserId.value || 'ninguno'}`,
  async () => {
    if (!selectedUserId.value) return null

    const userId = selectedUserId.value

    const [user, catalogo] = await Promise.all([
      usersApi.get(userId),
      fetchPermissionCatalog()
    ])

    // Sin poder leer las excepciones no se puede editar nada sin riesgo de
    // pisar lo que ya hubiera guardado, así que se distingue el 403 para
    // explicarlo en pantalla en vez de fallar la carga entera.
    let overrides: UserPermission[] = []
    let overridesForbidden = false

    try {
      overrides = await userPermissionsApi.listByUser(userId)
    } catch (err) {
      if (apiErrorStatus(err) !== 403) throw err
      overridesForbidden = true
    }

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

    return {
      user, role, ...catalogo,
      overrides, overridesForbidden, inheritedKeys, inheritedAvailable
    }
  },
  { server: false, watch: [selectedUserId] }
)

useSeoMeta({
  title: () => (data.value ? `Permisos · ${data.value.user.email}` : 'Permisos por usuario')
})

const inherited = computed(() => new Set(data.value?.inheritedKeys ?? []))

const editor = useUserPermissionOverrides({
  modules: () => data.value?.modules ?? [],
  actions: () => data.value?.actions ?? [],
  inherited: () => inherited.value
})

/** `moduleId::actionId` -> excepción guardada, para conocer su `id` al guardar. */
const overrideByKey = computed(() => {
  const map = new Map<string, UserPermission>()
  for (const row of data.value?.overrides ?? []) {
    map.set(permissionKey(row.permission_id, row.action_id), row)
  }
  return map
})

// El punto de partida es una traducción 1:1 de la tabla: lo que no tiene fila
// se queda en `inherit`.
watch(data, (value) => {
  editor.setBaseline((value?.overrides ?? []).map(row => [
    permissionKey(row.permission_id, row.action_id),
    row.is_grant ? 'grant' : 'deny'
  ] as const))
}, { immediate: true })

const userName = computed(() =>
  fullName(data.value?.user.profile) ?? data.value?.user.username ?? data.value?.user.email ?? 'Usuario'
)

/** Todas las celdas de la matriz: sobre esto se mide cuánto puede hacer. */
const totalCombinations = computed(() => editor.modules.value.length * editor.actions.value.length)

const loading = usePendingAfterHydration(status)
const loadingUser = computed(() => Boolean(selectedUserId.value) && loading.value)

/** Opciones del selector: nombre visible arriba y correo debajo. */
const userItems = computed(() =>
  (users.value ?? []).map(user => ({
    value: user.id,
    label: fullName(user.profile) ?? user.username ?? user.email,
    description: user.email,
    avatar: user.profile?.foto_url ? { src: user.profile.foto_url } : undefined,
    icon: user.profile?.foto_url ? undefined : 'i-lucide-circle-user'
  }))
)

const saving = ref(false)

/** Cada celda cambiada se traduce en una sola llamada: alta, cambio o baja. */
async function save() {
  if (!data.value || !editor.isDirty.value) return

  saving.value = true

  const userId = data.value.user.id

  const operations = editor.changes.value.map((change) => {
    const existing = overrideByKey.value.get(change.key)
    const { moduleId, actionId } = parsePermissionKey(change.key)

    // Vuelve a lo que diga el rol: la excepción ya no hace falta.
    if (change.to === 'inherit') {
      return existing ? userPermissionsApi.remove(existing.id) : Promise.resolve()
    }

    const isGrant = change.to === 'grant'

    // `create` reactiva la fila si estaba borrada, así que ir y volver sobre la
    // misma celda no acumula filas.
    return existing
      ? userPermissionsApi.update(existing.id, { is_grant: isGrant })
      : userPermissionsApi.create({
          user_id: userId,
          permission_id: moduleId,
          action_id: actionId,
          is_grant: isGrant
        })
  })

  try {
    const results = await Promise.allSettled(operations)
    const failed = results.filter(result => result.status === 'rejected')

    if (failed.length) {
      notify.warning('Se guardó parcialmente', `${failed.length} de ${operations.length} cambios fallaron: ${apiErrorMessage((failed[0] as PromiseRejectedResult).reason)}`)
    } else {
      notify.success('Permisos actualizados', `Se guardaron las excepciones de ${userName.value}.`)
    }

    await refresh()
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
      title="Permisos por usuario"
      description="Excepciones sobre lo que concede su rol: qué puede hacer aunque el rol no lo dé, y qué no aunque el rol sí lo dé."
    >
      <template #actions>
        <UButton
          v-if="data"
          label="Datos del usuario"
          icon="i-lucide-square-pen"
          color="neutral"
          variant="outline"
          :to="`/usuarios/${data.user.id}`"
        />
      </template>
    </BasePageHeader>

    <BasePickerSelect
      v-model="pickedUserId"
      :items="userItems"
      icon="i-lucide-circle-user"
      placeholder="Elige un usuario"
      search-placeholder="Buscar por nombre o correo…"
      :loading="!users && !usersError"
      :disabled="saving"
    />

    <BaseErrorAlert
      :error="usersError"
      title="No se pudieron cargar los usuarios"
      @retry="refreshUsers"
    />

    <BaseErrorAlert
      :error="error"
      title="No se pudieron cargar los permisos"
      @retry="refresh"
    />

    <div
      v-if="loadingUser"
      class="space-y-4"
    >
      <USkeleton class="h-32 w-full" />
      <USkeleton class="h-64 w-full" />
    </div>

    <template v-else-if="data">
      <!--
        El backend protege `/user-permissions` con el módulo `user_permissions`,
        que no viene sembrado. Sin esa fila solo el superadmin puede administrar
        excepciones, así que se explica el alta en lugar de dejar un 403 seco.
      -->
      <UAlert
        v-if="data.overridesForbidden"
        color="error"
        variant="subtle"
        icon="i-lucide-lock"
        title="Tu cuenta no puede leer las excepciones de permisos"
        description="Las rutas de permisos por usuario exigen el módulo «user_permissions», que aún no existe en el sistema. Créalo con ese código exacto y actívale Leer, Crear, Actualizar y Eliminar al rol que deba administrarlos. Mientras tanto, solo un superadmin puede editar esta pantalla."
        :actions="[{
          label: 'Crear el módulo',
          color: 'error',
          variant: 'outline',
          to: '/roles/modulos/nuevo'
        }]"
      />

      <template v-else>
        <UAlert
          v-if="!data.user.role_id"
          color="warning"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          title="Este usuario no tiene rol"
          description="Sin rol no hereda nada: la columna «El rol da» dirá que no en todo, y lo único que le dará permisos son las excepciones que marques aquí. Asignarle un rol es lo más mantenible."
          :actions="[{ label: 'Asignar rol', color: 'warning', variant: 'outline', to: `/usuarios/${data.user.id}` }]"
        />

        <UAlert
          v-else-if="!data.inheritedAvailable"
          color="warning"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          title="No se pudo leer lo que otorga el rol"
          description="Falta el permiso de lectura sobre los permisos de rol, así que la columna «El rol da» y la de «Resultado» no son fiables en esta pantalla. Lo que guardes se aplicará igual."
        />

        <!-- Resumen: lo que importa aquí son las excepciones, no cuántos permisos hay -->
        <UserPermissionSummary
          :user-name="userName"
          :email="data.user.email"
          :role-name="data.role?.name ?? null"
          :inherited-count="editor.inheritedCount.value"
          :grant-count="editor.grantCount.value"
          :deny-count="editor.denyCount.value"
          :effective-count="editor.effectiveCount.value"
          :total="totalCombinations"
          :exception-count="editor.exceptionCount.value"
          :disabled="saving"
          @reset-all="editor.resetAllToInherit"
        />

        <UEmpty
          v-if="!editor.modules.value.length"
          icon="i-lucide-key-round"
          title="No hay módulos definidos"
          description="Los permisos se construyen sobre los módulos del sistema."
          :actions="[{ label: 'Ir a módulos', icon: 'i-lucide-arrow-right', to: '/roles/modulos' }]"
        />

        <UserPermissionModuleList
          v-else
          :modules="editor.modules.value"
          :actions="editor.actions.value"
          :categories="data.categories"
          :states="editor.statesByModule.value"
          :inherited="editor.inheritedByModule.value"
          :disabled="saving"
          @toggle="(moduleId, actionId, state) => editor.set(permissionKey(moduleId, actionId), state)"
          @set-module="editor.setModule"
        />

        <PermissionSaveBar
          :change-count="editor.changeCount.value"
          :added-count="editor.addedCount.value"
          :removed-count="editor.removedCount.value"
          :saving="saving"
          @discard="editor.reset"
          @save="save"
        />
      </template>
    </template>
  </UContainer>
</template>
