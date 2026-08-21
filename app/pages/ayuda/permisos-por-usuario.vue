<script setup lang="ts">
import type { HelpNextStep, HelpRow, OverrideState } from '~/types'

definePageMeta({
  layout: 'app'
})

useSeoMeta({ title: 'Permisos por usuario · Cómo funciona' })

/**
 * Los tres estados del selector, con el control de verdad al lado de su
 * explicación.
 *
 * Se monta el componente real (`UserPermissionOverrideControl`) y no un dibujo
 * suyo: es el mismo que se va a ver en la pantalla, con sus mismos colores y sus
 * mismos tooltips, así que no puede quedarse desactualizado respecto a ella.
 *
 * El `inherited` de cada ejemplo está elegido para que el tooltip diga algo
 * distinto en cada uno y se vea que también depende del rol.
 */
const ESTADOS: Array<{ state: OverrideState, inherited: boolean, title: string, detail: string }> = [
  {
    state: 'inherit',
    inherited: true,
    title: 'Hereda',
    detail: 'No hay excepción: decide el rol, diga lo que diga. Es el estado de reposo — así están todas las acciones de todo el mundo hasta que alguien las toca.'
  },
  {
    state: 'grant',
    inherited: false,
    title: 'Permitir',
    detail: 'Puede hacerlo, aunque su rol no lo conceda. Es la excepción que suma.'
  },
  {
    state: 'deny',
    inherited: true,
    title: 'Bloquear',
    detail: 'No puede hacerlo, aunque su rol sí lo conceda. Es la excepción que resta.'
  }
]

/**
 * Las seis combinaciones posibles de una celda: dos cosas que puede decir el rol
 * por tres estados de la excepción.
 *
 * Están las seis a propósito, aunque cuatro sean «obvias». Es la única forma de
 * ver de un tirón las dos que sorprenden —«Hereda» sobre un rol que no concede
 * también es un no, y una excepción gana en las dos direcciones— y de comprobar
 * que no hay ningún caso escondido.
 */
const COMBINACIONES: HelpRow[] = [
  {
    cells: [{ label: 'Hereda', tone: 'neutral' }, 'Sí lo concede', { label: 'Puede', tone: 'success' }],
    note: 'Manda el rol'
  },
  {
    cells: [{ label: 'Hereda', tone: 'neutral' }, 'No lo concede', { label: 'No puede', tone: 'error' }],
    note: 'Manda el rol — «Hereda» no es «permitido»'
  },
  {
    cells: [{ label: 'Permitir', tone: 'success' }, 'Sí lo concede', { label: 'Puede', tone: 'success' }],
    note: 'La excepción no cambia nada aquí'
  },
  {
    cells: [{ label: 'Permitir', tone: 'success' }, 'No lo concede', { label: 'Puede', tone: 'success' }],
    note: 'Este es el motivo de existir de «Permitir»'
  },
  {
    cells: [{ label: 'Bloquear', tone: 'error' }, 'Sí lo concede', { label: 'No puede', tone: 'error' }],
    note: 'Este es el motivo de existir de «Bloquear»'
  },
  {
    cells: [{ label: 'Bloquear', tone: 'error' }, 'No lo concede', { label: 'No puede', tone: 'error' }],
    note: 'La excepción no cambia nada aquí'
  }
]

/**
 * Cuándo esta pantalla es la herramienta correcta y cuándo es la trampa.
 *
 * Es la advertencia que más falta hacía: la pantalla resuelve el caso puntual
 * tan bien que invita a resolver con ella lo que en realidad es un puesto de
 * trabajo nuevo, y ahí se convierte en una lista de excepciones que nadie sabe
 * ya por qué están.
 */
const CUANDO = [
  {
    tone: 'success' as const,
    icon: 'i-lucide-circle-check',
    title: 'Sí: para el caso puntual',
    items: [
      '«A Ana, y solo a Ana, déjala exportar»: una acción suelta que su puesto no incluye.',
      '«A Carlos quítale eliminar mientras está en formación», sin cambiarle de rol.',
      'Un permiso temporal que vas a retirar en unos días.'
    ]
  },
  {
    tone: 'error' as const,
    icon: 'i-lucide-circle-slash',
    title: 'No: para reemplazar al rol',
    items: [
      'Si tres personas necesitan las mismas excepciones, lo que necesitas es un rol nuevo.',
      'Si acabas marcando media pantalla de excepciones, la persona no está en el rol que le toca.',
      'Las excepciones no se ven en ningún listado general: hay que entrar persona por persona a saber que existen.'
    ]
  }
]

