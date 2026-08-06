<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import type { CreatePermissionModulePayload } from '~/types'

/**
 * Alta de un módulo del sistema (tabla `sa_permissions`).
 *
 * El `code` es lo que compara el backend en `require_permission('<code>', ...)`,
 * así que se valida con el mismo formato que usan los módulos existentes.
 */
const props = withDefaults(defineProps<{
  /** Id del `<form>`: lo usa el botón de guardar, que vive en la cabecera. */
  id?: string
  /** Código con el que llega el formulario relleno (alta de un módulo que el backend ya exige). */
  code?: string
}>(), {
  id: 'module-form',
  code: ''
})

const emit = defineEmits<{ submit: [payload: CreatePermissionModulePayload] }>()

const state = reactive({
  code: props.code,
  name: '',
  description: ''
})

function validate(current: typeof state): FormError[] {
  const errors: FormError[] = []

  if (!current.code.trim()) {
    errors.push({ name: 'code', message: 'El código es obligatorio' })
  } else if (!/^[a-z][a-z0-9_]{2,99}$/.test(current.code.trim())) {
    errors.push({
      name: 'code',
      message: 'Solo minúsculas, números y guion bajo; empieza por letra (ej. «reservations»)'
    })
  }

  if (!current.name.trim()) {
    errors.push({ name: 'name', message: 'El nombre visible es obligatorio' })
  }

  return errors
}

function onSubmit() {
  emit('submit', {
    code: state.code.trim(),
    name: state.name.trim(),
    description: state.description.trim() || null
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
      title="Módulo"
      description="Un módulo es una zona del sistema sobre la que se conceden acciones."
    >
      <div class="space-y-4">
        <UFormField
          label="Código"
          name="code"
          required
          help="Identificador que comprueba el backend. El módulo solo tendrá efecto real cuando sus rutas se protejan con este código."
        >
          <UInput
            v-model="state.code"
            placeholder="reservations"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Nombre visible"
          name="name"
          required
        >
          <UInput
            v-model="state.name"
            placeholder="Reservaciones"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Descripción"
          name="description"
        >
          <UTextarea
            v-model="state.description"
            placeholder="Qué abarca este módulo"
            :rows="3"
            class="w-full"
          />
        </UFormField>
      </div>
    </UPageCard>
  </UForm>
</template>
