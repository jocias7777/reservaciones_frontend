<script setup lang="ts">
import type { AccordionItem } from '@nuxt/ui'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Preguntas frecuentes · Cómo funciona' })

const items: AccordionItem[] = [
  {
    label: 'Cambié un permiso y no se refleja de inmediato',
    content:
      'Los permisos se calculan una vez por sesión. Guardar en Permisos por rol o Permisos por usuario los recalcula al instante para quien los edita, pero otra persona con sesión abierta los ve al recargar o volver a iniciar sesión.'
  },
  {
    label: '¿Restaurar y Restaurar masivo son el mismo permiso?',
    content:
      'No. Son dos permisos independientes. «Restaurar» controla el botón para recuperar un registro a la vez; «Restaurar masivo» controla el botón para recuperar varios seleccionados. Se puede tener uno sin el otro.'
  },
  {
    label: '¿Eliminar y eliminar permanente son lo mismo?',
    content:
      'No. Eliminar es borrado lógico: el registro pasa a la papelera y se puede restaurar. Eliminar permanente la vacía de verdad, sin vuelta atrás.'
  },
  {
    label: 'No me aparece la pantalla de permisos de un rol o usuario',
    content:
      'Esas pantallas exigen el permiso «Asignar permisos» del módulo correspondiente (role_permissions o user_permissions), no «Listar». Revisa que ese permiso esté concedido.'
  },
  {
    label: '¿Los módulos y acciones nuevos restringen algo por sí solos?',
    content:
      'No. Son solo catálogo. Un módulo o una acción empieza a restringir de verdad hasta que alguna ruta del backend la comprueba con su propio código.'
  }
]
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Preguntas frecuentes
    </h1>
    <p class="mt-3 text-muted">
      Dudas comunes sobre permisos, papelera y restauración.
    </p>

    <UAccordion
      :items="items"
      class="mt-6"
    />
  </HelpDocsPage>
</template>