const SIGUIENTE: HelpNextStep[] = [
  {
    label: 'Permisos por rol',
    description: 'Lo que hereda la persona, y el sitio donde arreglarlo para todo el puesto de una vez.',
    to: '/ayuda/permisos-por-rol',
    icon: 'i-lucide-shield-check'
  },
  {
    label: 'Límites al dar permisos',
    description: 'Por qué no puedes conceder algo que tú no tienes, ni tocar tus propios permisos.',
    to: '/ayuda/limites-al-dar-permisos',
    icon: 'i-lucide-shield-alert'
  }
]
</script>

<template>
  <HelpDocsPage>
    <h1 class="text-2xl font-bold text-highlighted">
      Permisos por usuario
    </h1>
    <p class="mt-3 text-muted">
      Las excepciones de una persona concreta sobre lo que le da su rol: qué puede hacer aunque el rol no lo dé, y
      qué no puede aunque el rol sí lo dé.
    </p>

    <HelpTakeaway
      :items="[
        'Cada acción tiene **tres** estados, no dos: Hereda, Permitir y Bloquear.',
        '**Hereda** es el estado normal: no hay excepción, decide el rol. No significa «permitido».',
        'Una excepción **siempre le gana al rol**, en las dos direcciones.',
        'Es para el **caso puntual**. Si vas a marcar media pantalla, lo que hace falta es otro rol.',
        'Devolver una acción a **Hereda** borra la excepción: la persona vuelve a depender del rol.'
      ]"
    />

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Los tres estados
    </h2>
    <p class="mt-2 text-sm text-muted">
      Cada acción se controla con este selector de tres posiciones. En la pantalla van solo los iconos —hay
      cientos de celdas y no caben tres palabras en cada una—, así que vale la pena reconocerlos:
    </p>

    <HelpMockupFrame
      title="El selector de cada acción"
      caption="Es lo mismo que verás repetido en cada acción de cada módulo. Pasando el cursor por encima, cada posición dice qué hace en esa acción concreta — incluido si el rol la concede o no."
    >
      <div class="space-y-4">
        <div
          v-for="(estado, index) in ESTADOS"
          :key="estado.state"
          class="flex items-start gap-3 rounded-lg border border-default bg-default p-4"
        >
          <HelpCalloutBadge :n="index + 1" />
          <UserPermissionOverrideControl
            :model-value="estado.state"
            :inherited="estado.inherited"
            label="Eliminar en Usuarios"
          />
          <div class="min-w-0">
            <p class="text-sm font-medium text-highlighted">
              {{ estado.title }}
            </p>
            <p class="mt-0.5 text-sm text-muted">
              {{ estado.detail }}
            </p>
          </div>
        </div>
      </div>
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Qué pasa con cada combinación
    </h2>
    <p class="mt-2 text-sm text-muted">
      Solo hay seis casos posibles, y aquí están los seis. Si alguna vez dudas de por qué una persona puede o no
      puede algo, la respuesta es una de estas filas:
    </p>

    <HelpMockupFrame
      title="Las seis combinaciones, sin excepciones"
      caption="Las dos primeras filas son la clave de la pantalla: con «Hereda» puesto, el resultado lo decide entero el rol. Las cuatro de abajo son excepciones, y en ellas el rol ya no se consulta."
    >
      <HelpOutcomeTable
        :columns="['Su excepción', 'Lo que da su rol', 'Puede al final']"
        :rows="COMBINACIONES"
      />
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      La pantalla, por partes
    </h2>

    <HelpMockupFrame
      title="1 · El resumen de la persona"
      caption="Las tres cifras del medio dicen de dónde sale cada permiso; la de la derecha dice el total que la persona notará. «Todo hereda del rol» borra de golpe todas sus excepciones y la deja igual que a cualquier otro con su mismo rol."
    >
      <div class="rounded-lg border border-default bg-default">
        <div class="flex flex-col divide-y divide-default sm:flex-row sm:flex-wrap sm:items-stretch sm:divide-x sm:divide-y-0">
          <div class="flex min-w-0 items-center gap-3 p-4 sm:flex-1 sm:basis-56">
            <HelpCalloutBadge :n="1" />
            <BaseIconTile
              icon="i-lucide-circle-user"
              size="lg"
            />
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <p class="truncate font-semibold text-highlighted">
                  Ana Martínez
                </p>
                <UBadge
                  label="Usuario"
                  color="primary"
                  variant="subtle"
                  size="sm"
                />
              </div>
              <p class="truncate text-sm text-muted">
                ana.martinez@empresa.com
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2.5 p-4">
            <HelpCalloutBadge :n="2" />
            <UIcon
              name="i-lucide-corner-down-right"
              class="size-5 shrink-0 text-dimmed"
            />
            <div>
              <p class="font-semibold text-highlighted tabular-nums">
                41
              </p>
              <p class="text-xs text-muted whitespace-nowrap">
                Del rol «Supervisor»
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2.5 p-4">
            <UIcon
              name="i-lucide-check"
              class="size-5 shrink-0 text-success"
            />
            <div>
              <p class="font-semibold text-highlighted tabular-nums">
                4
              </p>
              <p class="text-xs text-muted">
                Concedidas
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2.5 p-4">
            <UIcon
              name="i-lucide-ban"
              class="size-5 shrink-0 text-error"
            />
            <div>
              <p class="font-semibold text-highlighted tabular-nums">
                3
              </p>
              <p class="text-xs text-muted">
                Bloqueadas
              </p>
            </div>
          </div>

          <div class="flex flex-col justify-center gap-1.5 p-4 sm:w-48">
            <div class="flex items-baseline justify-between gap-2">
              <p class="flex items-center gap-2 text-xs text-muted whitespace-nowrap">
                <HelpCalloutBadge :n="3" />
                Permisos efectivos
              </p>
              <p class="text-sm font-semibold text-highlighted tabular-nums">
                42<span class="text-dimmed">/92</span>
              </p>
            </div>
            <UProgress
              :model-value="46"
              size="sm"
            />
          </div>

          <div class="flex items-center gap-2 p-4">
            <HelpCalloutBadge :n="4" />
            <UButton
              label="Todo hereda del rol"
              icon="i-lucide-rotate-ccw"
              color="neutral"
              variant="outline"
            />
          </div>
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'Quién es y de qué rol hereda. Se cambia de persona en el buscador de arriba, por nombre o por correo',
          'Cuántas acciones le da el rol sin tocar nada, y cuántas le has concedido o bloqueado a mano',
          'Lo que de verdad puede hacer al final: el rol, más lo concedido, menos lo bloqueado',
          'Borra todas sus excepciones de una vez y la devuelve a depender solo de su rol'
        ]"
      />
    </HelpMockupFrame>

    <HelpMockupFrame
      title="2 · La barra de la lista de módulos"
      caption="«Solo con excepciones» es el atajo de la pantalla: contesta «¿en qué se sale esta persona de su rol?» sin abrir un módulo tras otro. La leyenda de la derecha está siempre ahí para recordar qué es cada icono."
    >
      <div class="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-default bg-default p-3">
        <HelpCalloutBadge :n="1" />
        <UInput
          icon="i-lucide-search"
          placeholder="Buscar módulo o acción"
          disabled
          class="w-full sm:w-56"
        />
        <HelpCalloutBadge :n="2" />
        <USwitch
          :model-value="true"
          label="Solo con excepciones"
        />
        <HelpCalloutBadge :n="3" />
        <div class="flex items-center gap-3 text-xs text-dimmed">
          <span class="inline-flex items-center gap-1">
            <UIcon
              name="i-lucide-corner-down-right"
              class="size-3.5"
            />
            Hereda
          </span>
          <span class="inline-flex items-center gap-1">
            <UIcon
              name="i-lucide-check"
              class="size-3.5"
            />
            Permitir
          </span>
          <span class="inline-flex items-center gap-1">
            <UIcon
              name="i-lucide-ban"
              class="size-3.5"
            />
            Bloquear
          </span>
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'Busca por nombre de módulo o de acción, y abre solo lo que encuentra',
          'Deja a la vista únicamente los módulos donde esta persona tiene alguna excepción',
          'Qué significa cada icono del selector, sin tener que pasar el cursor por encima'
        ]"
      />
    </HelpMockupFrame>

    <HelpMockupFrame
      title="3 · La tarjeta de un módulo, desplegada"
      caption="El nombre de cada acción se apaga cuando la persona no puede hacerla, sea porque el rol no la da o porque está bloqueada: leyendo solo los nombres en negro sabes lo que puede hacer en ese módulo."
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
            label="2 excepciones"
            color="warning"
            variant="subtle"
            class="shrink-0"
          />
          <span class="shrink-0 text-sm text-muted tabular-nums">
            2<span class="text-dimmed">/4</span> permisos
          </span>
          <UIcon
            name="i-lucide-chevron-down"
            class="size-5 shrink-0 rotate-180 text-dimmed"
          />
        </div>

        <div class="border-t border-default">
          <div class="flex flex-wrap items-center gap-2 px-4 py-2.5">
            <HelpCalloutBadge :n="2" />
            <UButton
              label="Todo hereda del rol"
              icon="i-lucide-corner-down-right"
              color="neutral"
              variant="subtle"
              size="xs"
            />
            <UButton
              label="Bloquear todo el módulo"
              icon="i-lucide-ban"
              color="error"
              variant="subtle"
              size="xs"
            />
          </div>

          <div class="flex flex-wrap gap-x-8 gap-y-6 px-4 pb-5">
            <div class="min-w-0 space-y-3">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-eye"
                  class="size-4 shrink-0 text-dimmed"
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
              <div class="space-y-1.5">
                <div class="flex items-center gap-2">
                  <UserPermissionOverrideControl
                    model-value="inherit"
                    :inherited="true"
                    label="Listar en Usuarios"
                  />
                  <span class="text-sm text-highlighted">Listar</span>
                </div>
                <div class="flex items-center gap-2">
                  <UserPermissionOverrideControl
                    model-value="inherit"
                    :inherited="false"
                    label="Leer en Usuarios"
                  />
                  <span class="text-sm text-dimmed">Leer</span>
                  <HelpCalloutBadge :n="3" />
                </div>
              </div>
            </div>

            <div class="min-w-0 space-y-3 border-default sm:border-s sm:ps-8">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-trash-2"
                  class="size-4 shrink-0 text-dimmed"
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
              <div class="space-y-1.5">
                <div class="flex items-center gap-2">
                  <UserPermissionOverrideControl
                    model-value="deny"
                    :inherited="true"
                    label="Eliminar en Usuarios"
                  />
                  <span class="text-sm text-dimmed">Eliminar</span>
                  <HelpCalloutBadge :n="4" />
                </div>
                <div class="flex items-center gap-2">
                  <UserPermissionOverrideControl
                    model-value="grant"
                    :inherited="false"
                    label="Restaurar en Usuarios"
                  />
                  <span class="text-sm text-highlighted">Restaurar</span>
                  <HelpCalloutBadge :n="5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HelpCalloutLegend
        :items="[
          'La insignia naranja avisa de que aquí dentro hay excepciones, sin necesidad de abrir la tarjeta; al lado, cuántas acciones puede hacer de las que tiene el módulo',
          'Atajos del módulo entero: devolverlo todo a heredar, o bloquearlo todo de una vez',
          'En «Hereda» y apagado: su rol tampoco lo concede, así que no puede — y no hay ninguna excepción de por medio',
          'Bloqueado a mano: el rol sí lo concede, pero a esta persona se le quitó',
          'Concedido a mano: el rol no lo da, pero a esta persona sí se le permite'
        ]"
      />
    </HelpMockupFrame>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Cuándo usar esta pantalla
    </h2>
    <p class="mt-2 text-sm text-muted">
      Es una herramienta de precisión, y por eso mismo es fácil pasarse con ella:
    </p>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <div
        v-for="bloque in CUANDO"
        :key="bloque.title"
        class="rounded-lg border p-4"
        :class="bloque.tone === 'success' ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'"
      >
        <p class="flex items-center gap-2 font-medium text-highlighted">
          <UIcon
            :name="bloque.icon"
            class="size-4 shrink-0"
            :class="bloque.tone === 'success' ? 'text-success' : 'text-error'"
          />
          {{ bloque.title }}
        </p>
        <ul class="mt-3 space-y-2">
          <li
            v-for="item in bloque.items"
            :key="item"
            class="text-sm text-muted"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </div>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Al guardar
    </h2>
    <ul class="mt-3 list-disc space-y-3 pl-5 text-sm text-muted">
      <li>
        Se envían las excepciones tal y como quedaron en pantalla, en una sola petición. Lo que devolviste a
        <strong class="text-highlighted">Hereda</strong> deja de existir como excepción; el resto se guarda como
        concedido o bloqueado.
      </li>
      <li>
        Entra entero o no entra nada: si algo falla, la persona se queda exactamente con las excepciones que
        tenía.
      </li>
      <li>
        El pie de guardado solo se ilumina si hay algo pendiente, y dice cuántas excepciones se van a crear o
        cambiar y cuántas se van a quitar.
      </li>
      <li>
        Igual que en
        <NuxtLink
          to="/ayuda/permisos-por-rol"
          class="text-primary underline"
        >Permisos por rol</NuxtLink>, con «Asignar permisos» de su propio módulo basta para entrar, ver los
        catálogos y guardar.
      </li>
    </ul>

    <h2 class="mt-10 text-lg font-semibold text-highlighted">
      Avisos que pueden salir
    </h2>
    <div class="mt-4 space-y-3">
      <UAlert
        color="warning"
        variant="subtle"
        icon="i-lucide-user-x"
        title="Este usuario no tiene rol"
        description="Sin rol no hereda nada: todas sus acciones en «Hereda» son un no, y lo único que le da permisos son las excepciones que marques aquí. Funciona, pero asignarle un rol es más fácil de mantener."
      />
      <UAlert
        color="warning"
        variant="subtle"
        icon="i-lucide-shield-off"
        title="Tu cuenta no puede leer las excepciones"
        description="Falta el módulo «user_permissions», o falta el permiso «Asignar permisos» sobre él. Mientras no se conceda, solo un superadmin puede editar esta pantalla."
      />
    </div>

    <HelpNextSteps :links="SIGUIENTE" />
  </HelpDocsPage>
</template>
