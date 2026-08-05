<script setup lang="ts">
import type { AuthFormField, FormError, FormSubmitEvent } from '@nuxt/ui'

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
    notify.error(error, 'No se pudo iniciar sesión')
  } finally {
    loading.value = false
  }
}
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
      :submit="{ label: 'Iniciar sesión' }"
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
