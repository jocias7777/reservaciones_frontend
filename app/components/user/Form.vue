<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import type { UserFormPayload, UserWithRelations } from '~/types'

/**
 * Formulario de usuario (alta y edición).
 *
 * Solo se encarga de recoger y validar datos: emite `submit` con la cuenta y el
 * perfil por separado y la página decide contra qué endpoints guardarlos.
 */
const props = withDefaults(defineProps<{
  /** Id del `<form>`: lo usa el botón de guardar, que vive en la cabecera. */
  id?: string
  mode?: 'create' | 'edit'
  user?: UserWithRelations | null
}>(), {
  id: 'user-form',
  mode: 'create',
  user: null
})

const emit = defineEmits<{ submit: [payload: UserFormPayload] }>()

const rolesApi = useRolesApi()

interface UserFormState {
  email: string
  username: string
  password: string
  /** Cadena vacía = "Sin rol asignado" (el backend guarda `null`). */
  role_id: string
  is_active: boolean
  name: string
  last_name: string
  phone: string
  address: string
  date_of_birth: string
  foto_url: string
}

function stateFromUser(user?: UserWithRelations | null): UserFormState {
  return {
    email: user?.email ?? '',
    username: user?.username ?? '',
    password: '',
    role_id: user?.role_id ?? '',
    is_active: user?.is_active ?? true,
    name: user?.profile?.name ?? '',
    last_name: user?.profile?.last_name ?? '',
    phone: user?.profile?.phone ?? '',
    address: user?.profile?.address ?? '',
    date_of_birth: toDateInputValue(user?.profile?.date_of_birth),
    foto_url: user?.profile?.foto_url ?? ''
  }
}

const state = reactive<UserFormState>(stateFromUser(props.user))

// Al editar, los datos llegan después del primer render.
watch(() => props.user, (user) => {
  Object.assign(state, stateFromUser(user))
})

/**
 * Roles para el selector. Si la cuenta no tiene permiso `roles:read` el select
 * queda vacío con un aviso, en lugar de romper el formulario completo.
 */
const { data: roles, error: rolesError } = useAsyncData(
  'roles:options',
  async () => (await rolesApi.options()).items,
  { server: false, default: () => [] }
)

/**
 * Valor de la opción "Sin rol asignado".
 *
 * No puede ser la cadena vacía, aunque sea lo que se guarda: el desplegable de
 * Nuxt UI la reserva para "no hay nada elegido" y lanza un error al pintar una
 * opción con ese valor, con lo que el panel no llegaba a abrirse. Se usa un
 * valor propio y se traduce a `''` al escribir en el formulario.
 */
const WITHOUT_ROLE = 'sin-rol'

const roleItems = computed(() => [
  { label: 'Sin rol asignado', value: WITHOUT_ROLE, icon: 'i-lucide-shield-off' },
  ...(roles.value ?? []).map(role => ({
    label: role.label,
    value: role.value,
    icon: 'i-lucide-shield'
  }))
])

/** Lo que ve y escribe el selector; el estado sigue guardando `''` para "sin rol". */
const selectedRole = computed({
  get: () => state.role_id || WITHOUT_ROLE,
  set: (value: string) => {
    state.role_id = value === WITHOUT_ROLE ? '' : value
  }
})

/** La edad se deriva de la fecha de nacimiento; no se edita a mano. */
const age = computed(() => ageFromBirthDate(state.date_of_birth))

const photoError = ref<string | null>(null)
const processingPhoto = ref(false)

/**
 * La foto elegida se recorta y comprime en el navegador y se guarda dentro del
 * perfil (`foto_url`), porque el backend todavía no tiene endpoint de carga de
 * archivos. Ver `utils/image.ts`.
 */
async function onPhotoSelected(value: unknown) {
  const file = value instanceof File ? value : null
  photoError.value = null

  if (!file) return

  processingPhoto.value = true
  try {
    state.foto_url = await fileToAvatarDataUrl(file)
  } catch (error) {
    photoError.value = error instanceof Error ? error.message : 'No se pudo procesar la imagen.'
  } finally {
    processingPhoto.value = false
  }
}

function clearPhoto() {
  state.foto_url = ''
  photoError.value = null
}

const avatarSrc = computed(() => state.foto_url || undefined)
const avatarText = computed(() => initials(fullName(state) ?? state.email))

const isCreate = computed(() => props.mode === 'create')

function validate(current: UserFormState): FormError[] {
  const errors: FormError[] = []

  if (!current.email.trim()) {
    errors.push({ name: 'email', message: 'El correo es obligatorio' })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(current.email.trim())) {
    errors.push({ name: 'email', message: 'El correo no tiene un formato válido' })
  }

  if (isCreate.value && !current.password) {
    errors.push({ name: 'password', message: 'La contraseña es obligatoria' })
  }

  if (current.password && current.password.length < 8) {
    errors.push({ name: 'password', message: 'Usa al menos 8 caracteres' })
  }

  if (current.phone && !/^[\d\s+()-]{7,25}$/.test(current.phone)) {
    errors.push({ name: 'phone', message: 'El teléfono solo admite números, espacios y + ( ) -' })
  }

  if (current.date_of_birth && ageFromBirthDate(current.date_of_birth) === null) {
    errors.push({ name: 'date_of_birth', message: 'La fecha de nacimiento no es válida' })
  }

  return errors
}

