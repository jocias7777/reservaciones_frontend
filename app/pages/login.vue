<script setup lang="ts">
import type { AuthFormField, FormError, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({ title: 'Iniciar sesión' })

interface LoginState {
  email?: string
  password?: string
}

const { login } = useAuth()
const route = useRoute()
const notify = useNotify()

const loading = ref(false)

/**
 * El bloqueo por intentos fallidos (429 con `reintentar_en`). Ver `useRetryAfter`.
 *
 * Se desestructura para que `retryBlocked` quede como referencia de primer nivel:
 * dentro de la plantilla, un ref anidado en un objeto no se desenvuelve solo.
 */
const { blocked: retryBlocked, noteError: noteRetry, submitLabel: retrySubmitLabel } = useRetryAfter()

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Correo electrónico',
    placeholder: 'tucorreo@ejemplo.com',
    autocomplete: 'email',
    required: true
  },
  {
    name: 'password',
    type: 'password',
    label: 'Contraseña',
    placeholder: 'Ingresa tu contraseña',
    autocomplete: 'current-password',
    required: true
  }
]

/**
 * «Mantener la sesión abierta» se lleva aparte de `fields` para poder ponerla en
 * la misma fila que el enlace de recuperación (ver la plantilla). No pasa por el
 * estado del formulario, así que se lee de aquí al enviar; decide el tiempo de
 * vida de las cookies de sesión, de ahí que se fije antes de guardar el token.
 */
const remember = ref(false)

/**
 * Validación en el propio formulario (sin librería de schemas): el backend
 * vuelve a validar y sus mensajes se muestran en el toast.
 */
function validate(state: LoginState): FormError[] {
  const errors: FormError[] = []

  if (!state.email) {
    errors.push({ name: 'email', message: 'Ingresa tu correo electrónico' })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    errors.push({ name: 'email', message: 'El correo no tiene un formato válido' })
  }

  if (!state.password) {
    errors.push({ name: 'password', message: 'Ingresa tu contraseña' })
  }

  return errors
}

async function onSubmit(event: FormSubmitEvent<LoginState>) {
  const { email, password } = event.data

  // `validate` ya garantiza que ambos vienen; esto solo satisface al tipo.
  if (!email || !password) return

  loading.value = true

  try {
    const user = await login({ email, password }, remember.value)

    notify.success('Sesión iniciada', `Bienvenido, ${user.username ?? user.email}.`)

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/usuarios'
    await navigateTo(redirect)
  } catch (error) {
    noteRetry(error)
    notify.error(error, 'No se pudo iniciar sesión')
  } finally {
    loading.value = false
  }
}

const submitLabel = computed(() => retrySubmitLabel('Iniciar sesión'))
</script>

<template>
  <UPageCard>
    <UAuthForm
      :fields="fields"
      :validate="validate"
      :loading="loading"
      icon="i-lucide-user"
      title="Iniciar sesión"
      description="Accede con tu cuenta del sistema de reservaciones."
      :submit="{ label: submitLabel, disabled: retryBlocked }"
      @submit="onSubmit"
    >
      <template #validation>
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <UCheckbox
            v-model="remember"
            label="Mantener sesión"
          />

          <BaseAuthLink to="/forgot-password">
            Olvidé mi contraseña
          </BaseAuthLink>
        </div>
      </template>

      <template #footer>
        <p class="text-sm text-muted text-center">
          Si no tienes acceso, pide a un administrador que cree tu usuario.
        </p>
      </template>
    </UAuthForm>
  </UPageCard>
</template>
