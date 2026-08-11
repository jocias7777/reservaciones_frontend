<script setup lang="ts">
import type { AccordionItem, PageAnchorsProps } from '@nuxt/ui'

definePageMeta({
  layout: 'app'
})

useSeoMeta({
  title: 'Cómo funciona',
  description: 'Guía de qué hace cada módulo del sistema y cómo se decide qué puede ver o hacer cada persona.'
})

/**
 * Guía de referencia, no una pantalla de datos: por eso no pide ningún
 * permiso ni pasa por `useAccessControl` (ver `useAppNavigation`). Todo lo de
 * aquí es texto fijo, escrito a mano a partir de cómo funciona de verdad el
 * backend — nada se pide por API, así que no hay estados de carga ni de
 * error que cuidar.
 */

interface GuideModule {
  id: string
  title: string
  description: string
  icon: string
}

/** Mismos ícono, título y descripción que ya usa el menú (`useAppNavigation`), para que se sienta la misma pantalla. */
const modules: GuideModule[] = [
  { id: 'usuarios', title: 'Usuarios', description: 'Cuentas con acceso al sistema', icon: 'i-lucide-users' },
  { id: 'roles', title: 'Roles', description: 'Qué puede hacer cada rol en cada módulo', icon: 'i-lucide-shield' },
  { id: 'permisos-por-rol', title: 'Permisos por rol', description: 'La matriz módulo × acción de un rol', icon: 'i-lucide-list-checks' },
  { id: 'permisos-por-usuario', title: 'Permisos por usuario', description: 'Excepciones de una persona sobre lo que da su rol', icon: 'i-lucide-user-round-cog' },
  { id: 'modulos-del-sistema', title: 'Módulos del sistema', description: 'Las zonas sobre las que se dan permisos', icon: 'i-lucide-key-round' },
  { id: 'acciones', title: 'Acciones', description: 'Lo que se puede permitir o negar en cada módulo', icon: 'i-lucide-circle-plus' },
  { id: 'categorias', title: 'Categorías de acciones', description: 'Los bloques en los que se agrupan las acciones', icon: 'i-lucide-shapes' }
]

const anchorLinks: PageAnchorsProps['links'] = [
  { label: 'Cómo se decide qué puede hacer alguien', icon: 'i-lucide-workflow', to: '#modelo' },
  ...modules.map(m => ({ label: m.title, icon: m.icon, to: `#${m.id}` })),
  { label: 'Papelera y restaurar', icon: 'i-lucide-archive', to: '#papelera' },
  { label: 'Preguntas frecuentes', icon: 'i-lucide-circle-help', to: '#preguntas-frecuentes' }
]

interface StatHighlight {
  icon: string
  value: string
  label: string
}

const stats: StatHighlight[] = [
  { icon: 'i-lucide-boxes', value: '7', label: 'módulos administrables' },
  { icon: 'i-lucide-archive', value: '4', label: 'con papelera: usuarios, roles, acciones y categorías' },
  { icon: 'i-lucide-layers', value: '2', label: 'niveles: el rol, y las excepciones por usuario encima' },
  { icon: 'i-lucide-toggle-left', value: '3', label: 'estados por excepción: hereda, concede o revoca' }
]

interface PermissionStepOutcome {
  label: string
  color: 'success' | 'error'
}

interface PermissionStep {
  icon: string
  title: string
  description: string
  outcomes: PermissionStepOutcome[]
}

/**
 * Los tres pasos de `require_permission` (`app/decorators.py` del backend),
 * en el mismo orden en el que se comprueban. Es la pieza más importante de
 * toda esta guía: casi todas las dudas de permisos se resuelven volviendo
 * aquí.
 */
const permissionSteps: PermissionStep[] = [
  {
    icon: 'i-lucide-crown',
    title: '¿El rol activo es «superadmin»?',
    description: 'Si es así, se saltan los otros dos pasos en cualquier módulo y cualquier acción. Se exige además que ese rol siga vigente: mandarlo a la papelera le quita el privilegio también a quien lo tenga.',
    outcomes: [{ label: 'Permite todo, sin más preguntas', color: 'success' }]
  },
  {
    icon: 'i-lucide-user-round-cog',
    title: '¿Tiene una excepción suya en «Permisos por usuario»?',
    description: 'Una excepción es una fila propia para ese módulo y esa acción, y manda siempre, sin importar lo que diga el rol.',
    outcomes: [
      { label: 'Con «Concede»: permite', color: 'success' },
      { label: 'Con «Revoca»: deniega', color: 'error' }
    ]
  },
  {
    icon: 'i-lucide-shield',
    title: '¿Su rol lo concede en «Permisos por rol»?',
    description: 'Sin excepción de por medio (el caso más común), manda lo que tenga marcado el rol para ese módulo y esa acción.',
    outcomes: [
      { label: 'Marcado: permite', color: 'success' },
      { label: 'Sin marcar: deniega', color: 'error' }
    ]
  }
]

