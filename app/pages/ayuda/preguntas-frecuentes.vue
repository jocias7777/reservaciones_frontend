<script setup lang="ts">
import type { AccordionItem } from '@nuxt/ui'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Preguntas frecuentes · Cómo funciona' })

/**
 * Las dudas van agrupadas por el momento en que aparecen, no en una lista
 * corrida.
 *
 * Con una sola lista larga hay que abrir preguntas al azar hasta dar con la
 * propia; agrupadas, se va directo al bloque —«no me deja guardar», «no me
 * aparece un botón»— que es como la gente describe el problema antes de saber
 * de qué va.
 */
interface Bloque {
  title: string
  icon: string
  items: AccordionItem[]
}

const BLOQUES: Bloque[] = [
  {
    title: 'No puedo hacer algo que creía poder',
    icon: 'i-lucide-circle-slash',
    items: [
      {
        label: 'Cambié un permiso y la persona sigue sin poder',
        content:
          'Los permisos se calculan una vez por sesión. Al guardar se recalculan al instante para quien los edita, pero otra persona con la sesión ya abierta los verá al recargar la página o al volver a iniciar sesión. Si tras recargar sigue igual, revisa que no tenga una excepción propia: una excepción le gana al rol.'
      },
      {
        label: 'Le di el permiso en el rol, pero no lo tiene',
        content:
          'Casi siempre es una de tres: tiene una excepción «Bloquear» en Permisos por usuario; su rol está en la papelera (y entonces no le concede nada aunque lo tenga asignado); o la acción o el módulo que marcaste están en la papelera, y una acción eliminada no autoriza aunque la casilla siga marcada.'
      },
      {
        label: 'No me aparece la pantalla de permisos de un rol o de un usuario',
        content:
          'Esas dos pantallas exigen el permiso «Asignar permisos» del módulo correspondiente (role_permissions o user_permissions), no «Listar». Es a propósito: así se puede dejar administrar la matriz sin dar acceso a la búsqueda avanzada sobre la tabla de asignaciones.'
      },
      {
        label: 'No me sale el botón de la papelera en un módulo',
        content:
          'Hace falta el permiso «Restaurar» de ese módulo, no «Listar». Y si entras a la papelera pero no ves el botón de restaurar varios seleccionados, lo que falta es «Restaurar masivo», que es un permiso aparte.'
      },
      {
        label: 'El desplegable de un formulario me sale vacío',
        content:
          'Suele faltar la acción «Seleccionar» del módulo que alimenta ese desplegable. «Leer» no basta: «Leer» es la ficha de un registro concreto y «Listar» es el listado completo, mientras que «Seleccionar» es justo la que deja elegir en un formulario sin ver nada más.'
      }
    ]
  },
  {
    title: 'No me deja guardar permisos',
    icon: 'i-lucide-shield-alert',
    items: [
      {
        label: '«No puedes conceder una acción que no tienes efectivamente…»',
        content:
          'Solo puedes repartir lo que tú mismo puedes hacer. El aviso nombra exactamente las acciones que sobraban: desmárcalas y vuelve a guardar, o pide que primero te las concedan a ti. Está explicado en «Límites al dar permisos».'
      },
      {
        label: '«No puedes modificar los permisos de tu propio rol»',
        content:
          'No puedes tocar el rol que tú llevas puesto, ni para dar ni para quitar. Te lo tiene que cambiar otra persona con permiso para hacerlo, o un superadmin.'
      },
      {
        label: '«El rol superadmin no se puede modificar desde aquí»',
        content:
          'Ese rol y quien lo tenga están fuera del alcance de las pantallas de permisos: es lo que impide que alguien se ascienda solo aprovechando que administra los permisos de los demás. Ver «El superadmin».'
      },
      {
        label: '¿Se guardó la mitad de lo que toqué?',
        content:
          'No. Cada guardado entra entero o no entra nada: si algo falla, el rol o el usuario se quedan exactamente como estaban. Puedes corregir y volver a intentarlo sin miedo a haber dejado algo a medias.'
      }
    ]
  },
  {
    title: 'Roles, usuarios y excepciones',
    icon: 'i-lucide-users',
    items: [
      {
        label: '¿Cuándo uso un rol y cuándo una excepción por usuario?',
        content:
          'Un rol, siempre que el permiso corresponda al puesto: se configura una vez y lo hereda todo el que lo tenga. Una excepción, solo para el caso puntual de una persona concreta. Si acabas poniéndoles las mismas excepciones a varias personas, lo que necesitas es un rol nuevo.'
      },
      {
        label: '¿«Hereda» quiere decir que sí puede?',
        content:
          'No. «Hereda» quiere decir «lo que diga su rol», que puede ser un no. Es el estado normal de todas las acciones de todo el mundo: significa que no hay ninguna excepción de por medio.'
      },
      {
        label: 'Si cambio los permisos de un rol, ¿afecta a quien ya lo tenía?',
        content:
          'Sí, a todos y al instante. Un usuario no guarda una copia de los permisos del día en que se lo asignaron: lee lo que el rol tenga configurado en cada momento.'
      },
      {
        label: 'Elimino un rol: ¿qué pasa con sus usuarios?',
        content:
          'Lo conservan asignado, pero mientras el rol esté en la papelera no les concede nada: es como si no tuvieran rol. Al restaurarlo lo recuperan todos de una vez, sin reasignar a nadie.'
      },
      {
        label: '¿Puedo dejar a alguien sin rol?',
        content:
          'Sí, «Sin rol asignado» es una opción explícita. Esa persona entra al sistema pero no hereda nada: lo único que le daría permisos serían sus propias excepciones. Funciona, pero es más difícil de mantener que darle un rol.'
      }
    ]
  },
  {
    title: 'Catálogo: módulos, acciones y categorías',
    icon: 'i-lucide-boxes',
    items: [
      {
        label: '¿Un módulo o una acción nuevos restringen algo por sí solos?',
        content:
          'No. Son solo catálogo. Empiezan a restringir de verdad cuando existe la parte del sistema que los comprueba. En «Módulos del sistema» y en «Acciones» se marca cuáles todavía no tienen efecto.'
      },
      {
        label: '¿Por qué no puedo cambiar el código de una acción?',
        content:
          'Porque ese código es justo lo que se compara al proteger cada operación. En cuanto la acción está concedida en algún permiso, cambiarlo dejaría esa comprobación mirando un código que ya no existe, así que se bloquea con un aviso explicando por qué.'
      },
      {
        label: 'Elimino una categoría: ¿pierdo sus acciones?',
        content:
          'No. Las acciones que agrupaba pasan al bloque «Otras acciones», al final de la tarjeta, hasta que se les asigne otra categoría. Nadie pierde ningún permiso por eso.'
      },
      {
        label: '¿Eliminar y eliminar permanente son lo mismo?',
        content:
          'No. Eliminar es borrado lógico: el registro pasa a la papelera y se puede restaurar. «Eliminar permanente» y «Eliminar masivo permanente» existen como permisos en el catálogo, pero hoy ninguna pantalla los usa: nada en la aplicación borra de verdad un registro.'
      },
      {
        label: '¿Restaurar y Restaurar masivo son el mismo permiso?',
        content:
          'No, son independientes. «Restaurar» controla el botón para recuperar un registro a la vez —y además es el que deja entrar a la papelera—; «Restaurar masivo» controla el de recuperar varios seleccionados. Se puede tener uno sin el otro.'
      }
    ]
  }
]
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Preguntas frecuentes
    </h1>
    <p class="mt-3 text-muted">
      Las dudas que más se repiten, agrupadas por el momento en que aparecen. Si buscas la explicación completa de
      cómo se decide todo, está en la
      <NuxtLink
        to="/ayuda"
        class="text-primary underline"
      >introducción</NuxtLink>.
    </p>

    <section
      v-for="bloque in BLOQUES"
      :key="bloque.title"
      class="mt-10"
    >
      <h2 class="flex items-center gap-2 text-lg font-semibold text-highlighted">
        <UIcon
          :name="bloque.icon"
          class="size-5 shrink-0 text-dimmed"
        />
        {{ bloque.title }}
      </h2>

      <UAccordion
        :items="bloque.items"
        class="mt-3"
      />
    </section>
  </HelpDocsPage>
</template>
