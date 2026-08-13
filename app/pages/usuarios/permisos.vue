<script setup lang="ts">
import type { UserPermission } from '~/types'

definePageMeta({
  layout: 'app'
})

const rolePermissionsApi = useRolePermissionsApi()
const userPermissionsApi = useUserPermissionsApi()
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

/**
 * El catálogo de la pantalla —módulos, acciones, categorías y las personas del
 * selector—: se pide una sola vez y no depende de a quién se esté editando, así
 * que la matriz se puede pintar entera (aunque en blanco) antes de elegir a
 * nadie.
 *
 * Va por `/user-permissions/catalog`, que exige el mismo `assign` que la propia
 * matriz. Antes eran cuatro llamadas —usuarios, módulos, acciones y
 * categorías—, cada una pidiendo el `list` de su módulo: para administrar esta
 * pantalla había que conceder además el listado de usuarios y de otros tres
 * módulos.
 */
const {
  data: catalog,
  error: catalogError,
  refresh: refreshCatalog
} = useAsyncData(
  'user-permissions:catalog',
  () => userPermissionsApi.catalog(),
  { server: false }
)

/** Las personas del selector salen del propio catálogo, ya con rol y perfil. */
const users = computed(() => catalog.value?.users ?? [])

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

    // La persona y su rol salen del catálogo, que ya viene con las dos cosas.
    // Pedir su ficha aparte exigía `users:read`, un permiso más que conceder
    // para no averiguar nada que no estuviera ya en el selector.
    const user = users.value.find(candidate => candidate.id === userId)
    if (!user) return null

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
        inheritedKeys = rows.map(row => row.action_id)
      } catch {
        inheritedAvailable = false
      }
    }

    return {
      user,
      role: user.role ?? null,
      overrides, overridesForbidden, inheritedKeys, inheritedAvailable
    }
  },
  // El catálogo trae al usuario elegido, así que hay que reintentar cuando
  // llegue: con `?usuario=` en la URL, esto corre antes de que esté cargado.
  { server: false, watch: [selectedUserId, users] }
)

useSeoMeta({
  title: () => (data.value ? `Permisos · ${data.value.user.email}` : 'Permisos por usuario')
})

const inherited = computed(() => new Set(data.value?.inheritedKeys ?? []))

const editor = useUserPermissionOverrides({
  modules: () => catalog.value?.modules ?? [],
  actions: () => catalog.value?.actions ?? [],
  inherited: () => inherited.value
})

// El punto de partida es una traducción 1:1 de la tabla: lo que no tiene fila
// se queda en `inherit`.
watch(data, (value) => {
  editor.setBaseline((value?.overrides ?? []).map(row => [
    row.action_id,
    row.is_grant ? 'grant' : 'deny'
  ] as const))
}, { immediate: true })

const userName = computed(() =>
  fullName(data.value?.user.profile) ?? data.value?.user.username ?? data.value?.user.email ?? 'Usuario'
)

/**
 * Todas las celdas de la matriz: sobre esto se mide cuánto puede hacer.
 *
 * Es la suma de las acciones de cada módulo, no módulos × acciones: cada acción
 * pertenece a un módulo y no todos implementan las mismas.
 */
const totalCombinations = computed(() =>
  editor.modules.value.reduce(
    (suma, module) => suma + (editor.actionsByModule.value[module.id]?.length ?? 0),
    0
  )
)

const loading = usePendingAfterHydration(status)
/**
 * También mientras falta el catálogo: la persona elegida sale de ahí, así que
 * con `?usuario=` en la URL esto corre una vez en vacío antes de que llegue.
 * Sin esperarlo se vería un parpadeo de la matriz en blanco.
 */
const loadingUser = computed(() =>
  Boolean(selectedUserId.value) && (loading.value || !catalog.value)
)

/**
 * Los atajos a otras pantallas, solo para quien pueda abrirlas: con «Asignar
 * permisos» a secas se administra esta matriz sin acceso ni al módulo de
 * usuarios ni al catálogo de módulos, y ofrecerlos sería mandarle a una
 * pantalla que rebota.
 */
const irAModulos = computed(() =>
  access.canVisit('/roles/modulos')
    ? [{ label: 'Ir a módulos', icon: 'i-lucide-arrow-right', to: '/roles/modulos' }]
    : []
)

const asignarRol = (userId: string) =>
  (access.canVisit(`/usuarios/${userId}`)
    ? [{ label: 'Asignar rol', color: 'warning' as const, variant: 'outline' as const, to: `/usuarios/${userId}` }]
    : [])

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

/** Sin usuario elegido la matriz se ve pero no se puede tocar, además de mientras se guarda. */
const matrixDisabled = computed(() => saving.value || !data.value)

