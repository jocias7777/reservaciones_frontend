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
  // Las cuatro de permisos van juntas y antes que las pantallas sueltas: son el
  // tema por el que se abre esta guía, y leídas en este orden se explican unas a
  // otras (qué da un rol → qué se le excepciona a una persona → qué no puedes
  // repartir → quién se lo salta todo).
  { type: 'label', label: 'Permisos' },
  { label: 'Permisos por rol', to: '/ayuda/permisos-por-rol' },
  { label: 'Permisos por usuario', to: '/ayuda/permisos-por-usuario' },
  { label: 'Límites al dar permisos', to: '/ayuda/limites-al-dar-permisos' },
  { label: 'El superadmin', to: '/ayuda/superadmin' },
  { type: 'label', label: 'Pantallas' },
  { label: 'Usuarios', to: '/ayuda/usuarios' },
  { label: 'Roles', to: '/ayuda/roles' },
  { label: 'Módulos del sistema', to: '/ayuda/modulos-del-sistema' },
  // Va antes que «Acciones»: primero qué hace cada una en la práctica, después
  // cómo se administra el catálogo. Al revés se lee el «cómo» sin saber el «qué».
  { label: 'Qué hace cada acción', to: '/ayuda/glosario-de-acciones' },
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
    altura) y no deja que nada se desborde de él. Adentro, el panel de la
    derecha es el que se desplaza mientras se lee; la barra izquierda se
    queda quieta, y solo hace scroll en la ventana tan baja que el índice ya
    no cabe entero (ver su comentario). Por debajo de `lg` la barra está
    oculta y esto no aplica: la página entera vuelve a hacer scroll normal,
    como siempre.
  -->
  <div class="mx-auto max-w-(--ui-container) px-4 pt-6 pb-8 sm:px-6 lg:px-8 lg:h-[calc(100vh-var(--ui-header-height))] lg:overflow-hidden">
    <div class="lg:grid lg:grid-cols-10 lg:gap-10 lg:h-full">
      <!--
        Sin alto fijo propio: ocupa el de su celda del grid (`lg:h-full`). En una
        pantalla de altura normal el índice entero cabe ahí y la barra se queda
        literalmente fija, que es como debe verse.

        El `overflow-y-auto` es solo para la ventana baja donde ya no cabe: sin
        él, el contenedor de arriba (`lg:overflow-hidden`) recortaría las últimas
        entradas y no habría forma de llegar a ellas. Mientras quepa no cambia
        nada —un elemento que no se desborda no atrapa la rueda del mouse, la
        deja pasar igual—, y la barra en sí se oculta como en el panel de la
        derecha para no meter una segunda barra de scroll en la pantalla.
      -->
      <aside class="hidden lg:col-span-2 lg:block lg:h-full lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
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
