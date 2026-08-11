<script setup lang="ts">
import type { CreateUserPermissionPayload, UserPermission, UserPermissionBulkUpdateItem } from '~/types'

definePageMeta({
  layout: 'app'
})

const usersApi = useUsersApi()
const rolesApi = useRolesApi()
const rolePermissionsApi = useRolePermissionsApi()
const userPermissionsApi = useUserPermissionsApi()
const { fetchPermissionCatalog } = usePermissionCatalog()
const notify = useNotify()
const access = useAccessControl()

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

/**
 * Guarda los cambios agrupados por lo que hace falta hacer con cada uno:
 * volver a heredar se revoca con un borrado masivo, lo nuevo se concede con
 * `bulk/create` y lo que ya existía como excepción se ajusta con
 * `bulk/update`. Como en permisos por rol, ninguno de los dos `bulk/*` es
 * atómico: un choque de negocio suelto no cancela el lote, sale detallado en
 * `errores` junto con lo que sí se guardó.
 */
async function save() {
  if (!data.value || !editor.isDirty.value) return

  saving.value = true

  const userId = data.value.user.id

  const toRemoveIds: string[] = []
  const toCreate: CreateUserPermissionPayload[] = []
  const toUpdate: UserPermissionBulkUpdateItem[] = []

  for (const change of editor.changes.value) {
    const existing = overrideByKey.value.get(change.key)

    // Vuelve a lo que diga el rol: la excepción ya no hace falta.
    if (change.to === 'inherit') {
      if (existing) toRemoveIds.push(existing.id)
      continue
    }

    const isGrant = change.to === 'grant'

    // Si ya existía como excepción, se ajusta; si no, se crea de cero.
    if (existing) {
      toUpdate.push({ id: existing.id, is_grant: isGrant })
    } else {
      const { moduleId, actionId } = parsePermissionKey(change.key)
      toCreate.push({ user_id: userId, permission_id: moduleId, action_id: actionId, is_grant: isGrant })
    }
  }

  try {
    if (toRemoveIds.length) {
      await userPermissionsApi.bulkRemove(toRemoveIds)
    }

    let failedCount = 0
    let attemptedCount = 0
    let firstError = ''

    if (toCreate.length) {
      const result = await userPermissionsApi.bulkCreate(toCreate)
      failedCount += result.fallidos
      attemptedCount += toCreate.length
      firstError ||= result.errores[0]?.error ?? ''
    }

    if (toUpdate.length) {
      const result = await userPermissionsApi.bulkUpdate(toUpdate)
      failedCount += result.fallidos
      attemptedCount += toUpdate.length
      firstError ||= result.errores[0]?.error ?? ''
    }

    if (failedCount) {
      notify.warning('Se guardó parcialmente', `${failedCount} de ${attemptedCount} cambios fallaron: ${firstError}`)
    } else {
      notify.success('Permisos actualizados', `Se guardaron las excepciones de ${userName.value}.`)
    }

    await refresh()

    // Si la cuenta editada es la que está guardando esto (o comparte sesión de
    // pruebas con quien administra), sin esto seguiría viendo los botones con
    // el estado con el que entró hasta cerrar sesión.
    await access.refresh()
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
        El backend protege `/user-permissions` con el módulo `user_permissions`.
        Un 403 aquí no distingue si el módulo no existe o si existe pero nadie
        tiene sus acciones concedidas —las dos cosas responden igual—, así que
        el aviso cubre ambas en vez de asumir una.
      -->
      <UAlert
        v-if="data.overridesForbidden"
        color="error"
        variant="subtle"
        icon="i-lucide-lock"
        title="Tu cuenta no puede leer las excepciones de permisos"
        description="Las rutas de permisos por usuario exigen el módulo «user_permissions». Si no existe, créalo con ese código exacto desde «Módulos del sistema»; si ya existe, concédele Listar (para verlas) y Crear masivo, Actualizar masivo y Eliminar masivo (para guardarlas) al rol que deba administrarlas. Mientras tanto, solo un superadmin puede editar esta pantalla."
        :actions="[{
          label: 'Revisar módulos',
          color: 'error',
          variant: 'outline',
          to: '/roles/modulos'
        }, {
          label: 'Ir a permisos por rol',
          color: 'error',
          variant: 'outline',
          to: '/roles/permisos'
        }]"
      />

      <template v-else>
        <UAlert
          v-if="!data.user.role_id"
          color="warning"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          title="Este usuario no tiene rol"
          description="Sin rol no hereda nada: el tooltip de «Hereda» dirá que no en todo, y lo único que le dará permisos son las excepciones que marques aquí. Asignarle un rol es lo más mantenible."
          :actions="[{ label: 'Asignar rol', color: 'warning', variant: 'outline', to: `/usuarios/${data.user.id}` }]"
        />

        <UAlert
          v-else-if="!data.inheritedAvailable"
          color="warning"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          title="No se pudo leer lo que otorga el rol"
          description="Falta el permiso `list` sobre los permisos de rol, así que el tooltip de «Hereda» y lo que se ve atenuado en cada acción no son fiables en esta pantalla. Lo que guardes se aplicará igual."
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
