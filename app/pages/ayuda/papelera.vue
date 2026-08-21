<script setup lang="ts">
import type { HelpFlowStep, HelpNextStep } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Papelera y restaurar · Cómo funciona' })

/**
 * El viaje de un registro eliminado. Es el mismo registro en las tres cajas —no
 * una copia— y eso es justo lo que hay que ver: restaurar no vuelve a crear
 * nada.
 */
const VIAJE: HelpFlowStep[] = [
  {
    label: 'En el listado',
    detail: 'Carlos Ruiz · Recepción · activo',
    icon: 'i-lucide-list',
    tone: 'neutral'
  },
  {
    label: 'En la papelera',
    detail: 'Sigue ahí, con todos sus datos, fuera del listado',
    icon: 'i-lucide-archive',
    tone: 'warning',
    via: 'Eliminar'
  },
  {
    label: 'De vuelta en el listado',
    detail: 'El mismo registro, con su rol y su fecha de alta intactos',
    icon: 'i-lucide-archive-restore',
    tone: 'success',
    via: 'Restaurar'
  }
]

/**
 * Los dos permisos de recuperación, que se creen el mismo y no lo son.
 *
 * Se pone aparte que «Restaurar» es además lo que abre la papelera: es la causa
 * del «no me aparece el botón» más habitual, y no se deduce del nombre.
 */
const PERMISOS = [
  {
    icon: 'i-lucide-archive-restore',
    title: 'Restaurar',
    detail: 'Recupera un registro a la vez. Es además el permiso que hace falta para que aparezca el botón «Papelera» y para poder entrar en ella.',
    tone: 'primary' as const
  },
  {
    icon: 'i-lucide-layers',
    title: 'Restaurar masivo',
    detail: 'Recupera varios seleccionados de una vez. Es un permiso aparte: sin él la papelera se abre igual, pero el botón de restauración masiva no aparece.',
    tone: 'neutral' as const
  }
]

