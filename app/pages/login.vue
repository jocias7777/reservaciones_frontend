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
const toast = useToast()

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
  loading.value = true

  try {
    const user = await login(
      { email: event.data.email!, password: event.data.password! },
      Boolean(event.data.remember)
    )

    toast.add({
      title: 'Sesión iniciada',
      description: `Bienvenido, ${user.username ?? user.email}.`,
      color: 'success',
      icon: 'i-lucide-circle-check'
    })

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/usuarios'
    await navigateTo(redirect)
  } catch (error) {
    toast.add({
      title: 'No se pudo iniciar sesión',
      description: apiErrorMessage(error, 'Revisa tus credenciales e inténtalo de nuevo.'),
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
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
