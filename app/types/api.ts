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
