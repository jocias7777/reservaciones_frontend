<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

/**
 * Armazón de «Cómo funciona»: barra lateral fija con el índice + el
 * contenido de la página actual a la derecha, igual que una documentación de
 * verdad — cada entrada es una ruta propia (`/ayuda/usuarios`, `/ayuda/roles`...),
 * no un ancla dentro de una sola página larga. Sin íconos en la barra: solo
 * texto, con la actual resaltada por `UNavigationMenu`.
 */
type NavEntry = { type: 'label', label: string } | { type?: undefined, label: string, to: string }

const NAV_ENTRIES: NavEntry[] = [
  { type: 'label', label: 'Guía' },
  { label: 'Introducción', to: '/ayuda' },
  { type: 'label', label: 'Módulos' },
  { label: 'Usuarios', to: '/ayuda/usuarios' },
  { label: 'Roles', to: '/ayuda/roles' },
  { label: 'Permisos por rol', to: '/ayuda/permisos-por-rol' },
  { label: 'Permisos por usuario', to: '/ayuda/permisos-por-usuario' },
  { label: 'Módulos del sistema', to: '/ayuda/modulos-del-sistema' },
  { label: 'Acciones', to: '/ayuda/acciones' },
  { label: 'Categorías de acciones', to: '/ayuda/categorias' },
  { type: 'label', label: 'Referencia' },
  { label: 'Papelera y restaurar', to: '/ayuda/papelera' },
  { label: 'Preguntas frecuentes', to: '/ayuda/preguntas-frecuentes' }
]

const route = useRoute()

/**
 * El color "activo" ya lo pone `highlight` por su cuenta; lo que hacía falta
 * era el resto de los enlaces — con el gris apagado de por defecto cuesta
 * leerlos. Solo se le sube el contraste a los que NO son la página actual:
 * tocarlo también en el activo pisaría el color con el que se resalta.
 */
const items = computed<NavigationMenuItem[]>(() =>
  NAV_ENTRIES.map((entry) => {
    if (entry.type === 'label') return entry
    return entry.to === route.path ? entry : { ...entry, class: 'text-toned' }
  })
)
</script>

<template>
  <!-- Mismo `py-6` que usan las demás pantallas (Usuarios, Roles...) bajo el header. -->
  <UContainer class="pt-6 pb-8">
    <UPage>
      <template #left>
        <!-- `UPageAside` trae `py-8` de fábrica; se deja en 0 porque el espacio ya lo pone el contenedor. -->
        <UPageAside class="pt-0">
          <UNavigationMenu
            :items="items"
            orientation="vertical"
            variant="link"
            color="primary"
            highlight
            :ui="{
              link: 'text-[15px]',
              label: 'text-[15px] font-semibold text-highlighted'
            }"
          />
        </UPageAside>
      </template>

      <!-- `UPageBody` trae `mt-8` de fábrica; mismo motivo. -->
      <UPageBody class="mt-0">
        <slot />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
