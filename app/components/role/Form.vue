<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import type { Role } from '~/types'

/**
 * Formulario de rol. El backend exige `name` y `description` al crear y rechaza
 * cualquier campo que no sea uno de esos dos (`RoleSchema.validate_create`).
 */
const props = withDefaults(defineProps<{
  mode?: 'create' | 'edit'
  role?: Role | null
  loading?: boolean
}>(), {
  mode: 'create',
  role: null,
  loading: false
})

const emit = defineEmits<{ submit: [payload: { name: string, description: string }] }>()

const state = reactive({
  name: props.role?.name ?? '',
  description: props.role?.description ?? ''
})

watch(() => props.role, (role) => {
  state.name = role?.name ?? ''
  state.description = role?.description ?? ''
})

const isCreate = computed(() => props.mode === 'create')

function validate(current: typeof state): FormError[] {
  const errors: FormError[] = []

  if (!current.name.trim()) {
    errors.push({ name: 'name', message: 'El nombre del rol es obligatorio' })
  } else if (!/^[a-zA-Z0-9_\- ]{3,50}$/.test(current.name.trim())) {
    errors.push({ name: 'name', message: 'Usa entre 3 y 50 caracteres: letras, números, guiones o espacios' })
  }

  if (!current.description.trim()) {
    errors.push({ name: 'description', message: 'La descripción es obligatoria' })
  }

  return errors
}

function onSubmit() {
  emit('submit', {
    name: state.name.trim(),
    description: state.description.trim()
  })
}
</script>

<template>
  <UForm
    :state="state"
    :validate="validate"
    class="space-y-6"
    @submit="onSubmit"
  >
    <UPageCard
      title="Datos del rol"
      description="El nombre identifica al rol en el sistema; la descripción explica para qué sirve."
    >
      <div class="space-y-4">
        <UFormField
          label="Nombre"
          name="name"
          required
          help="Se usa como identificador, por ejemplo «recepcion» o «supervisor»."
        >
          <UInput
            v-model="state.name"
            placeholder="recepcion"
            icon="i-lucide-shield"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Descripción"
          name="description"
          required
        >
          <UTextarea
            v-model="state.description"
            placeholder="Qué puede hacer este rol dentro del sistema"
            :rows="3"
            class="w-full"
          />
        </UFormField>
      </div>
    </UPageCard>

    <div class="flex items-center justify-end gap-3">
      <slot name="secondary-action" />

      <UButton
        type="submit"
        :label="isCreate ? 'Crear rol' : 'Guardar cambios'"
        :icon="isCreate ? 'i-lucide-shield-plus' : 'i-lucide-save'"
        :loading="props.loading"
      />
    </div>
  </UForm>
</template>
