/**
 * Tipos de los ejemplos visuales de «Cómo funciona» (`app/pages/ayuda/`).
 *
 * No modelan nada del backend: son la forma que tienen los datos con los que se
 * arman las tablas, los diagramas y los recorridos de esa guía. Viven aquí, y no
 * dentro de cada componente, porque las páginas los escriben y necesitan
 * tiparlos: una fila con una columna de más —o un color que no existe— tiene que
 * fallar al compilar, no verse raro en pantalla.
 */

/** Un color de los que ya maneja Nuxt UI en insignias e iconos. */
export type HelpTone = 'primary' | 'success' | 'error' | 'warning' | 'neutral'

/**
 * Una celda de `HelpOutcomeTable`.
 *
 * Como texto plano es un dato de entrada del ejemplo (lo que da el rol, lo que
 * dice la excepción); como objeto es un resultado, y se pinta como insignia de
 * color para que la columna que importa se lea de un vistazo sin leer la fila.
 */
export type HelpCell = string | { label: string, tone: HelpTone }

/** Una fila de `HelpOutcomeTable`: una celda por columna, en el mismo orden. */
export interface HelpRow {
  cells: HelpCell[]
  /** Por qué salió ese resultado. Va en gris al final de la fila, no en su propia columna. */
  note?: string
}

/** Una caja de `HelpFlow`, el diagrama de «esto lleva a esto». */
export interface HelpFlowStep {
  label: string
  detail?: string
  icon?: string
  tone?: HelpTone
  /** Qué se hizo para llegar hasta aquí: la etiqueta de la flecha que entra. */
  via?: string
}

/** Un enlace de `HelpNextSteps`, el bloque de «seguir leyendo» del pie. */
export interface HelpNextStep {
  label: string
  description: string
  to: string
  icon: string
}

/**
 * Un límite de la política de delegación, tal como lo lista `HelpRuleList`.
 *
 * `message` es el texto exacto que devuelve el servidor al rechazarlo
 * (`app/services/permission_delegation_policy.py` del backend): se copia literal
 * porque es lo que la gente ve en pantalla y lo que va a buscar en la guía.
 */
export interface HelpRule {
  title: string
  explanation: string
  message: string
  /** Qué hacer para que sí se pueda. */
  fix: string
}

/**
 * Una acción del catálogo, explicada por su EFECTO y no por su nombre
 * (`HelpActionGlossaryCard`).
 *
 * `on`/`off` no son una definición: son la frase concreta de lo que alguien
 * nota en pantalla con el interruptor puesto o quitado. Es a propósito que las
 * dos usan el mismo escenario (Ana, en el módulo Usuarios) en cada entrada del
 * glosario: así se compara una acción con otra sin tener que releer el contexto
 * cada vez, y se ve de un vistazo que todas siguen la misma regla —encendido
 * habilita algo puntual, apagado lo bloquea, nunca a medias—.
 */
export interface HelpActionExample {
  /** Código real del catálogo (`sa_actions.code`), para que se reconozca en la matriz. */
  code: string
  label: string
  icon: string
  /** Qué es, en una frase. Reusa el tooltip real de `ACTION_HINTS` cuando coincide. */
  what: string
  on: string
  off: string
  /** Se aplica a varios registros de una vez, no a uno solo. */
  bulk?: boolean
  /**
   * El mismo aviso que `actionWarning()` calcula para la matriz real
   * (`app/utils/permissions.ts`) cuando esta acción es una de las especiales.
   * Se repite aquí en vez de importar la función porque el glosario es
   * contenido estático de la guía, no datos que lleguen del catálogo.
   */
  warning?: string
}
