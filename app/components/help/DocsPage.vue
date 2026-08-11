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

/**
 * Cada página de «Cómo funciona» es una ruta y un componente distintos, así
 * que este armazón se vuelve a montar en cada una: si se llega con scroll
 * (por ejemplo desde el icono del header estando abajo de otra pantalla), sin
 * esto la página se ve "pegada" porque el scroll no se resetea solo.
 *
 * El reseteo se hace después de `nextTick` y del siguiente frame porque el
 * propio router puede tocar el scroll justo después de montar: si se hace
 * antes, esa segunda pisada deja la página donde estaba.
 */
onMounted(() => {
  nextTick(() => requestAnimationFrame(() => window.scrollTo({ top: 0 })))
})
</script>

<template>
  <!--
    Grid propio, sin pasar por `UPage`/`UPageAside`/`UPageBody`: son varias
    capas de componentes reenviándose clases entre sí y, aun con las clases
    correctas puestas, la barra seguía sin quedarse fija. Escrito a mano acá
    no queda ninguna duda de qué elemento tiene `sticky` y cuál se mueve.
  -->
  <div class="mx-auto max-w-(--ui-container) px-4 pt-6 pb-8 sm:px-6 lg:px-8">
    <div class="lg:grid lg:grid-cols-10 lg:gap-10">
      <!-- Alto fijo (pantalla menos header) para que siempre tenga sitio de sobra donde quedarse fija. -->
      <aside class="hidden lg:sticky lg:top-16 lg:col-span-2 lg:block lg:h-[calc(100vh-4rem)] lg:overflow-y-auto">
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          variant="link"
          color="primary"
          highlight
          :ui="{
            link: 'text-[15px] ps-5',
            label: 'text-[15px] font-semibold text-highlighted mt-6 first:mt-0'
          }"
        />
      </aside>

      <div class="lg:col-span-8">
        <slot />
      </div>
    </div>
  </div>
</template>