const SIGUIENTE: HelpNextStep[] = [
  {
    label: 'Permisos por rol',
    description: 'Dónde se conceden «Restaurar» y «Restaurar masivo» en cada módulo.',
    to: '/ayuda/permisos-por-rol',
    icon: 'i-lucide-shield-check'
  },
  {
    label: 'Preguntas frecuentes',
    description: 'Otras dudas sobre eliminar, restaurar y lo que se lleva por delante.',
    to: '/ayuda/preguntas-frecuentes',
    icon: 'i-lucide-circle-help'
  }
]
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Papelera y restaurar
    </h1>
    <p class="mt-3 text-muted">
      Eliminar en Usuarios, Roles, Acciones y Categorías no borra nada: el registro pasa a la papelera de su
      módulo y se puede recuperar desde ahí.
    </p>

    <HelpTakeaway
      :items="[
        'Eliminar es **reversible**: el registro sale del listado, pero sigue existiendo.',
        'Restaurar devuelve **el mismo registro**, con todos sus datos — no crea uno nuevo.',
        '**Restaurar** y **Restaurar masivo** son dos permisos distintos: se puede tener uno sin el otro.',
        'Sin el permiso «Restaurar» **ni siquiera aparece el botón** de la papelera.',
        'Cada módulo tiene **su propia** papelera, con su propio buscador.'
      ]"
    />

    <HelpMockupFrame
      title="Qué le pasa a un registro eliminado"
      caption="Es el mismo registro de principio a fin. Por eso restaurar un usuario le devuelve su rol, su perfil y su fecha de alta sin que nadie tenga que volver a escribirlos."
    >
      <HelpFlow :steps="VIAJE" />
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Los dos permisos de recuperación
    </h2>
    <p class="mt-2 text-sm text-muted">
      Se llaman parecido y hacen cosas distintas. Este es el motivo más común de «a mí no me sale ese botón»:
    </p>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <div
        v-for="permiso in PERMISOS"
        :key="permiso.title"
        class="rounded-lg border p-4"
        :class="permiso.tone === 'primary' ? 'border-primary/30 bg-primary/5' : 'border-default bg-default'"
      >
        <p class="flex items-center gap-2 font-medium text-highlighted">
          <UIcon
            :name="permiso.icon"
            class="size-4 shrink-0"
            :class="permiso.tone === 'primary' ? 'text-primary' : 'text-dimmed'"
          />
          {{ permiso.title }}
        </p>
        <p class="mt-2 text-sm text-muted">
          {{ permiso.detail }}
        </p>
      </div>
    </div>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Dónde está cada botón
    </h2>
    <p class="mt-2 text-sm text-muted">
      La papelera de cada módulo se abre desde su propio listado, y tiene las mismas columnas y el mismo buscador
      que él.
    </p>

    <HelpMockupFrame
      title="Del listado a la papelera"
      caption="Si no ves el botón «Papelera» en un listado, no es que ese módulo no la tenga: es que falta el permiso «Restaurar» de ese módulo en tu rol."
    >
      <div class="flex flex-wrap items-center gap-3">
        <UInput
          icon="i-lucide-search"
          placeholder="Buscar..."
          disabled
          class="max-w-56"
        />
        <div class="flex items-center gap-2">
          <HelpCalloutBadge :n="1" />
          <UButton
            icon="i-lucide-archive"
            label="Papelera"
            color="neutral"
            variant="subtle"
            size="sm"
          />
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-6 rounded-lg border border-default bg-default p-3">
        <p class="text-sm text-highlighted">
          Carlos Ruiz
        </p>
        <div class="ms-auto flex items-center gap-2">
          <HelpCalloutBadge :n="2" />
          <UButton
            icon="i-lucide-archive-restore"
            color="success"
            variant="ghost"
            size="sm"
          />
        </div>
      </div>

      <div class="mt-3 flex items-center gap-2">
        <HelpCalloutBadge :n="3" />
        <UButton
          icon="i-lucide-archive-restore"
          label="Restaurar masivo (2)"
          color="success"
          size="sm"
        />
      </div>

      <HelpCalloutLegend
        :items="[
          'El botón «Papelera», junto al buscador del listado — exige el permiso «Restaurar» de ese módulo',
          'Dentro de la papelera, restaurar un registro a la vez',
          'Restaurar varios seleccionados de una vez — permiso aparte, «Restaurar masivo»'
        ]"
      />
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Qué se lleva por delante eliminar
    </h2>
    <ul class="mt-3 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        <strong class="text-highlighted">Un rol en la papelera</strong> deja de darle permisos a sus usuarios,
        pero no se lo quita a nadie: al restaurarlo, todos lo recuperan sin reasignar.
      </li>
      <li>
        <strong class="text-highlighted">Una categoría eliminada</strong> no borra sus acciones: pasan al bloque
        «Otras acciones» hasta que se les asigne otra.
      </li>
      <li>
        <strong class="text-highlighted">Una acción en la papelera</strong> deja de conceder, aunque siga marcada
        en algún rol: la casilla sigue ahí, pero no autoriza nada hasta que se restaure.
      </li>
      <li>
        <strong class="text-highlighted">Una acción concedida en algún permiso no se puede eliminar</strong>:
        primero hay que quitarla de ahí. El aviso de confirmación lo recuerda antes de intentarlo.
      </li>
    </ul>

    <UAlert
      color="neutral"
      variant="subtle"
      icon="i-lucide-info"
      class="mt-8"
      title="«Eliminar permanente» no hace nada todavía"
      description="Existe como permiso en el catálogo de acciones y se puede conceder o revocar en la matriz, pero hoy ninguna pantalla lo usa: nada en la aplicación borra de verdad un registro. Todo lo que se elimina acaba en su papelera."
    />

    <HelpNextSteps :links="SIGUIENTE" />
  </HelpDocsPage>
</template>
