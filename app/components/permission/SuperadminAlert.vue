<script setup lang="ts">
/**
 * Aviso para el rol «superadmin».
 *
 * El backend lo deja pasar por el nombre del rol, antes de mirar permisos ni
 * excepciones (`require_permission` en `app/decorators.py`). Sin decirlo, estas
 * pantallas engañan: enseñan la matriz vacía y un «No puede» en cada acción para
 * alguien que en realidad entra a todo.
 */
const props = defineProps<{
  /** A quién se está mirando: el rol en sí o una persona que lo tiene. */
  scope: 'role' | 'user'
}>()
</script>

<template>
  <UAlert
    color="warning"
    variant="subtle"
    icon="i-lucide-shield-alert"
    :title="props.scope === 'role'
      ? 'Este rol entra a todo, marques lo que marques'
      : 'Este usuario entra a todo por su rol'"
    :description="props.scope === 'role'
      ? 'El backend deja pasar cualquier petición de «superadmin» sin mirar esta matriz. Lo que marques aquí se guarda, pero no cambia lo que puede hacer.'
      : 'Su rol es «superadmin» y el backend lo deja pasar sin comprobar permisos, así que las excepciones de esta pantalla no le afectan.'"
  />
</template>
