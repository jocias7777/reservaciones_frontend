<script setup lang="ts">
import type { Action, ActionCategory, OverrideState, PermissionModule } from '~/types'

/**
 * Lista de tarjetas de módulo de la pantalla de permisos de un usuario.
 *
 * El equivalente de `PermissionModuleList` para los roles: solo itera y propaga.
 */
const props = withDefaults(defineProps<{
  modules: PermissionModule[]
  actions: Action[]
  /** Categorías con las que se agrupan las acciones dentro de cada tarjeta. */
  categories?: ActionCategory[]
  /** Estado elegido: `{ [moduleId]: { [actionId]: OverrideState } }`. */
  states: Record<string, Record<string, OverrideState>>
  /** Lo que concede el rol: `{ [moduleId]: { [actionId]: boolean } }`. */
  inherited: Record<string, Record<string, boolean>>
  disabled?: boolean
}>(), {
  categories: () => [],
  disabled: false
})

const emit = defineEmits<{
  toggle: [moduleId: string, actionId: string, state: OverrideState]
  setModule: [moduleId: string, state: OverrideState]
}>()
</script>

<template>
  <div class="space-y-4">
    <UserPermissionModuleCard
      v-for="module in props.modules"
      :key="module.id"
      :module="module"
      :actions="props.actions"
      :categories="props.categories"
      :states="props.states[module.id] ?? {}"
      :inherited="props.inherited[module.id] ?? {}"
      :disabled="props.disabled"
      @toggle="(actionId, state) => emit('toggle', module.id, actionId, state)"
      @set-module="state => emit('setModule', module.id, state)"
    />
  </div>
</template>
