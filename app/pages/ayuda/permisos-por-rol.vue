<script setup lang="ts">
import type { HelpNextStep } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Permisos por rol · Cómo funciona' })

/**
 * Las acciones que se confunden entre sí, con la diferencia dicha en una línea.
 *
 * No es el catálogo completo —ese está en la propia pantalla, en el tooltip de
 * cada interruptor— sino solo los pares que se parecen tanto que se marcan mal:
 * conceder «Leer» esperando que la persona vea el listado, o «Restaurar»
 * esperando que pueda recuperar varios a la vez.
 */
const CONFUSIONES = [
  {
    icon: 'i-lucide-eye',
    pair: 'Leer · Listar · Seleccionar',
    detail: 'Son tres permisos distintos, no niveles del mismo. «Leer» abre la ficha de un registro concreto; «Listar» abre el listado del módulo y su buscador; «Seleccionar» solo deja elegirlo en el desplegable de un formulario. Un formulario con un desplegable vacío suele ser esto: falta «Seleccionar».'
  },
  {
    icon: 'i-lucide-trash-2',
    pair: 'Eliminar · Eliminar permanente',
    detail: '«Eliminar» manda a la papelera y se puede deshacer. «Eliminar permanente» borraría de verdad, y hoy ninguna pantalla lo usa: se puede marcar, pero no hay nada que lo dispare.'
  },
  {
    icon: 'i-lucide-undo-2',
    pair: 'Restaurar · Restaurar masivo',
    detail: 'Independientes. «Restaurar» es el botón de una fila; «Restaurar masivo» es el de varios seleccionados. Se puede tener uno sin el otro, y hace falta «Restaurar» hasta para entrar a la papelera.'
  },
  {
    icon: 'i-lucide-shield-check',
    pair: 'Asignar permisos · Delegar sin límite',
    detail: '«Asignar permisos» es lo que abre esta pantalla y la de permisos por usuario. «Delegar sin límite» es otra cosa: levanta los límites de quien reparte, y solo debería tenerla quien administra la seguridad del sistema.'
  }
]