const faq: AccordionItem[] = [
  {
    label: 'Le quité un permiso a un rol y esa persona sigue viendo el botón o la pantalla',
    content: 'Los permisos se calculan una vez por sesión, para no repetir la comprobación en cada clic. Si guardaste el cambio desde «Permisos por rol» o «Permisos por usuario», se actualiza solo, sin recargar. Si es otra persona la que ya tenía sesión abierta desde antes del cambio, tiene que cerrar sesión y volver a entrar para verlo.'
  },
  {
    label: '¿Por qué el botón de Papelera no depende también de «Restaurar masivo»?',
    content: 'Porque sin «Restaurar» no hay ninguna fila que recuperar una por una dentro de la papelera: tener solo «Restaurar masivo» no serviría de nada si ni siquiera se puede entrar a seleccionar algo. «Restaurar masivo» solo decide si aparece el botón para recuperar varias a la vez, ya adentro.'
  },
  {
    label: 'Diferencia entre «Eliminar» y «Eliminar permanente»',
    content: '«Eliminar» es borrado lógico: la fila sigue en la base de datos y se puede recuperar desde la papelera. «Eliminar permanente» sí la borra de la base sin vuelta atrás — el backend lo tiene, pero ninguna pantalla lo ofrece, a propósito.'
  },
  {
    label: 'No veo «Permisos por rol» ni «Permisos por usuario», aunque antes sí las veía',
    content: 'Esas dos pantallas exigen el permiso «Asignar permisos» de su propio módulo (`role_permissions` o `user_permissions`), no «Listar». Revisa que el rol tenga esa acción concedida en «Permisos por rol».'
  },
  {
    label: 'Doy de alta un módulo o una acción nueva y no cambia nada',
    content: 'Es lo esperado: el catálogo es solo el diccionario de nombres posibles. No restringe nada hasta que una ruta real del backend lo comprueba con su código exacto. La columna «Efecto real» en Acciones, y el aviso «Sin uso en el código» en Módulos del sistema, dicen justo eso.'
  }
]
</script>