/**
 * Guarda la matriz de una vez: se mandan las excepciones que deben quedar y el
 * backend calcula la diferencia. Lo que no va en la lista vuelve a heredar del
 * rol.
 *
 * Antes eran hasta tres llamadas —quitar, crear y ajustar—, que pedían
 * `bulk_delete`, `bulk_create` y `bulk_update` además de `assign`, y ninguna
 * era atómica: un fallo a media tanda dejaba a la persona con parte de los
 * cambios. Ahora entra todo o no entra nada, y con `assign` basta.
 */
async function save() {
  if (!data.value || !editor.isDirty.value) return

  saving.value = true

  const userId = data.value.user.id

  try {
    await userPermissionsApi.syncByUser(
      userId,
      editor.exceptions.value.map(({ key, isGrant }) => ({ action_id: key, is_grant: isGrant }))
    )

    notify.success('Permisos actualizados', `Se guardaron las excepciones de ${userName.value}.`)

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
        <!--
          Solo si esa ficha se puede abrir: con «Asignar permisos» a secas se
          administra esta matriz sin tener acceso al módulo de usuarios, y el
          botón llevaba a una pantalla que rebota.
        -->
        <UButton
          v-if="data && access.canVisit(`/usuarios/${data.user.id}`)"
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
      :loading="!catalog && !catalogError"
      :disabled="saving"
    />

    <BaseErrorAlert
      :error="catalogError"
      title="No se pudo cargar el catálogo de permisos"
      @retry="refreshCatalog"
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

    <!--
      La matriz se ve siempre, elegido o no un usuario: sin nada elegido se
      muestran los módulos reales pero en blanco y sin poder abrirse, para que
      la pantalla no cambie de forma en cuanto se elige uno. Los avisos de
      abajo (403, sin rol, sin lo heredado) sí son propios de un usuario
      concreto y solo aparecen una vez cargado.
    -->
    <template v-else-if="catalog">
      <!--
        El backend protege `/user-permissions` con el módulo `user_permissions`.
        Un 403 aquí no distingue si el módulo no existe o si existe pero nadie
        tiene sus acciones concedidas —las dos cosas responden igual—, así que
        el aviso cubre ambas en vez de asumir una.
      -->
      <UAlert
        v-if="data?.overridesForbidden"
        color="error"
        variant="subtle"
        icon="i-lucide-lock"
        title="Tu cuenta no puede leer las excepciones de permisos"
        description="Las rutas de permisos por usuario exigen el módulo «user_permissions». Si no existe, créalo con ese código exacto desde «Módulos del sistema»; si ya existe, concédele Asignar permisos (para verlas) y Crear masivo, Actualizar masivo y Eliminar masivo (para guardarlas) al rol que deba administrarlas. Mientras tanto, solo un superadmin puede editar esta pantalla."
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
          v-if="data && !data.user.role_id"
          color="warning"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          title="Este usuario no tiene rol"
          description="Sin rol no hereda nada: el tooltip de «Hereda» dirá que no en todo, y lo único que le dará permisos son las excepciones que marques aquí. Asignarle un rol es lo más mantenible."
          :actions="asignarRol(data.user.id)"
        />

        <UAlert
          v-else-if="data && !data.inheritedAvailable"
          color="warning"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          title="No se pudo leer lo que otorga el rol"
          description="Falta el permiso `assign` sobre los permisos de rol, así que el tooltip de «Hereda» y lo que se ve atenuado en cada acción no son fiables en esta pantalla. Lo que guardes se aplicará igual."
        />

        <!-- Resumen: lo que importa aquí son las excepciones, no cuántos permisos hay -->
        <UserPermissionSummary
          :user-name="data ? userName : 'Ningún usuario elegido'"
          :email="data?.user.email"
          :role-name="data?.role?.name ?? null"
          :inherited-count="editor.inheritedCount.value"
          :grant-count="editor.grantCount.value"
          :deny-count="editor.denyCount.value"
          :effective-count="editor.effectiveCount.value"
          :total="totalCombinations"
          :exception-count="editor.exceptionCount.value"
          :disabled="matrixDisabled"
          @reset-all="editor.resetAllToInherit"
        />

        <UEmpty
          v-if="!editor.modules.value.length"
          icon="i-lucide-key-round"
          title="No hay módulos definidos"
          description="Los permisos se construyen sobre los módulos del sistema."
          :actions="irAModulos"
        />

        <UserPermissionModuleList
          v-else
          :modules="editor.modules.value"
          :actions="editor.actions.value"
          :categories="catalog?.categories ?? []"
          :states="editor.statesByModule.value"
          :inherited="editor.inheritedByModule.value"
          :disabled="matrixDisabled"
          @toggle="(moduleId, actionId, state) => editor.set(actionId, state)"
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
