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

const contentRef = ref<HTMLElement | null>(null)

/**
 * Cada página de «Cómo funciona» es una ruta y un componente distintos, así
 * que este armazón se vuelve a montar en cada una: si se llega con scroll
 * (por ejemplo desde el icono del header estando abajo de otra pantalla), sin
 * esto la página se ve "pegada" porque el scroll no se resetea solo.
 *
 * En pantallas grandes el que hace scroll ya no es la ventana sino el panel
 * de contenido (ver el `<div>` de abajo), así que hay que resetear los dos:
 * la ventana para el layout de celular y el panel para el de escritorio.
 *
 * El reseteo se hace después de `nextTick` y del siguiente frame porque el
 * propio router puede tocar el scroll justo después de montar: si se hace
 * antes, esa segunda pisada deja la página donde estaba.
 */
onMounted(() => {
  nextTick(() => requestAnimationFrame(() => {
    window.scrollTo({ top: 0 })
    if (contentRef.value) contentRef.value.scrollTop = 0
  }))
})
</script>

<template>
  <!--
    Grid propio, sin pasar por `UPage`/`UPageAside`/`UPageBody`: son varias
    capas de componentes reenviándose clases entre sí y, aun con las clases
    correctas puestas, la barra seguía sin quedarse fija. Escrito a mano acá
    no queda ninguna duda de qué elemento tiene scroll y cuál no.

    En `lg` y superior no es la ventana la que hace scroll: el contenedor
    ocupa exactamente el alto que sobra bajo el header (`100vh` menos su
    altura) y no deja que nada se desborde de él. Adentro, la barra
    izquierda no tiene ninguna propiedad de scroll — por eso queda
    literalmente fija, nunca se mueve — y es el panel de la derecha el único
    que puede desplazarse. Por debajo de `lg` la barra está oculta y esto no
    aplica: la página entera vuelve a hacer scroll normal, como siempre.
  -->
  <div class="mx-auto max-w-(--ui-container) px-4 pt-6 pb-8 sm:px-6 lg:px-8 lg:h-[calc(100vh-var(--ui-header-height))] lg:overflow-hidden">
    <div class="lg:grid lg:grid-cols-10 lg:gap-10 lg:h-full">
      <!--
        Sin alto fijo propio: ocupa el de su celda del grid (`lg:h-full`), que
        ya alcanza de sobra para las 13 entradas. Sin overflow tampoco: al no
        tener scroll propio, la rueda del mouse encima de la barra nunca
        queda atrapada en ella — pasa de largo, pero ya no hay nada arriba
        que la reciba porque este panel no se mueve.
      -->
      <aside class="hidden lg:col-span-2 lg:block lg:h-full">
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

      <!--
        El scroll de este panel no debe verse: ni la barra clásica de Windows
        ni ninguna otra. Se oculta con `scrollbar-width: none` (Firefox) y
        `[&::-webkit-scrollbar]:hidden` (Chrome/Edge); el scroll en sí sigue
        funcionando igual con la rueda del mouse, el touch o el teclado —
        solo desaparece el dibujo de la barra.
      -->
      <div
        ref="contentRef"
        class="lg:col-span-8 lg:h-full lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
