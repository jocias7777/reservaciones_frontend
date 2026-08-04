<script setup lang="ts">
import { es } from '@nuxt/ui/locale'

/**
 * Contenedor de la aplicación.
 *
 * La cabecera y el pie que estaban aquí se movieron intactos a
 * `layouts/default.vue`, que es el que sigue usando la portada de la plantilla.
 * El panel de administración usa `layouts/app.vue`, y el login `layouts/auth.vue`.
 */
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'es'
  }
})

const title = 'Nuxt Starter Template'
const description = 'A production-ready starter template powered by Nuxt UI. Build beautiful, accessible, and performant applications in minutes, not hours.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp :locale="es">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
