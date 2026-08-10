<script setup lang="ts">
import type { AuthFormField, FormError, FormSubmitEvent } from '@nuxt/ui'
import type { FetchError } from 'ofetch'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({ title: 'Iniciar sesión' })

interface LoginState {
  email?: string
  password?: string
  remember?: boolean
}

const { login } = useAuth()
const route = useRoute()
const notify = useNotify()

const loading = ref(false)

/**
 * Segundos que quedan del bloqueo por intentos fallidos (`app/services/login_throttle.py`).
 *
 * El backend responde 429 con `reintentar_en` cuando se abusa del login. Se
 * cuenta hacia atrás en el propio navegador para no tener que golpear otra vez
 * el mismo endpoint solo para saber si ya se puede reintentar.
 */
const retryAfter = ref(0)
let retryTimer: ReturnType<typeof setInterval> | undefined

function startRetryCountdown(seconds: number) {
  clearInterval(retryTimer)
  retryAfter.value = Math.max(0, Math.ceil(seconds))

  retryTimer = setInterval(() => {
    retryAfter.value -= 1
    if (retryAfter.value <= 0) clearInterval(retryTimer)
  }, 1000)
}

onScopeDispose(() => clearInterval(retryTimer))

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
  },
  {
    name: 'remember',
    type: 'checkbox',
    label: 'Mantener la sesión abierta'
  }
]

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
  const { email, password, remember } = event.data

  // `validate` ya garantiza que ambos vienen; esto solo satisface al tipo.
  if (!email || !password) return

  loading.value = true

  try {
    const user = await login({ email, password }, Boolean(remember))

    notify.success('Sesión iniciada', `Bienvenido, ${user.username ?? user.email}.`)

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/usuarios'
    await navigateTo(redirect)
  } catch (error) {
    if (apiErrorStatus(error) === 429) {
      const reintentarEn = (error as FetchError<{ reintentar_en?: number }>)?.data?.reintentar_en
      if (typeof reintentarEn === 'number') startRetryCountdown(reintentarEn)
    }

    notify.error(error, 'No se pudo iniciar sesión')
  } finally {
    loading.value = false
  }
}

const submitLabel = computed(() =>
  retryAfter.value > 0 ? `Espera ${retryAfter.value}s…` : 'Iniciar sesión'
)
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
      :submit="{ label: submitLabel, disabled: retryAfter > 0 }"
      @submit="onSubmit"
    >
      <template #footer>
        <p class="text-sm text-muted text-center">
          Si no tienes acceso, pide a un administrador que cree tu usuario.
        </p>
      </template>
    </UAuthForm>
  </UPageCard>
</template>
