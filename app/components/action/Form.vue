<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import type { Action, ActionCategory, CreateActionPayload, PermissionModule } from '~/types'

/**
 * Alta y edición de una acción (tabla `sa_actions`).
 *
 * Una acción pertenece a un módulo: `users.create` y `roles.create` son dos
 * permisos distintos aunque compartan código. Por eso el módulo se elige al
 * crear y NO se puede cambiar después: moverla de sitio le cambiaría el
 * significado de golpe a todo lo que ya se concedió con ella.
 *
 * El `code` es lo que compara el backend en `require_permission(modulo, '<code>')`,
 * así que se valida con el mismo formato que los módulos. Cambiarlo cuando la
 * acción ya está concedida rompería esa comprobación, y el backend lo rechaza
 * con un 409 explicando por qué; aquí solo se avisa en la ayuda del campo.
 */
const props = withDefaults(defineProps<{
  /** Id del `<form>`: lo usa el botón de guardar, que vive en la cabecera. */
  id?: string
  action?: Action | null
  categories?: ActionCategory[]
  /** Módulos entre los que elegir al crear. Al editar no se usa. */
  modules?: PermissionModule[]
}>(), {
  id: 'action-form',
  action: null,
  categories: () => [],
  modules: () => []
})

/** Al editar, el módulo ya está decidido y solo se muestra. */
const isEdit = computed(() => Boolean(props.action))

const emit = defineEmits<{ submit: [payload: CreateActionPayload] }>()

const state = reactive({
  code: props.action?.code ?? '',
  name: props.action?.name ?? '',
  description: props.action?.description ?? '',
  category_id: props.action?.category_id ?? undefined as string | undefined,
  permission_id: props.action?.permission_id ?? undefined as string | undefined
})

watch(() => props.action, (action) => {
  state.code = action?.code ?? ''
  state.name = action?.name ?? ''
  state.description = action?.description ?? ''
  state.category_id = action?.category_id ?? undefined
  state.permission_id = action?.permission_id ?? undefined
})

const moduleOptions = computed(() =>
  props.modules.map(module => ({
    label: module.name,
    value: module.id,
    description: module.code,
    icon: moduleIcon(module)
  }))
)

/** Al editar, el módulo ya no se elige, pero conviene seguir viendo cuál es. */
const currentModule = computed(() =>
  props.modules.find(module => module.id === props.action?.permission_id) ?? null
)

const categoryOptions = computed(() =>
  sortCategories(props.categories).map(category => ({
    label: category.name,
    value: category.id,
    description: category.description ?? undefined,
    icon: categoryIcon(category)
  }))
)

function validate(current: typeof state): FormError[] {
  const errors: FormError[] = []

  if (!current.code.trim()) {
    errors.push({ name: 'code', message: 'El código es obligatorio' })
  } else if (!/^[a-z][a-z0-9_]{2,99}$/.test(current.code.trim())) {
    errors.push({
      name: 'code',
      message: 'Solo minúsculas, números y guion bajo; empieza por letra (ej. «bulk_update»)'
    })
  }

  if (!current.name.trim()) {
    errors.push({ name: 'name', message: 'El nombre visible es obligatorio' })
  }

  if (!current.category_id) {
    errors.push({ name: 'category_id', message: 'Elige en qué bloque aparecerá la acción' })
  }

  if (!isEdit.value && !current.permission_id) {
    errors.push({ name: 'permission_id', message: 'Elige a qué módulo pertenece la acción' })
  }

  return errors
}

function onSubmit() {
  emit('submit', {
    code: state.code.trim(),
    name: state.name.trim(),
    description: state.description.trim() || null,
    category_id: state.category_id ?? null,
    permission_id: state.permission_id ?? ''
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
      title="Acción"
      description="Una acción es algo que se puede permitir o negar sobre un módulo."
    >
      <div class="space-y-4">
        <UFormField
          v-if="!isEdit"
          label="Módulo"
          name="permission_id"
          required
          help="A qué zona del sistema pertenece. No se puede cambiar después: movería de significado todo lo que ya se hubiera concedido con esta acción."
        >
          <USelectMenu
            v-model="state.permission_id"
            :items="moduleOptions"
            value-key="value"
            placeholder="Elige un módulo"
            class="w-full"
          />
        </UFormField>

        <!--
          Al editar, el módulo ya no se puede tocar, pero se sigue mostrando:
          sin esto, dos acciones con el mismo código en módulos distintos serían
          indistinguibles en esta pantalla.
        -->
        <UFormField
          v-else
          label="Módulo"
          help="No se puede cambiar: movería de significado todo lo que ya se hubiera concedido con esta acción."
        >
          <div class="flex items-center gap-2 rounded-md border border-default bg-elevated/50 px-3 py-2">
            <UIcon
              :name="currentModule ? moduleIcon(currentModule) : 'i-lucide-box'"
              class="size-4 text-dimmed"
            />
            <span class="text-sm text-highlighted">{{ currentModule?.name ?? 'Módulo desconocido' }}</span>
            <span
              v-if="currentModule"
              class="text-xs text-dimmed"
            >{{ currentModule.code }}</span>
          </div>
        </UFormField>

        <UFormField
          label="Código"
          name="code"
          required
          help="Identificador que comprueba el backend. La acción solo restringirá algo cuando sus rutas se protejan con este código, y deja de poder cambiarse en cuanto esté concedida en algún permiso."
        >
          <UInput
            v-model="state.code"
            placeholder="bulk_update"
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
            placeholder="Actualización masiva"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Categoría"
          name="category_id"
          required
          help="El bloque en el que aparecerá dentro de la tarjeta de cada módulo."
        >
          <USelectMenu
            v-model="state.category_id"
            :items="categoryOptions"
            value-key="value"
            placeholder="Elige una categoría"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Descripción"
          name="description"
          help="Se muestra como ayuda junto al interruptor de la acción."
        >
          <UTextarea
            v-model="state.description"
            placeholder="Modificar varios registros a la vez"
            :rows="3"
            class="w-full"
          />
        </UFormField>
      </div>
    </UPageCard>
  </UForm>
</template>
