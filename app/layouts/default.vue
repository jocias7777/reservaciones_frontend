<script setup lang="ts">
/**
 * Layout de la plantilla original (Nuxt UI Starter).
 *
 * Se conserva tal cual estaba en `app.vue` para que su portada siga viéndose
 * igual; ahora vive en `pages/plantilla.vue`, porque la raíz del sitio es la
 * entrada al panel. Las pantallas del panel usan el layout `app`.
 */
</script>

<template>
  <div>
    <UHeader>
      <template #left>
        <!-- Al inicio de la propia plantilla: la raíz del sitio es el panel. -->
        <NuxtLink to="/plantilla">
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>

        <TemplateMenu />
      </template>

      <template #right>
        <UColorModeButton />

        <UButton
          to="https://github.com/nuxt-ui-templates/starter"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <USeparator icon="i-simple-icons-nuxtdotjs" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Built with Nuxt UI • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/nuxt-ui-templates/starter"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </div>
</template>