const SIGUIENTE: HelpNextStep[] = [
  {
    label: 'Permisos por usuario',
    description: 'Cuando hace falta una excepción para una sola persona, sin tocar el rol entero.',
    to: '/ayuda/permisos-por-usuario',
    icon: 'i-lucide-user-round-cog'
  },
  {
    label: 'Límites al dar permisos',
    description: 'Por qué a veces el guardado se rechaza aunque tengas «Asignar permisos».',
    to: '/ayuda/limites-al-dar-permisos',
    icon: 'i-lucide-shield-alert'
  }
]
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Permisos por rol
    </h1>
    <p class="mt-3 text-muted">
      Aquí se decide qué puede hacer un puesto de trabajo. Se elige el rol, se marcan sus acciones módulo por
      módulo y se guarda; lo hereda al instante todo el que tenga ese rol.
    </p>

    <HelpTakeaway
      :items="[
        'Es **la vía normal** de dar permisos: se configura el puesto una vez, no persona por persona.',
        'Cada módulo es una tarjeta plegable, y dentro **un interruptor por acción**.',
        'Nada se guarda al tocar un interruptor: se acumula y se envía todo junto con **Guardar cambios**.',
        'Se guarda **entero o nada**: si algo falla, el rol se queda exactamente como estaba.',
        'Basta el permiso **«Asignar permisos»** de este módulo; no hace falta poder ver ningún otro listado.'
      ]"
    />

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      La pantalla, por partes
    </h2>
    <p class="mt-2 text-sm text-muted">
      Tiene tres zonas, siempre en el mismo sitio: el resumen del rol arriba, las tarjetas de módulo en medio y el
      pie de guardado abajo.
    </p>

    <HelpMockupFrame
      title="1 · El resumen del rol elegido"
      caption="El resumen no se toca para configurar nada, salvo el interruptor del final: «Seleccionar todo» marca de golpe todas las combinaciones de todos los módulos. Úsalo con cuidado — el pie de abajo te dirá cuántas van a cambiar antes de guardar."
    >
      <div class="rounded-lg border border-default bg-default">
        <div class="flex flex-col divide-y divide-default sm:flex-row sm:flex-wrap sm:items-stretch sm:divide-x sm:divide-y-0">
          <div class="flex min-w-0 items-center gap-3 p-4 sm:flex-1 sm:basis-56">
            <HelpCalloutBadge :n="1" />
            <BaseIconTile
              icon="i-lucide-shield"
              size="lg"
            />
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <p class="truncate font-semibold text-highlighted">
                  Supervisor
                </p>
                <UBadge
                  label="ROL"
                  color="primary"
                  variant="subtle"
                  size="sm"
                />
              </div>
              <p class="truncate text-sm text-muted">
                Acceso de solo lectura a reportes
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2.5 p-4">
            <HelpCalloutBadge :n="2" />
            <UIcon
              name="i-lucide-circle-check"
              class="size-5 shrink-0 text-success"
            />
            <div>
              <p class="font-semibold text-highlighted tabular-nums whitespace-nowrap">
                12 / 92
              </p>
              <p class="text-xs text-muted whitespace-nowrap">
                Permisos activos
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2.5 p-4">
            <UIcon
              name="i-lucide-box"
              class="size-5 shrink-0 text-dimmed"
            />
            <div>
              <p class="font-semibold text-highlighted tabular-nums">
                7
              </p>
              <p class="text-xs text-muted">
                Módulos
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2.5 p-4">
            <UIcon
              name="i-lucide-list-checks"
              class="size-5 shrink-0 text-dimmed"
            />
            <div>
              <p class="font-semibold text-highlighted tabular-nums">
                92
              </p>
              <p class="text-xs text-muted">
                Acciones
              </p>
            </div>
          </div>

          <div class="flex flex-col justify-center gap-1.5 p-4 sm:w-48">
            <div class="flex items-baseline justify-between gap-2">
              <p class="text-xs text-muted">
                Progreso de permisos
              </p>
              <p class="text-sm font-semibold text-highlighted tabular-nums">
                13%
              </p>
            </div>
            <UProgress
              :model-value="13"
              size="sm"
            />
          </div>

          <div class="flex items-center gap-2 p-4">
            <HelpCalloutBadge :n="3" />
            <USwitch
              :model-value="false"
              label="Seleccionar todo"
            />
          </div>
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'Qué rol estás configurando. Se cambia en el buscador de arriba de la pantalla; si tienes cambios sin guardar, avisa antes de dejarte salir',
          'Cuántos permisos tiene marcados de todos los posibles, y en cuántos módulos y acciones se reparten',
          'El interruptor maestro: marca o desmarca la matriz completa de una sola vez'
        ]"
      />
    </HelpMockupFrame>

    <HelpMockupFrame
      title="2 · La tarjeta de un módulo, desplegada"
      caption="Todas las tarjetas empiezan plegadas: primero se ve la lista completa de módulos y luego se abre el que se venía a tocar. La insignia «2 / 4» de la cabecera dice cuántas acciones tiene marcadas sin necesidad de abrirla."
    >
      <div class="rounded-lg border border-default bg-default">
        <div class="flex items-center gap-3 p-4">
          <HelpCalloutBadge :n="1" />
          <BaseIconTile icon="i-lucide-users" />
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-highlighted">
              Usuarios
            </p>
            <p class="truncate text-sm text-muted">
              <span class="text-xs">users</span> · Cuentas con acceso al sistema
            </p>
          </div>
          <UBadge
            label="2 / 4"
            color="neutral"
            variant="subtle"
          />
          <UIcon
            name="i-lucide-chevron-up"
            class="size-5 text-dimmed"
          />
        </div>

        <div class="border-t border-default">
          <div class="flex items-center gap-2 px-4 py-3">
            <HelpCalloutBadge :n="2" />
            <UButton
              label="Seleccionar todo el módulo"
              icon="i-lucide-square-check-big"
              color="neutral"
              variant="subtle"
            />
          </div>

          <div class="flex flex-wrap gap-x-8 gap-y-6 px-4 pb-5">
            <div class="min-w-0 space-y-3">
              <div class="flex items-center gap-2">
                <HelpCalloutBadge :n="3" />
                <UIcon
                  name="i-lucide-eye"
                  class="size-4 text-dimmed"
                />
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide text-muted">
                    Consulta
                  </p>
                  <p class="text-xs text-dimmed">
                    Ver y extraer información
                  </p>
                </div>
              </div>
              <div class="space-y-2.5">
                <USwitch
                  :model-value="true"
                  label="Listar"
                />
                <div class="flex items-center gap-1.5">
                  <USwitch
                    :model-value="false"
                    label="Leer"
                  />
                  <HelpCalloutBadge :n="4" />
                  <UIcon
                    name="i-lucide-circle-help"
                    class="size-4 text-dimmed"
                  />
                </div>
              </div>
            </div>

            <div class="min-w-0 space-y-3 border-default sm:border-s sm:ps-8">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-trash-2"
                  class="size-4 text-dimmed"
                />
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide text-muted">
                    Eliminación
                  </p>
                  <p class="text-xs text-dimmed">
                    Quitar registros del sistema
                  </p>
                </div>
              </div>
              <div class="space-y-2.5">
                <USwitch
                  :model-value="true"
                  label="Eliminar"
                />
                <div class="flex items-center gap-1.5">
                  <USwitch
                    :model-value="false"
                    color="error"
                    label="Eliminar permanente"
                  />
                  <HelpCalloutBadge :n="5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'Cabecera del módulo: su icono, su nombre, su código y cuántas acciones lleva marcadas',
          'Marca o desmarca de una vez todas las acciones de este módulo, y solo de este',
          'Las acciones no van en una lista plana: se reparten en bloques por lo que hacen (Consulta, Gestión, Eliminación, Recuperación)',
          'El interruptor de cada acción, con un «?» al lado que explica exactamente qué habilita',
          'En rojo, las acciones delicadas: irreversibles o de las que reparten autoridad'
        ]"
      />
    </HelpMockupFrame>

    <HelpMockupFrame
      title="3 · El pie de guardado"
      caption="Aparece siempre, pero solo se ilumina cuando hay algo pendiente. «+3 −1» quiere decir tres permisos que se van a conceder y uno que se va a revocar; «Descartar» devuelve todo a como estaba al abrir la pantalla."
    >
      <div class="rounded-lg border border-primary/30 bg-primary/5 p-3">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-2 text-sm">
            <HelpCalloutBadge :n="1" />
            <UIcon
              name="i-lucide-circle-alert"
              class="size-4 shrink-0 text-primary"
            />
            <span class="text-highlighted">
              4 cambio(s) sin guardar
              <span class="text-muted tabular-nums">(+3 −1)</span>
            </span>
          </div>

          <div class="flex items-center gap-2">
            <HelpCalloutBadge :n="2" />
            <UButton
              label="Descartar"
              icon="i-lucide-undo-2"
              color="neutral"
              variant="ghost"
            />
            <UButton
              label="Guardar cambios"
              icon="i-lucide-check"
            />
          </div>
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'Cuántos interruptores has tocado desde que abriste la pantalla, y en qué dirección',
          'Descartar los cambios, o enviarlos todos juntos en una sola petición'
        ]"
      />
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Cómo se usa, de principio a fin
    </h2>
    <ol class="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
      <li>Elige el rol en el buscador de arriba.</li>
      <li>Busca el módulo que te interesa y despliega su tarjeta.</li>
      <li>Marca o desmarca las acciones. Nada se guarda todavía.</li>
      <li>Repite en los módulos que hagan falta: los cambios se van acumulando.</li>
      <li>Revisa el pie —cuántas concedes, cuántas revocas— y pulsa <strong class="text-highlighted">Guardar cambios</strong>.</li>
    </ol>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Acciones que se confunden
    </h2>
    <p class="mt-2 text-sm text-muted">
      Estas son las que más se marcan por error. Cada interruptor de la pantalla lleva además su propia
      explicación en el «?» de al lado.
    </p>

    <div class="mt-4 space-y-3">
      <div
        v-for="item in CONFUSIONES"
        :key="item.pair"
        class="flex gap-3 rounded-lg border border-default bg-default p-4"
      >
        <UIcon
          :name="item.icon"
          class="mt-0.5 size-5 shrink-0 text-dimmed"
        />
        <div class="min-w-0">
          <p class="font-medium text-highlighted">
            {{ item.pair }}
          </p>
          <p class="mt-1 text-sm text-muted">
            {{ item.detail }}
          </p>
        </div>
      </div>
    </div>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Lo que conviene saber
    </h2>
    <ul class="mt-3 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        <strong class="text-highlighted">Se guarda entero o no se guarda nada.</strong> Guardar envía el cuadro
        completo tal y como quedó en pantalla, en una sola petición; si algo falla a media tanda, el rol se queda
        exactamente como estaba, sin la mitad de los cambios aplicados.
      </li>
      <li>
        <strong class="text-highlighted">El cambio es inmediato para el rol, pero no para las sesiones ya
          abiertas.</strong> Al guardar se refrescan tus propios permisos —para que los botones que dependan de
        ellos se actualicen sin cerrar sesión—, pero otra persona con la sesión abierta lo verá al recargar.
      </li>
      <li>
        <strong class="text-highlighted">Con «Asignar permisos» de este módulo basta.</strong> No hace falta
        «Listar» aquí, ni poder ver los listados de módulos, acciones, categorías o roles: la pantalla pide sus
        catálogos con ese mismo permiso.
      </li>
      <li>
        <strong class="text-highlighted">Marcar una acción que nada comprueba no hace nada.</strong> Si el módulo
        o la acción están dados de alta pero ninguna parte del sistema los revisa todavía, la casilla se guarda
        igual y no restringe nada. Se ve marcado en
        <NuxtLink
          to="/ayuda/modulos-del-sistema"
          class="text-primary underline"
        >Módulos del sistema</NuxtLink> y en
        <NuxtLink
          to="/ayuda/acciones"
          class="text-primary underline"
        >Acciones</NuxtLink>.
      </li>
      <li>
        <strong class="text-highlighted">Hay cosas que no vas a poder guardar</strong>, aunque tengas esta
        pantalla: tu propio rol, el rol superadmin y cualquier acción que tú mismo no tengas. Está explicado en
        <NuxtLink
          to="/ayuda/limites-al-dar-permisos"
          class="text-primary underline"
        >Límites al dar permisos</NuxtLink>.
      </li>
    </ul>

    <HelpNextSteps :links="SIGUIENTE" />
  </HelpDocsPage>
</template>
