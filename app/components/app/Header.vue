<script setup lang="ts">
const { items } = useAppNavigation()
const search = useAppSearch()

defineShortcuts({
  meta_k: () => search.open()
})
</script>

<template>
  <UHeader :ui="{ center: 'hidden lg:flex' }">
    <template #left>
      <!--
        A la raíz, no a una pantalla concreta: es el middleware quien sabe cuál
        es la primera que puede abrir cada quien. Fijar aquí `/usuarios` dejaba
        el logo llevando a un sitio prohibido a quien no tiene ese módulo.
      -->
      <NuxtLink
        to="/"
        aria-label="Inicio del panel"
      >
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
    </template>
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
      <UTooltip text="Cómo funciona">
        <UButton
          icon="i-lucide-book-open"
          color="neutral"
          variant="ghost"
          aria-label="Cómo funciona"
          to="/ayuda"
        />
      </UTooltip>

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
