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
      'No. Eliminar es borrado lógico: el registro pasa a la papelera y se puede restaurar. «Eliminar permanente» y «Eliminar masivo permanente» existen como permisos en el catálogo de acciones, pero ninguna pantalla los usa hoy: nada en el frontend borra de verdad un registro de la base de datos.'
  },
  {
    label: 'No me aparece la pantalla de permisos de un rol o usuario',
    content:
      'Esas pantallas exigen el permiso «Asignar permisos» del módulo correspondiente (role_permissions o user_permissions), no «Listar». Revisa que ese permiso esté concedido.'
  },
  {
    label: '¿Los módulos y acciones nuevos restringen algo por sí solos?',
    content:
      'No. Son solo catálogo. Un módulo o una acción empieza a restringir de verdad hasta que alguna ruta del backend la comprueba con su propio código. En Módulos del sistema y en Acciones se ve marcado cuál todavía no tiene efecto.'
  },
  {
    label: 'Elimino un rol o una categoría: ¿qué pasa con lo que tenía dentro?',
    content:
      'Nada se pierde. Un rol en la papelera deja de darle permisos a sus usuarios mientras esté ahí, pero no se los quita de la cuenta; al restaurarlo, todos los vuelven a tener sin reasignar a nadie. Una categoría eliminada no borra sus acciones: pasan al bloque «Otras acciones» hasta que se les asigne otra.'
  },
  {
    label: '¿Por qué no puedo cambiar el código de una acción?',
    content:
      'Porque ese código es justo lo que compara el backend al proteger una ruta. En cuanto la acción está concedida en algún permiso, cambiarlo rompería esa comprobación — el backend lo rechaza con un error explicando por qué.'
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
