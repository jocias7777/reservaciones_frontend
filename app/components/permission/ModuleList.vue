<script setup lang="ts">
import type { Action, ActionCategory, PermissionModule } from '~/types'

/**
 * Lista de tarjetas de módulo de la matriz de permisos.
 *
 * La usan tal cual las dos pantallas que editan permisos —la del rol y la del
 * usuario—; lo único que cambia entre ellas es si se pasa `inherited`.
 */
const props = withDefaults(defineProps<{
  modules: PermissionModule[]
  actions: Action[]
  /** Categorías con las que se agrupan las acciones dentro de cada tarjeta. */
  categories?: ActionCategory[]
  /** Estado por módulo y acción: `{ [moduleId]: { [actionId]: boolean } }`. */
  values: Record<string, Record<string, boolean>>
  /** Solo en permisos de usuario: lo que concede su rol, para marcar excepciones. */
  inherited?: Record<string, Record<string, boolean>> | null
  disabled?: boolean
}>(), {
  categories: () => [],
  inherited: null,
  disabled: false
})

const emit = defineEmits<{
  toggle: [moduleId: string, actionId: string, value: boolean]
  toggleModule: [moduleId: string, value: boolean]
}>()
</script>

<template>
  <div class="space-y-4">
    <!--
      Todas plegadas de entrada: la lista de módulos se ve de un vistazo y se
      abre el que se venía a tocar. Cada cabecera lleva su recuento, que es lo
      que dice dónde mirar sin desplegar nada.
    -->
    <PermissionModuleCard
      v-for="module in props.modules"
      :key="module.id"
      :module="module"
      :actions="props.actions"
      :categories="props.categories"
      :values="props.values[module.id] ?? {}"
      :inherited="props.inherited?.[module.id] ?? null"
      :disabled="props.disabled"
      @toggle="(actionId, value) => emit('toggle', module.id, actionId, value)"
      @toggle-module="value => emit('toggleModule', module.id, value)"
    />
  </div>
</template>
