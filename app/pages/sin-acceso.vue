<script setup lang="ts">
/**
 * Dónde acaba quien ha entrado bien pero no tiene permiso para ninguna pantalla.
 *
 * Es un caso normal, no una avería: la aplicación solo tiene, por ahora, las
 * pantallas de seguridad, y a esas no llega una cuenta corriente. Antes se caía
 * en el listado de usuarios y se veía una tabla vacía bajo un error rojo, que sí
 * parece una avería. Aquí se dice lo que pasa y a quién acudir.
 */
definePageMeta({
  layout: 'app'
})

const { user, logout } = useAuth()

useSeoMeta({
  title: 'Sin acceso'
})
</script>

<template>
  <UContainer class="py-10">
    <UEmpty
      icon="i-lucide-lock"
      title="No tienes acceso a ninguna pantalla"
      :description="user?.role
        ? `Tu cuenta entró correctamente, pero el rol «${user.role}» todavía no tiene permisos sobre ningún módulo. Pídeselos a quien administre el sistema.`
        : 'Tu cuenta entró correctamente, pero todavía no tiene un rol asignado. Pídeselo a quien administre el sistema.'"
      :actions="[{
        label: 'Cerrar sesión',
        icon: 'i-lucide-log-out',
        color: 'neutral',
        variant: 'outline',
        onClick: logout
      }]"
    />
  </UContainer>
</template>
