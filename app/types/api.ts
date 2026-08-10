/**
 * Contratos genéricos de la API.
 *
 * El backend responde siempre con el mismo envoltorio:
 *   éxito -> { data, message }        (app/utils/response.py :: success)
 *   error -> { error }                (app/utils/response.py :: error)
 */

export interface ApiEnvelope<T> {
  data: T
  message: string
}

export interface ApiErrorBody {
  error: string
}

/** Resultado del endpoint `QUERY` de cualquier recurso (búsqueda avanzada). */
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
  grouped: boolean
  groupBy: string | string[] | null
}

/** Una opción de combo tal como la devuelve `GET /<recurso>`. */
export interface SelectOption {
  label: string
  value: string
}

/**
 * Resultado de `GET /<recurso>?q=&limit=` (`BaseRepository.select_options`).
 *
 * Es lo que alimenta los desplegables de los formularios, y va por la acción
 * `select` —ni `read` ni `list`— justo para eso: alguien puede necesitar
 * elegir un rol en un formulario sin tener acceso a explorar la tabla de
 * roles ni a ver la ficha de ninguno en particular.
 *
 * `total` es cuántas coinciden de verdad, no cuántas vinieron: el backend acota
 * a 50 por defecto (200 como máximo) y avisa con `truncado`, para poder decir
 * "hay más, escribe para acotar" en lugar de aparentar que están todas.
 */
export interface SelectOptionsResult {
  items: SelectOption[]
  total: number
  limit: number
  truncado: boolean
}

/** Parámetros de `GET /<recurso>`: `q` busca y `limit` acota. */
export interface SelectOptionsParams {
  q?: string
  limit?: number
}

/**
 * Un elemento del lote que no se pudo escribir, tal como lo reporta
 * `BulkWriteMixin`.
 *
 * `id` solo aparece en `bulk/update`: en `bulk/create` el elemento no tenía
 * identificador propio todavía, así que lo único que lo señala es su posición.
 */
export interface BulkWriteError {
  indice: number
  id?: string
  error: string
}

/**
 * Resultado de `POST .../bulk/create` o `PUT .../bulk/update`.
 *
 * No es atómico: cada fila se confirma por su cuenta, así que un duplicado en
 * el elemento 40 no deshace los 39 anteriores. Por eso el resultado siempre
 * trae el desglose en vez de un simple "salió bien" — hasta cuando fallan
 * todos (código 400 en vez de 201/200/207) el cuerpo sigue teniendo esta
 * forma, con `correctos` en cero.
 */
export interface BulkWriteResult {
  correctos: number
  fallidos: number
  errores: BulkWriteError[]
}

export type SortOrder = 'ASC' | 'DESC'

/** Operadores aceptados por `filters` / `filtersOr` en la búsqueda avanzada. */
export type FilterOperator
  = | '='
    | '!='
    | '>'
    | '<'
    | '>='
    | '<='
    | 'LIKE'
    | 'ILIKE'
    | 'IN'
    | 'BETWEEN'
    | 'IS NULL'
    | 'IS NOT NULL'

export type FilterPrimitive = string | number | boolean | null

export interface FilterCondition {
  operator: FilterOperator
  value?: FilterPrimitive | FilterPrimitive[]
}

export type FilterValue
  = | FilterPrimitive
    | FilterPrimitive[]
    | FilterCondition
    | FilterCondition[]

/** Un filtro por columna. Acepta notación `relacion.campo` para JOINs. */
export type Filters = Record<string, FilterValue>

/**
 * Cuerpo del endpoint `QUERY`. Todos los campos son opcionales y cada recurso
 * valida los suyos contra sus propias whitelists (ver docs/ADVANCED_SEARCH.md).
 */
export interface AdvancedQuery {
  page?: number
  limit?: number
  search?: string
  searchFields?: string[]
  sortBy?: string | string[]
  sortOrder?: SortOrder | SortOrder[]
  fields?: string[]
  expand?: string[]
  filters?: Filters
  filtersOr?: Filters[]
  grouped?: boolean
  groupBy?: string | string[]
  groupSort?: 'group' | 'count'
  groupSortOrder?: SortOrder
  groupInnerSort?: string
  groupInnerSortOrder?: SortOrder
}
