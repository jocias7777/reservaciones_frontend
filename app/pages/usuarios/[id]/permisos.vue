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
const actionCategoriesApi = useActionCategoriesApi()
const rolePermissionsApi = useRolePermissionsApi()
const userPermissionsApi = useUserPermissionsApi()
const notify = useNotify()

/**
 * Aquí se editan las EXCEPCIONES de un usuario sobre lo que concede su rol, no
 * su permiso efectivo. Cada celda tiene tres estados y se guarda tal cual está
 * en `sa_user_permissions`: sin fila (hereda), `is_grant = true` (concede
 * aunque el rol no lo dé) o `is_grant = false` (bloquea aunque el rol sí lo dé).
 */
const { data, status, error, refresh } = useAsyncData(
  () => `user-permissions:${userId.value}`,
  async () => {
    const [user, modules, actions, categories] = await Promise.all([
      usersApi.get(userId.value),
      modulesApi.list(),
      actionsApi.list(),
      // Sin categorías la matriz sigue siendo usable (las acciones caen en un
      // único bloque), así que no se deja caer la pantalla entera por esto.
      actionCategoriesApi.list().catch(() => [])
    ])

    // Sin poder leer las excepciones no se puede editar nada sin riesgo de
    // pisar lo que ya hubiera guardado, así que se distingue el 403 para
    // explicarlo en pantalla en vez de fallar la carga entera.
    let overrides: UserPermission[] = []
    let overridesForbidden = false

    try {
      overrides = await userPermissionsApi.listByUser(userId.value)
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
      user, role, modules, actions, categories,
      overrides, overridesForbidden, inheritedKeys, inheritedAvailable
    }
  },
  { server: false, watch: [userId] }
)

useSeoMeta({
  title: () => (data.value ? `Permisos · ${data.value.user.email}` : 'Permisos del usuario')
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
  if (!value) return

  editor.setBaseline(value.overrides.map(row => [
    permissionKey(row.permission_id, row.action_id),
    row.is_grant ? 'grant' : 'deny'
  ] as const))
}, { immediate: true })

const userName = computed(() =>
  fullName(data.value?.user.profile) ?? data.value?.user.username ?? data.value?.user.email ?? 'Usuario'
)

const saving = ref(false)

/** Cada celda cambiada se traduce en una sola llamada: alta, cambio o baja. */
async function save() {
  if (!data.value || !editor.isDirty.value) return

  saving.value = true

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
          user_id: userId.value,
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

onBeforeRouteLeave(() => {
  if (!editor.isDirty.value) return true
  return window.confirm('Hay cambios de permisos sin guardar. ¿Salir de todos modos?')
})
</script>

<template>
  <UContainer class="py-6 space-y-4">
    <UPageHeader
      :title="userName"
      description="Excepciones sobre lo que concede su rol: qué puede hacer aunque el rol no lo dé, y qué no aunque el rol sí lo dé."
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
          :actions="[{ label: 'Asignar rol', color: 'warning', variant: 'outline', to: `/usuarios/${userId}` }]"
        />

        <UAlert
          v-else-if="!data.inheritedAvailable"
          color="warning"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          title="No se pudo leer lo que otorga el rol"
          description="Falta el permiso de lectura sobre los permisos de rol, así que la columna «El rol da» y la de «Resultado» no son fiables en esta pantalla. Lo que guardes se aplicará igual."
        />

        <UAlert
          v-if="data.role?.name === 'superadmin'"
          color="info"
          variant="subtle"
          icon="i-lucide-info"
          title="Este usuario es superadmin"
          description="El backend omite la comprobación de permisos para el rol «superadmin»: bloquear una acción aquí no le limita. Para restringirle algo, primero hay que cambiarle el rol."
        />

        <!-- Resumen: lo que importa aquí son las excepciones, no cuántos permisos hay -->
        <div class="border border-default rounded-lg bg-default divide-y divide-default">
          <div class="flex flex-wrap items-start gap-3 p-4 sm:p-5">
            <BaseIconTile
              icon="i-lucide-circle-user"
              size="lg"
            />

            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
                Usuario
              </p>
              <p class="text-lg font-semibold text-highlighted truncate">
                {{ userName }}
              </p>
              <p class="text-sm text-muted truncate">
                {{ data.user.email }}
              </p>
            </div>

            <UButton
              label="Todo hereda del rol"
              icon="i-lucide-rotate-ccw"
              color="neutral"
              variant="outline"
              :disabled="saving || !editor.exceptionCount.value"
              @click="editor.resetAllToInherit"
            />
          </div>

          <div class="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
            <UBadge
              :label="data.role
                ? `Hereda ${editor.inheritedCount.value} permiso(s) de «${data.role.name}»`
                : 'Sin rol: no hereda ningún permiso'"
              color="neutral"
              variant="subtle"
              icon="i-lucide-corner-down-right"
            />
            <UBadge
              :label="`${editor.grantCount.value} concedida(s)`"
              :color="editor.grantCount.value ? 'success' : 'neutral'"
              variant="subtle"
              icon="i-lucide-check"
            />
            <UBadge
              :label="`${editor.denyCount.value} bloqueada(s)`"
              :color="editor.denyCount.value ? 'error' : 'neutral'"
              variant="subtle"
              icon="i-lucide-ban"
            />
            <UBadge
              :label="`${editor.effectiveCount.value} permiso(s) efectivo(s)`"
              color="neutral"
              variant="subtle"
              icon="i-lucide-shield-check"
              class="ms-auto"
            />
          </div>
        </div>

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
