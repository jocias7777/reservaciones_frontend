<script setup lang="ts">
import type { HelpActionExample, HelpNextStep } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Qué hace cada acción · Cómo funciona' })

/**
 * Un bloque del glosario: varias acciones que hacen el mismo TIPO de cosa.
 *
 * Es una agrupación propia de esta página, no las categorías de
 * `sa_category_permissions` (esas las administra cada quien en /roles/categorias
 * y pueden no existir todavía). Aquí el orden es fijo porque el objetivo es
 * distinto: no organizar la matriz, sino que se lea de corrido de menor a mayor
 * consecuencia — ver antes que tocar, tocar antes que borrar.
 */
interface Group {
  title: string
  description: string
  items: HelpActionExample[]
}

/**
 * Las 17 acciones que ya siembra el sistema (`app/seeds.py::ACTIONS` del
 * backend), una por una, con el mismo escenario en todas —Ana, en el módulo
 * Usuarios— para poder comparar una acción con otra sin releer el contexto
 * cada vez.
 *
 * Si se agrega una acción nueva al catálogo, esto no se actualiza solo: hay que
 * añadir su entrada aquí a mano, con su propio ejemplo. Vale la pena: una fila
 * sin ejemplo concreto es exactamente el problema que esta página resuelve.
 */
const GROUPS: Group[] = [
  {
    title: 'Ver',
    description: 'Nada de esto cambia un dato. Deciden solo qué se puede mirar, y de qué forma.',
    items: [
      {
        code: 'read',
        label: 'Leer',
        icon: 'i-lucide-eye',
        what: 'Ver la ficha completa de un registro concreto.',
        on: 'Ana abre la ficha de Roberto y ve su correo, su rol, su teléfono y su dirección.',
        off: 'Ana intenta abrir la ficha de Roberto: el servidor responde con un error y no se muestra ni un dato.'
      },
      {
        code: 'list',
        label: 'Listar',
        icon: 'i-lucide-list',
        what: 'Ver el listado del módulo y buscar dentro de él.',
        on: 'Ana entra a «Usuarios» y ve la tabla completa, con buscador y filtros.',
        off: '«Usuarios» ni aparece en su menú; si escribe la dirección a mano, la pantalla la manda de vuelta.'
      },
      {
        code: 'select',
        label: 'Seleccionar',
        icon: 'i-lucide-list-checks',
        what: 'Elegirlo en los desplegables de un formulario, sin ver el listado completo.',
        on: 'Al crear un rol, el desplegable «Usuarios de este rol» muestra opciones para elegir.',
        off: 'Ese mismo desplegable aparece vacío, aunque existan cientos de usuarios en la base.'
      }
    ]
  },
  {
    title: 'Crear y modificar',
    description: 'Las que dan de alta o cambian datos. Cada una tiene su versión «por lote», para varios registros a la vez.',
    items: [
      {
        code: 'create',
        label: 'Crear',
        icon: 'i-lucide-plus',
        what: 'Dar de alta un registro nuevo.',
        on: 'El botón «Agregar usuario» aparece, y guardar el formulario funciona.',
        off: 'El botón «Agregar usuario» no se muestra en ningún lado de la pantalla.'
      },
      {
        code: 'bulk_create',
        label: 'Crear masivo',
        icon: 'i-lucide-plus',
        bulk: true,
        what: 'Dar de alta varios registros de una sola vez, por lote.',
        on: 'Ana sube un archivo con 50 usuarios y los 50 se crean juntos, en una sola operación.',
        off: 'No hay opción de alta por lote: cada usuario hay que crearlo uno por uno con «Crear».'
      },
      {
        code: 'update',
        label: 'Actualizar',
        icon: 'i-lucide-pencil',
        what: 'Modificar un registro existente.',
        on: 'Ana cambia el correo de Roberto en su ficha, y «Guardar cambios» funciona.',
        off: 'Ana ve la ficha de Roberto, pero los campos están bloqueados: no hay botón para guardar.'
      },
      {
        code: 'bulk_update',
        label: 'Actualizar masivo',
        icon: 'i-lucide-pencil',
        bulk: true,
        what: 'Modificar varios registros de una sola vez, por lote.',
        on: 'Ana selecciona 10 cuentas y les cambia el rol a todas juntas, de un solo golpe.',
        off: 'Solo puede cambiarlas una por una, y solo si además tiene «Actualizar».'
      }
    ]
  },
  {
    title: 'Eliminar y recuperar',
    description: 'Todo lo de aquí es reversible, salvo las dos marcadas: esas de verdad no tienen vuelta atrás.',
    items: [
      {
        code: 'delete',
        label: 'Eliminar',
        icon: 'i-lucide-trash-2',
        what: 'Enviar un registro a la papelera. Se puede recuperar después.',
        on: 'El icono de papelera aparece junto a Roberto: un clic y su cuenta pasa a «Papelera».',
        off: 'El icono de papelera no aparece junto a ningún usuario de la lista.'
      },
      {
        code: 'bulk_delete',
        label: 'Eliminar masivo',
        icon: 'i-lucide-trash-2',
        bulk: true,
        what: 'Enviar varios registros a la papelera de una sola vez.',
        on: 'Ana selecciona 5 cuentas inactivas y las manda todas a la papelera con un solo clic.',
        off: 'Tiene que mandarlas de una en una, y solo si además tiene «Eliminar».'
      },
      {
        code: 'restore',
        label: 'Restaurar',
        icon: 'i-lucide-archive-restore',
        what: 'Recuperar un registro que estaba en la papelera.',
        on: 'Ana encuentra a Roberto en la papelera, pulsa «Recuperar» y vuelve a estar activo.',
        off: 'Roberto se queda en la papelera para siempre: nadie con este permiso apagado puede traerlo de vuelta.'
      },
      {
        code: 'bulk_restore',
        label: 'Restaurar masivo',
        icon: 'i-lucide-archive-restore',
        bulk: true,
        what: 'Recuperar varios registros de la papelera de una sola vez.',
        on: 'Ana selecciona 8 cuentas de la papelera y las recupera todas juntas.',
        off: 'Tiene que recuperarlas de una en una, y solo si además tiene «Restaurar».'
      },
      {
        code: 'hard_delete',
        label: 'Eliminar permanente',
        icon: 'i-lucide-flame',
        warning: 'Acción irreversible',
        what: 'Borrar un registro de la base de datos. Ni la papelera lo guarda: no se puede deshacer.',
        on: 'Dentro de la papelera, Ana borra a Roberto para siempre. Ni la propia papelera lo recupera después.',
        off: 'Roberto se queda en la papelera de forma indefinida: nadie puede borrarlo del todo.'
      },
      {
        code: 'bulk_hard_delete',
        label: 'Eliminar masivo permanente',
        icon: 'i-lucide-flame',
        bulk: true,
        warning: 'Acción irreversible',
        what: 'Borrar varios registros para siempre, de una sola vez.',
        on: 'Ana vacía la papelera entera con un clic: esas cuentas desaparecen para siempre.',
        off: 'Solo puede borrarlas del todo una por una, y solo si además tiene «Eliminar permanente».'
      }
    ]
  },
  {
    title: 'Extra',
    description: 'No cambian ningún dato: solo sacan lo que ya existe fuera de la pantalla.',
    items: [
      {
        code: 'export',
        label: 'Exportar',
        icon: 'i-lucide-download',
        what: 'Descargar los datos del módulo a un archivo.',
        on: 'El botón «Exportar» aparece en la barra de herramientas y descarga la tabla completa.',
        off: 'El botón «Exportar» no aparece en ningún lado de la pantalla.'
      },
      {
        code: 'print',
        label: 'Imprimir',
        icon: 'i-lucide-printer',
        what: 'Generar una versión lista para imprimir, sin los botones de la interfaz.',
        on: 'Ana abre «Imprimir» y sale una versión limpia, lista para el papel.',
        off: 'No hay ninguna opción de imprimir en esa pantalla.'
      }
    ]
  },
  {
    title: 'Repartir permisos',
    description: 'Las únicas dos que no tocan datos del módulo: tocan quién puede tocar los datos de los demás módulos.',
    items: [
      {
        code: 'assign',
        label: 'Asignar permisos',
        icon: 'i-lucide-shield-check',
        what: 'Ver y editar la matriz de permisos de un rol o de un usuario.',
        on: 'Ana abre «Permisos por usuario», ve la matriz de alguien y marca o desmarca sus celdas.',
        off: '«Permisos por rol» y «Permisos por usuario» ni aparecen en su menú.'
      },
      {
        code: 'grant_any',
        label: 'Delegar sin límite',
        icon: 'i-lucide-infinity',
        warning: 'Concede autoridad sin límite',
        what: 'Conceder cualquier acción del catálogo, incluida una que uno mismo no tiene, y sobre cualquier rol o usuario.',
        on: 'Ana, sin tener «Eliminar permanente», puede dárselo de todos modos a otro rol.',
        off: 'Ana solo puede repartir las acciones que ella misma ya tiene concedidas — nunca de más.'
      }
    ]
  }
]