<template>
  <UContainer class="py-6">
    <BasePageHeader
      title="Cómo funciona"
      description="Qué hace cada módulo y cómo se decide, paso a paso, qué puede ver o hacer cada persona."
    />

    <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-lg border border-default bg-elevated/30 p-3"
      >
        <div class="flex items-center gap-2">
          <UIcon
            :name="stat.icon"
            class="size-4 text-primary"
          />
          <span class="text-xl font-bold text-highlighted">{{ stat.value }}</span>
        </div>
        <p class="mt-1 text-xs text-muted">
          {{ stat.label }}
        </p>
      </div>
    </div>

    <UPage class="mt-8">
      <template #left>
        <UPageAside>
          <p class="mb-3 text-xs font-semibold tracking-wide text-highlighted uppercase">
            En esta página
          </p>
          <UPageAnchors :links="anchorLinks" />
        </UPageAside>
      </template>

      <UPageBody>
        <section
          id="modelo"
          class="scroll-mt-(--ui-header-height)"
        >
          <h2 class="text-xl font-bold text-highlighted">
            Cómo se decide qué puede hacer alguien
          </h2>
          <p class="mt-1 text-muted">
            El backend comprueba estos tres pasos, en este orden, en <strong>cada</strong> petición — no solo al
            entrar. Esto no es una simplificación de la interfaz: es exactamente lo que hace
            <code class="rounded bg-elevated px-1 py-0.5 text-sm">require_permission</code> en el servidor.
          </p>

          <div class="mt-6 space-y-0">
            <div
              v-for="(step, index) in permissionSteps"
              :key="step.title"
              class="relative flex gap-4"
            >
              <div class="flex flex-col items-center">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-elevated ring ring-default">
                  <UIcon
                    :name="step.icon"
                    class="size-5 text-highlighted"
                  />
                </div>
                <div
                  v-if="index < permissionSteps.length - 1"
                  class="my-1 w-px flex-1 bg-default"
                />
              </div>

              <div class="min-w-0 pb-8">
                <p class="font-semibold text-highlighted">
                  {{ step.title }}
                </p>
                <p class="mt-1 text-sm text-muted">
                  {{ step.description }}
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <UBadge
                    v-for="outcome in step.outcomes"
                    :key="outcome.label"
                    :label="outcome.label"
                    :color="outcome.color"
                    variant="subtle"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <UAlert
            color="neutral"
            variant="subtle"
            icon="i-lucide-info"
            class="mt-2"
            title="Esto no es la barrera de seguridad"
            description="Ocultar un botón en el navegador es una comodidad, no protección: el backend vuelve a comprobar estos tres pasos por su cuenta en cada petición, y responde 403 si de verdad no toca. Nada de lo que se oculta aquí queda expuesto por debajo."
          />
        </section>

        <section
          id="modulos-grid"
          class="scroll-mt-(--ui-header-height)"
        >
          <h2 class="text-xl font-bold text-highlighted">
            Los módulos, de un vistazo
          </h2>
          <p class="mt-1 text-muted">
            Toca cualquiera para ir directo a su explicación.
          </p>

          <UPageGrid class="mt-6">
            <UPageCard
              v-for="module_ in modules"
              :key="module_.id"
              :icon="module_.icon"
              :title="module_.title"
              :description="module_.description"
              :to="`#${module_.id}`"
              spotlight
            />
          </UPageGrid>
        </section>

        <section
          id="usuarios"
          class="scroll-mt-(--ui-header-height)"
        >
          <h2 class="flex items-center gap-2 text-xl font-bold text-highlighted">
            <UIcon
              name="i-lucide-users"
              class="size-5 text-primary"
            />
            Usuarios
          </h2>
          <p class="mt-2 text-muted">
            Las cuentas con acceso al sistema. Cada una puede tener un rol asignado y un perfil con sus datos
            personales — nombre, teléfono, foto —, guardado aparte de la cuenta.
          </p>
          <ul class="mt-3 space-y-2 text-sm text-muted">
            <li class="flex gap-2">
              <UIcon
                name="i-lucide-lock"
                class="mt-0.5 size-4 shrink-0 text-dimmed"
              />
              <span>
                El estado activo/inactivo y el rol son cosas separadas: una cuenta inactiva no puede iniciar
                sesión aunque su rol siga vigente.
              </span>
            </li>
            <li class="flex gap-2">
              <UIcon
                name="i-lucide-shield-alert"
                class="mt-0.5 size-4 shrink-0 text-dimmed"
              />
              <span>
                El login cuenta los intentos fallidos por correo y por IP a la vez; tras varios seguidos, bloquea
                unos minutos antes de dejar reintentar.
              </span>
            </li>
            <li class="flex gap-2">
              <UIcon
                name="i-lucide-archive"
                class="mt-0.5 size-4 shrink-0 text-dimmed"
              />
              <span>Eliminar una cuenta es borrado lógico: pasa a la papelera y se puede recuperar.</span>
            </li>
          </ul>
        </section>

        <section
          id="roles"
          class="scroll-mt-(--ui-header-height)"
        >
          <h2 class="flex items-center gap-2 text-xl font-bold text-highlighted">
            <UIcon
              name="i-lucide-shield"
              class="size-5 text-primary"
            />
            Roles
          </h2>
          <p class="mt-2 text-muted">
            Un conjunto de permisos con nombre, para no repetir la misma combinación módulo × acción usuario por
            usuario. Aquí solo se administran sus datos (nombre, descripción); qué puede hacer se configura en
            «Permisos por rol».
          </p>
          <ul class="mt-3 space-y-2 text-sm text-muted">
            <li class="flex gap-2">
              <UIcon
                name="i-lucide-link"
                class="mt-0.5 size-4 shrink-0 text-dimmed"
              />
              <span>
                Asignarle un rol a alguien no le copia los permisos: el usuario sigue leyendo lo que el rol tenga
                configurado en cada momento, no una foto de cómo estaba el día que se lo asignaron.
              </span>
            </li>
            <li class="flex gap-2">
              <UIcon
                name="i-lucide-rotate-ccw"
                class="mt-0.5 size-4 shrink-0 text-dimmed"
              />
              <span>
                Enviar un rol a la papelera <strong>no</strong> le quita el rol a sus usuarios — solo deja de
                darles permisos mientras esté ahí. Restaurarlo se los devuelve a todos de una vez, sin tener que
                reasignar a nadie.
              </span>
            </li>
          </ul>
        </section>

        <section
          id="permisos-por-rol"
          class="scroll-mt-(--ui-header-height)"
        >
          <h2 class="flex items-center gap-2 text-xl font-bold text-highlighted">
            <UIcon
              name="i-lucide-list-checks"
              class="size-5 text-primary"
            />
            Permisos por rol
          </h2>
          <p class="mt-2 text-muted">
            La matriz módulo × acción de un rol: qué puede hacer en cada zona del sistema. Se elige el rol, se
            marcan las casillas y se guarda.
          </p>
          <ul class="mt-3 space-y-2 text-sm text-muted">
            <li class="flex gap-2">
              <UIcon
                name="i-lucide-key-round"
                class="mt-0.5 size-4 shrink-0 text-dimmed"
              />
              <span>
                Exige el permiso «Asignar permisos» de este mismo módulo, no «Listar»: así se puede dejar
                administrar la matriz sin dar acceso a la búsqueda avanzada sobre la tabla completa de
                asignaciones.
              </span>
            </li>
            <li class="flex gap-2">
              <UIcon
                name="i-lucide-save"
                class="mt-0.5 size-4 shrink-0 text-dimmed"
              />
              <span>
                Guardar solo toca lo que cambió: lo quitado se revoca en una sola llamada, lo agregado se concede
                en otra — no una petición por casilla.
              </span>
            </li>
          </ul>
        </section>

        <section
          id="permisos-por-usuario"
          class="scroll-mt-(--ui-header-height)"
        >
          <h2 class="flex items-center gap-2 text-xl font-bold text-highlighted">
            <UIcon
              name="i-lucide-user-round-cog"
              class="size-5 text-primary"
            />
            Permisos por usuario
          </h2>
          <p class="mt-2 text-muted">
            Las excepciones de una persona sobre lo que le da su rol. Cada casilla tiene tres estados, no dos:
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <UBadge
              label="Hereda — manda el rol"
              color="neutral"
              variant="subtle"
            />
            <UBadge
              label="Concede — puede, aunque el rol no lo dé"
              color="success"
              variant="subtle"
            />
            <UBadge
              label="Revoca — no puede, aunque el rol sí lo dé"
              color="error"
              variant="subtle"
            />
          </div>
          <ul class="mt-3 space-y-2 text-sm text-muted">
            <li class="flex gap-2">
              <UIcon
                name="i-lucide-crosshair"
                class="mt-0.5 size-4 shrink-0 text-dimmed"
              />
              <span>
                Es la herramienta para el caso puntual —«esta persona sí, aunque su rol no lo incluya» o al
                revés—, no para reemplazar el rol entero.
              </span>
            </li>
            <li class="flex gap-2">
              <UIcon
                name="i-lucide-key-round"
                class="mt-0.5 size-4 shrink-0 text-dimmed"
              />
              <span>Igual que en permisos por rol, aquí también exige «Asignar permisos» de su propio módulo.</span>
            </li>
          </ul>
        </section>

        <section
          id="modulos-del-sistema"
          class="scroll-mt-(--ui-header-height)"
        >
          <h2 class="flex items-center gap-2 text-xl font-bold text-highlighted">
            <UIcon
              name="i-lucide-key-round"
              class="size-5 text-primary"
            />
            Módulos del sistema
          </h2>
          <p class="mt-2 text-muted">
            El catálogo de las zonas del sistema sobre las que se puede dar permisos —usuarios, roles, acciones,
            incluso este mismo catálogo—. Cada módulo es solo un código y un nombre.
          </p>
          <ul class="mt-3 space-y-2 text-sm text-muted">
            <li class="flex gap-2">
              <UIcon
                name="i-lucide-unplug"
                class="mt-0.5 size-4 shrink-0 text-dimmed"
              />
              <span>
                Dar de alta un módulo aquí no restringe nada por sí solo: solo importa cuando alguna ruta del
                backend lo comprueba de verdad con su código. La pantalla marca con «Sin uso en el código» los que
                todavía no protegen nada.
              </span>
            </li>
          </ul>
        </section>

        <section
          id="acciones"
          class="scroll-mt-(--ui-header-height)"
        >
          <h2 class="flex items-center gap-2 text-xl font-bold text-highlighted">
            <UIcon
              name="i-lucide-circle-plus"
              class="size-5 text-primary"
            />
            Acciones
          </h2>
          <p class="mt-2 text-muted">
            El catálogo de qué se puede hacer —crear, editar, eliminar, restaurar, asignar…—, agrupado en
            categorías solo para que la matriz se lea mejor.
          </p>
          <ul class="mt-3 space-y-2 text-sm text-muted">
            <li class="flex gap-2">
              <UIcon
                name="i-lucide-shield-check"
                class="mt-0.5 size-4 shrink-0 text-dimmed"
              />
              <span>
                Igual que los módulos, una acción nueva no frena nada hasta que un endpoint la exige de verdad. La
                columna «Efecto real» dice en cuántos módulos se comprueba.
              </span>
            </li>
          </ul>
        </section>

        <section
          id="categorias"
          class="scroll-mt-(--ui-header-height)"
        >
          <h2 class="flex items-center gap-2 text-xl font-bold text-highlighted">
            <UIcon
              name="i-lucide-shapes"
              class="size-5 text-primary"
            />
            Categorías de acciones
          </h2>
          <p class="mt-2 text-muted">
            Los bloques en los que se agrupan las acciones dentro de la tarjeta de cada módulo, en «Permisos por
            rol». Nombre, ícono y orden — nada más: es una cuestión de cómo se lee la matriz, no de qué permite.
          </p>
          <ul class="mt-3 space-y-2 text-sm text-muted">
            <li class="flex gap-2">
              <UIcon
                name="i-lucide-corner-down-right"
                class="mt-0.5 size-4 shrink-0 text-dimmed"
              />
              <span>
                Eliminar una categoría no borra sus acciones: pasan al bloque «Otras acciones» hasta que se les
                asigne otra.
              </span>
            </li>
          </ul>
        </section>

        <section
          id="papelera"
          class="scroll-mt-(--ui-header-height)"
        >
          <h2 class="flex items-center gap-2 text-xl font-bold text-highlighted">
            <UIcon
              name="i-lucide-archive"
              class="size-5 text-primary"
            />
            Papelera y restaurar
          </h2>
          <p class="mt-2 text-muted">
            Usuarios, Roles, Acciones y Categorías de acciones tienen papelera: eliminar ahí es borrado lógico, con
            una pantalla aparte para ver lo eliminado y recuperarlo.
          </p>

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg border border-default p-4">
              <div class="flex items-center gap-2">
                <UBadge
                  label="Restaurar"
                  color="success"
                  variant="subtle"
                />
                <span class="text-sm font-medium text-highlighted">decide si se ofrece la papelera</span>
              </div>
              <p class="mt-2 text-sm text-muted">
                El botón «Papelera» del listado, y el botón de recuperar de cada fila ya adentro, dependen de este
                permiso. Sin él, ninguno de los dos aparece — aunque la persona tenga «Restaurar masivo».
              </p>
            </div>
            <div class="rounded-lg border border-default p-4">
              <div class="flex items-center gap-2">
                <UBadge
                  label="Restaurar masivo"
                  color="success"
                  variant="subtle"
                />
                <span class="text-sm font-medium text-highlighted">solo el botón de varios a la vez</span>
              </div>
              <p class="mt-2 text-sm text-muted">
                Solo decide si aparece el botón para recuperar varios seleccionados de una vez, ya adentro de la
                papelera. No abre la papelera por sí solo.
              </p>
            </div>
          </div>

          <p class="mt-4 text-sm text-muted">
            Eliminar y restaurar guardan lo mismo que había: un rol restaurado recupera exactamente los permisos
            que tenía, una cuenta restaurada exactamente su perfil. El borrado definitivo (<code class="rounded bg-elevated px-1 py-0.5">hard_delete</code>) existe en el backend, pero ninguna pantalla lo ofrece, a propósito.
          </p>
        </section>

        <section
          id="preguntas-frecuentes"
          class="scroll-mt-(--ui-header-height)"
        >
          <h2 class="flex items-center gap-2 text-xl font-bold text-highlighted">
            <UIcon
              name="i-lucide-circle-help"
              class="size-5 text-primary"
            />
            Preguntas frecuentes
          </h2>

          <UAccordion
            :items="faq"
            class="mt-4"
          />
        </section>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