/** Cadena vacía -> `null`: así el backend limpia el campo en lugar de guardar "". */
const blankToNull = (value: string) => {
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function onSubmit() {
  const profile = {
    name: blankToNull(state.name),
    last_name: blankToNull(state.last_name),
    phone: blankToNull(state.phone),
    address: blankToNull(state.address),
    date_of_birth: blankToNull(state.date_of_birth),
    age: age.value,
    foto_url: blankToNull(state.foto_url)
  }

  const hasProfile = Object.entries(profile).some(([key, value]) => key !== 'age' && value !== null)

  emit('submit', {
    account: {
      email: state.email.trim(),
      username: blankToNull(state.username),
      ...(state.password ? { password: state.password } : {}),
      role_id: state.role_id || null,
      is_active: state.is_active
    },
    profile,
    hasProfile
  })
}
</script>

<template>
  <UForm
    :id="props.id"
    :state="state"
    :validate="validate"
    class="space-y-6"
    @submit="onSubmit"
  >
    <UPageCard
      title="Cuenta"
      description="Datos con los que el usuario inicia sesión."
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          label="Correo electrónico"
          name="email"
          required
        >
          <UInput
            v-model="state.email"
            type="email"
            placeholder="usuario@ejemplo.com"
            autocomplete="off"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Nombre de usuario"
          name="username"
          hint="Opcional"
        >
          <UInput
            v-model="state.username"
            placeholder="usuario"
            autocomplete="off"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Contraseña"
          name="password"
          :required="isCreate"
          :help="isCreate ? 'Mínimo 8 caracteres.' : 'Déjala vacía para conservar la actual.'"
        >
          <UInput
            v-model="state.password"
            type="password"
            :placeholder="isCreate ? 'Mínimo 8 caracteres' : '••••••••'"
            autocomplete="new-password"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Rol"
          name="role_id"
          :error="rolesError ? 'No se pudieron cargar los roles.' : undefined"
        >
          <USelectMenu
            v-model="selectedRole"
            :items="roleItems"
            value-key="value"
            :icon="state.role_id ? 'i-lucide-shield' : 'i-lucide-shield-off'"
            :search-input="{ placeholder: 'Buscar rol…' }"
            class="w-full"
          />
        </UFormField>
      </div>

      <UFormField
        name="is_active"
        label="Cuenta activa"
        description="Un usuario inactivo no puede iniciar sesión."
        class="mt-4"
      >
        <USwitch
          v-model="state.is_active"
          class="mt-1"
        />
      </UFormField>
    </UPageCard>

    <UPageCard
      title="Perfil"
      description="Datos personales. Todos son opcionales."
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          label="Nombre"
          name="name"
        >
          <UInput
            v-model="state.name"
            placeholder="Juan"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Apellidos"
          name="last_name"
        >
          <UInput
            v-model="state.last_name"
            placeholder="Pérez"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Teléfono"
          name="phone"
        >
          <UInput
            v-model="state.phone"
            placeholder="229 555 0101"
            icon="i-lucide-phone"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Fecha de nacimiento"
          name="date_of_birth"
        >
          <UInput
            v-model="state.date_of_birth"
            type="date"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Edad"
          name="age"
          hint="Se calcula desde la fecha"
        >
          <UInput
            :model-value="age === null ? '' : String(age)"
            type="text"
            disabled
            placeholder="—"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Foto"
          name="foto_url"
        >
          <div class="flex items-center gap-3">
            <UAvatar
              :src="avatarSrc"
              :text="avatarText"
              size="lg"
            />

            <!-- Con el slot por defecto el disparador es un botón con texto; la
                 variante `button` de UFileUpload solo dibuja el icono. -->
            <UFileUpload
              v-slot="{ open }"
              accept="image/*"
              :preview="false"
              :disabled="processingPhoto"
              @update:model-value="onPhotoSelected"
            >
              <UButton
                label="Subir"
                icon="i-lucide-upload"
                color="neutral"
                variant="outline"
                :loading="processingPhoto"
                @click="open()"
              />
            </UFileUpload>

            <UButton
              v-if="state.foto_url"
              label="Quitar"
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              :disabled="processingPhoto"
              @click="clearPhoto"
            />
          </div>

          <template #help>
            <span
              v-if="photoError"
              class="text-error"
            >{{ photoError }}</span>
            <span v-else-if="processingPhoto">Procesando la imagen…</span>
            <span v-else>Se recorta en cuadrado y se guarda con el perfil.</span>
          </template>
        </UFormField>
      </div>

      <UFormField
        label="Dirección"
        name="address"
        class="mt-2"
      >
        <UTextarea
          v-model="state.address"
          placeholder="Calle, número, ciudad"
          :rows="3"
          class="w-full"
        />
      </UFormField>
    </UPageCard>
  </UForm>
</template>
