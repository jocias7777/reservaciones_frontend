<script setup lang="ts">
import type { AuthFormField, FormError, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({ title: 'Recuperar contraseña' })

interface ForgotState {
  email?: string
}

const { forgotPassword } = useAuth()
const notify = useNotify()

const loading = ref(false)

/**
 * El mensaje del backend, ya enviado.
 *
 * Se guarda para mostrarlo en la propia pantalla y no solo en un toast que se va
 * a los pocos segundos: es la única confirmación que va a recibir alguien que
 * ahora tiene que ir a buscar un correo.
 */
const sentMessage = ref<string | null>(null)

/**
 * El mismo freno que el login, con la misma forma de respuesta (429 con
 * `reintentar_en`, ver `password_reset_throttle_actual`), así que usa el mismo
 * composable. Se desestructura porque en la plantilla un ref anidado en un
 * objeto no se desenvuelve solo.
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
  }
]

function validate(state: ForgotState): FormError[] {
  const errors: FormError[] = []

  if (!state.email) {
    errors.push({ name: 'email', message: 'Ingresa tu correo electrónico' })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    errors.push({ name: 'email', message: 'El correo no tiene un formato válido' })
  }

  return errors
}

async function onSubmit(event: FormSubmitEvent<ForgotState>) {
  const { email } = event.data

  // `validate` ya garantiza que viene; esto solo satisface al tipo.
  if (!email) return

  loading.value = true

  try {
    // El mensaje es el del backend a propósito: es el mismo exista o no la
    // cuenta, y escribir aquí algo como «te enviamos un correo» sería afirmar
    // más de lo que se sabe (SEC-004).
    sentMessage.value = await forgotPassword(email)
    notify.success('Solicitud enviada', sentMessage.value)
  } catch (error) {
    noteRetry(error)
    notify.error(error, 'No se pudo enviar la solicitud')
  } finally {
    loading.value = false
  }
}

const submitLabel = computed(() => retrySubmitLabel('Enviarme el enlace'))
</script>

<template>
  <UPageCard>
    <UAuthForm
      :fields="fields"
      :validate="validate"
      :loading="loading"
      icon="i-lucide-key-round"
      title="Recuperar contraseña"
      description="Escribe tu correo y te enviamos un enlace para elegir una nueva."
      :submit="{ label: submitLabel, disabled: retryBlocked }"
      @submit="onSubmit"
    >
      <template #footer>
        <div class="space-y-3">
          <UAlert
            v-if="sentMessage"
            :description="sentMessage"
            icon="i-lucide-mail-check"
            color="success"
            variant="subtle"
            title="Revisa tu correo"
          />

          <!-- Apunta a `/login`: el inicio para quien todavía no ha entrado. -->
          <p class="text-sm text-center">
            <BaseAuthLink to="/login">
              Volver al inicio
            </BaseAuthLink>
          </p>
        </div>
      </template>
    </UAuthForm>
  </UPageCard>
</template>
