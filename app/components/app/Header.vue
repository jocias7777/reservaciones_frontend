<script setup lang="ts">
/**
 * Cabecera del panel: logo a la izquierda, los módulos centrados y las acciones
 * de la sesión a la derecha (buscador, tema y usuario).
 *
 * El slot por defecto de `UHeader` es la zona central; en pantallas pequeñas se
 * oculta y su contenido pasa al menú desplegable (`#body`).
 */
const { items } = useAppNavigation()
const search = useAppSearch()

// El buscador también se abre con ⌘K / Ctrl+K.
defineShortcuts({
  meta_k: () => search.open()
})
</script>

<template>
  <UHeader :ui="{ center: 'hidden lg:flex' }">
    <template #left>
      <NuxtLink
        to="/usuarios"
        aria-label="Inicio del panel"
      >
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
      color="primary"
      :ui="{ link: 'font-medium' }"
    />

    <template #right>
      <UTooltip
        text="Buscar"
        :kbds="['meta', 'K']"
      >
        <UButton
          icon="i-lucide-search"
          color="neutral"
          variant="ghost"
          aria-label="Buscar"
          @click="search.open()"
        />
      </UTooltip>

      <UColorModeButton />

      <AppUserMenu />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        variant="link"
        color="primary"
        class="-mx-2.5"
      />
    </template>
  </UHeader>

  <AppSearchModal />
</template>
