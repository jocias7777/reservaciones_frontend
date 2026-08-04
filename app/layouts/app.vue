<script setup lang="ts">
/**
 * Layout del panel de administración: cabecera fija con los módulos centrados y
 * el contenido de la página debajo.
 */
const { user, fetchMe, isAuthenticated } = useAuth()

// Tras recargar la página los tokens siguen en las cookies pero el usuario no
// está en memoria: se recupera de `/auth/me`.
onMounted(async () => {
  if (isAuthenticated.value && !user.value) {
    try {
      await fetchMe()
    } catch {
      // Si el token ya no sirve, el cliente HTTP se encarga de mandar al login.
    }
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <UMain class="flex-1">
      <slot />
    </UMain>
  </div>
</template>