const SIGUIENTE: HelpNextStep[] = [
  {
    label: 'Acciones',
    description: 'Cómo se da de alta una acción nueva en el catálogo, y por qué hay una fila por cada módulo.',
    to: '/ayuda/acciones',
    icon: 'i-lucide-list-checks'
  },
  {
    label: 'Permisos por rol',
    description: 'Donde cada una de estas se convierte en el interruptor que se marca de verdad.',
    to: '/ayuda/permisos-por-rol',
    icon: 'i-lucide-shield-check'
  }
]
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Qué hace cada acción
    </h1>
    <p class="mt-3 text-muted">
      «Listar», «Crear», «Eliminar permanente»… son las mismas acciones que ya viste como interruptores en
      Permisos por rol y por usuario, pero aquí no importa cómo se marcan: importa qué cambia de verdad cuando
      están encendidas o apagadas. Cada una trae su ejemplo, no solo su nombre.
    </p>

    <HelpTakeaway
      :items="[
        'Cada acción es un interruptor de dos posiciones: **encendido** habilita algo puntual, **apagado** lo bloquea. Nunca a medias.',
        'Las que dicen **«Por lote»** hacen lo mismo que su versión singular, pero sobre varios registros a la vez.',
        'Dos llevan **aviso en rojo**: son las que pueden hacer más daño, o repartir más autoridad, que las demás.',
        'Esto es el catálogo de hoy. Si mañana se agrega una acción nueva, la explica quien la dé de alta — ver **Acciones**.'
      ]"
    />

    <template
      v-for="group in GROUPS"
      :key="group.title"
    >
      <h2 class="mt-10 text-lg font-semibold text-highlighted">
        {{ group.title }}
      </h2>
      <p class="mt-2 text-sm text-muted">
        {{ group.description }}
      </p>

      <div class="mt-4 space-y-4">
        <HelpActionGlossaryCard
          v-for="item in group.items"
          :key="item.code"
          :item="item"
        />
      </div>
    </template>

    <HelpNextSteps :links="SIGUIENTE" />
  </HelpDocsPage>
</template>
