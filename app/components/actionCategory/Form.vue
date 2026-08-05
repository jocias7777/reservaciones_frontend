<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import type { ActionCategory, CreateActionCategoryPayload } from '~/types'

/**
 * Alta y edición de una categoría de acciones (tabla `sa_category_permissions`).
 *
 * Los cuatro campos son exactamente lo que se ve en la matriz de permisos: el
 * nombre es el título del bloque, la descripción su subtítulo, el icono el que
 * lo acompaña y el orden la posición en la que aparece.
 */
const props = withDefaults(defineProps<{
  /** Id del `<form>`: lo usa el botón de guardar, que vive en la cabecera. */
  id?: string
  category?: ActionCategory | null
}>(), {
  id: 'action-category-form',
  category: null
})

const emit = defineEmits<{ submit: [payload: CreateActionCategoryPayload] }>()

/**
 * Iconos propuestos. No es una restricción: el campo acepta cualquier nombre de
 * la colección Lucide, que se resuelve en tiempo de ejecución (`@iconify-json/lucide`
 * está instalado). Estos son solo los que encajan con lo que suele hacer un
 * bloque de acciones, para no tener que buscarlos.
 */
const SUGGESTED_ICONS = [
  'i-lucide-eye',
  'i-lucide-pencil',
  'i-lucide-trash-2',
  'i-lucide-shapes',
  'i-lucide-search',
  'i-lucide-download',
  'i-lucide-upload',
  'i-lucide-printer',
  'i-lucide-plus',
  'i-lucide-refresh-cw',
  'i-lucide-archive',
  'i-lucide-ban',
  'i-lucide-lock',
  'i-lucide-send',
  'i-lucide-check-check',
  'i-lucide-settings',
  'i-lucide-file-text',
  'i-lucide-calendar'
]

const state = reactive({
  name: props.category?.name ?? '',
  description: props.category?.description ?? '',
  icon: props.category?.icon ?? '',
  // Al crear se deja vacío: el backend coloca la categoría al final.
  sortOrder: props.category?.sort_order ?? undefined as number | undefined
})

watch(() => props.category, (category) => {
  state.name = category?.name ?? ''
  state.description = category?.description ?? ''
  state.icon = category?.icon ?? ''
  state.sortOrder = category?.sort_order ?? undefined
})

/** Lista del selector: las sugerencias más el icono ya guardado, si no estaba. */
const iconItems = computed(() => {
  const current = state.icon.trim()
  const all = current && !SUGGESTED_ICONS.includes(current)
    ? [current, ...SUGGESTED_ICONS]
    : SUGGESTED_ICONS

  return all.map(icon => ({ label: icon, value: icon, icon }))
})

/** Lo que se verá en la matriz: el icono elegido o el neutro por defecto. */
const previewIcon = computed(() => state.icon.trim() || DEFAULT_CATEGORY_ICON)

function validate(current: typeof state): FormError[] {
  const errors: FormError[] = []

  if (!current.name.trim()) {
    errors.push({ name: 'name', message: 'El nombre es obligatorio' })
  } else if (current.name.trim().length > 100) {
    errors.push({ name: 'name', message: 'Como máximo 100 caracteres' })
  }

  if (!current.description.trim()) {
    errors.push({ name: 'description', message: 'La descripción es obligatoria: se muestra bajo el título del bloque' })
  }

  // Mismo formato que valida el backend en `ActionCategorySchema`.
  if (current.icon.trim() && !/^i-[a-z0-9]+(-[a-z0-9]+)+$/.test(current.icon.trim())) {
    errors.push({ name: 'icon', message: 'Usa el formato «i-lucide-nombre», por ejemplo «i-lucide-eye»' })
  }

  if (current.sortOrder !== undefined && (!Number.isInteger(current.sortOrder) || current.sortOrder < 0)) {
    errors.push({ name: 'sortOrder', message: 'El orden debe ser un número entero de 0 en adelante' })
  }

  return errors
}

function onSubmit() {
  emit('submit', {
    name: state.name.trim(),
    description: state.description.trim() || null,
    icon: state.icon.trim() || null,
    // Se omite al crear sin valor: así el backend lo coloca al final en vez de
    // mandarlo al principio con un 0.
    ...(state.sortOrder === undefined ? {} : { sort_order: state.sortOrder })
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
      title="Categoría"
      description="Agrupa las acciones dentro de la tarjeta de cada módulo, para que la lista se lea por bloques."
    >
      <div class="space-y-4">
        <UFormField
          label="Nombre"
          name="name"
          required
          help="Es el título del bloque. Por ejemplo «Consulta»."
        >
          <UInput
            v-model="state.name"
            placeholder="Consulta"
            icon="i-lucide-shapes"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Descripción"
          name="description"
          required
          help="La línea que acompaña al título. Por ejemplo «Ver y extraer información»."
        >
          <UTextarea
            v-model="state.description"
            placeholder="Ver y extraer información"
            :rows="2"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Icono"
          name="icon"
          help="Elige uno de la lista o escribe cualquier nombre de Lucide. Si lo dejas vacío se usa uno neutro."
        >
          <USelectMenu
            v-model="state.icon"
            :items="iconItems"
            value-key="value"
            :icon="previewIcon"
            create-item
            placeholder="i-lucide-eye"
            class="w-full"
            @create="(value: string) => (state.icon = value)"
          />
        </UFormField>

        <UFormField
          label="Orden"
          name="sortOrder"
          :help="props.category
            ? 'Posición del bloque en la matriz de permisos: el número más bajo se muestra primero.'
            : 'Si lo dejas vacío, la categoría se coloca al final.'"
        >
          <UInputNumber
            v-model="state.sortOrder"
            :min="0"
            :step="1"
            placeholder="Al final"
            class="w-full"
          />
        </UFormField>
      </div>
    </UPageCard>

    <!-- Vista previa: cómo se leerá la cabecera del bloque en la matriz -->
    <UPageCard
      title="Vista previa"
      description="Así se verá la cabecera de este bloque en los permisos de cada rol."
    >
      <div class="flex items-center gap-2">
        <UIcon
          :name="previewIcon"
          class="size-4 text-dimmed"
        />
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">
            {{ state.name.trim() || 'Nombre de la categoría' }}
          </p>
          <p class="text-xs text-dimmed">
            {{ state.description.trim() || 'Descripción de la categoría' }}
          </p>
        </div>
      </div>
    </UPageCard>
  </UForm>
</template>
