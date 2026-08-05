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

    <!--
      `viewportWrapper` y `viewport` vienen con `w-full`, que es el ancho del
      disparador. Con un solo apartado ("Seguridad") el panel de 240px quedaba
      recortado por el `overflow-hidden` del visor, así que se dejan al ancho de
      su contenido.
    -->
    <UNavigationMenu
      :items="items"
      variant="link"
      color="neutral"
      content-orientation="vertical"
      :ui="{
        link: 'font-medium text-[15px]',
        viewportWrapper: 'w-auto',
        viewport: 'w-auto'
      }"
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
        color="neutral"
        :ui="{ link: 'font-medium text-[15px]' }"
        class="-mx-2.5"
      />
    </template>
  </UHeader>

  <AppSearchModal />
</template>
