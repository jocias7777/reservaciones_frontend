<script setup lang="ts">
import type { AuthFormField, FormError, FormSubmitEvent } from '@nuxt/ui'

/**
 * La ruta es `/reset-password` y no una en español porque es la que el backend
 * pone en el enlace del correo: `PASSWORD_RESET_URL_BASE` (`config.py`) vale
 * `http://localhost:3000/reset-password` por defecto, y de ahí sale el
 * `?token=…`. Cambiarle el nombre aquí rompería todos los enlaces ya enviados,
 * así que manda el backend.
 */
definePageMeta({
  layout: 'auth'
})

useSeoMeta({ title: 'Elegir contraseña nueva' })

/**
 * Mínimo de la contraseña, igual que
 * `app/services/password_reset.py::LONGITUD_MINIMA_CONTRASENA`.
 *
 * Se repite para poder avisar antes de gastar el token: el backend lo comprueba
 * primero que nada, pero un rechazo por corta ya consume un intento del freno
 * por IP. Si los dos números dejaran de coincidir, manda el mensaje del backend.
 */
const MIN_PASSWORD_LENGTH = 8

interface ResetState {
  password?: string
  confirmation?: string
}

const route = useRoute()
const { resetPassword } = useAuth()
const notify = useNotify()

const loading = ref(false)
const done = ref(false)

/** El token del enlace del correo. Sin él no hay nada que hacer en esta pantalla. */
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

/**
 * El freno por IP de este endpoint (429 con `reintentar_en`, ver
 * `reset_password_throttle_actual`), con el mismo composable que el login. Se
 * desestructura porque en la plantilla un ref anidado no se desenvuelve solo.
 */
const { blocked: retryBlocked, noteError: noteRetry, submitLabel: retrySubmitLabel } = useRetryAfter()

const fields: AuthFormField[] = [
  {
    name: 'password',
    type: 'password',
    label: 'Contraseña nueva',
    placeholder: `Al menos ${MIN_PASSWORD_LENGTH} caracteres`,
    autocomplete: 'new-password',
    required: true
  },
  {
    name: 'confirmation',
    type: 'password',
    label: 'Repetir la contraseña',
    placeholder: 'La misma otra vez',
    autocomplete: 'new-password',
    required: true
  }
]

/**
 * La confirmación se comprueba solo aquí: el backend no la recibe ni le hace
 * falta. Es para atrapar un dedazo antes de gastar el token, que es de un solo
 * uso —equivocarse obliga a pedir otro correo—.
 */
function validate(state: ResetState): FormError[] {
  const errors: FormError[] = []

  if (!state.password) {
    errors.push({ name: 'password', message: 'Elige una contraseña' })
  } else if (state.password.length < MIN_PASSWORD_LENGTH) {
    errors.push({ name: 'password', message: `Debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` })
  }

  if (!state.confirmation) {
    errors.push({ name: 'confirmation', message: 'Repite la contraseña' })
  } else if (state.password && state.confirmation !== state.password) {
    errors.push({ name: 'confirmation', message: 'Las dos contraseñas no coinciden' })
  }

  return errors
}

async function onSubmit(event: FormSubmitEvent<ResetState>) {
  const { password } = event.data

  if (!password || !token.value) return

  loading.value = true

  try {
    const message = await resetPassword({ token: token.value, password })

    // El backend invalidó todos los refresh tokens de la cuenta, y
    // `resetPassword` ya limpió la sesión local: lo único coherente es volver a
    // entrar con la contraseña nueva.
    done.value = true
    notify.success('Contraseña actualizada', message)

    await navigateTo('/login')
  } catch (error) {
    noteRetry(error)
    notify.error(error, 'No se pudo cambiar la contraseña')
  } finally {
    loading.value = false
  }
}

const submitLabel = computed(() => retrySubmitLabel('Guardar contraseña'))
</script>

<template>
  <UPageCard>
    <!--
      Sin token no se pinta el formulario: llenarlo para que la petición rebote
      con «token y password son requeridos» no ayuda a nadie. Pasa si se entra a
      la ruta a mano, o si el enlace del correo se cortó al copiarlo.
    -->
    <div
      v-if="!token"
      class="space-y-4"
    >
      <UAlert
        title="Enlace incompleto"
        description="Este enlace no trae el código de recuperación. Vuelve a pedir el correo y entra desde el enlace completo."
        icon="i-lucide-link-2-off"
        color="error"
        variant="subtle"
      />

      <UButton
        label="Pedir otro enlace"
        icon="i-lucide-key-round"
        to="/forgot-password"
        block
      />
    </div>

    <UAuthForm
      v-else
      :fields="fields"
      :validate="validate"
      :loading="loading"
      :disabled="done"
      icon="i-lucide-lock"
      title="Elegir contraseña nueva"
      description="Escríbela dos veces. Al guardarla se cierran las demás sesiones de tu cuenta."
      :submit="{ label: submitLabel, disabled: retryBlocked || done }"
      @submit="onSubmit"
    >
      <template #footer>
        <p class="text-sm text-center">
          <BaseAuthLink to="/login">
            Volver al inicio
          </BaseAuthLink>
        </p>
      </template>
    </UAuthForm>
  </UPageCard>
</template>
