import type {
  ActionCategory,
  AdvancedQuery,
  ApiEnvelope,
  CreateActionCategoryPayload,
  PaginatedResult,
  SelectOptionsParams,
  SelectOptionsResult,
  UpdateActionCategoryPayload
} from '~/types'

export function useActionCategoriesApi() {
  const api = useApi()

  /** `QUERY /action-categories` — búsqueda avanzada. Expand disponible: `actions`. Exige `list`. */
  const query = (query: AdvancedQuery = {}) =>
    unwrap(api<ApiEnvelope<PaginatedResult<ActionCategory>>>('/action-categories', {
      method: 'QUERY',
      body: query
    }))

  return {
    /**
     * Catálogo completo, base de los bloques de la matriz de permisos. Va por
     * `QUERY` porque hacen falta `description`, `icon` y `sort_order`, y
     * `GET /action-categories` responde opciones de combo. Exige `list`.
     */
    list: () => listOrEmpty(fetchAllPages(query, { sortBy: 'sort_order', sortOrder: 'ASC' })),

    /** `GET /action-categories?q=&limit=` — opciones para un desplegable. Exige `select`. */
    options: (params: SelectOptionsParams = {}) =>
      unwrap(api<ApiEnvelope<SelectOptionsResult>>('/action-categories', { query: params })),

    query,

    /** `GET /action-categories/:id`. */
    get: (id: string) => unwrap(api<ApiEnvelope<ActionCategory>>(`/action-categories/${id}`)),

    /** `POST /action-categories`. */
    create: (payload: CreateActionCategoryPayload) =>
      unwrap(api<ApiEnvelope<ActionCategory>>('/action-categories', { method: 'POST', body: payload })),

    /** `PUT /action-categories/:id`. */
    update: (id: string, payload: UpdateActionCategoryPayload) =>
      unwrap(api<ApiEnvelope<ActionCategory>>(`/action-categories/${id}`, { method: 'PUT', body: payload })),

    /** `DELETE /action-categories/:id` — borrado lógico. Responde `data: null`. */
    remove: (id: string) =>
      unwrap(api<ApiEnvelope<null>>(`/action-categories/${id}`, { method: 'DELETE' })),

    /** `DELETE /action-categories/bulk` — borrado lógico masivo. */
    bulkRemove: (ids: string[]) =>
      unwrap(api<ApiEnvelope<null>>('/action-categories/bulk', { method: 'DELETE', body: { ids } })),

    /** `QUERY /action-categories/trash` — la papelera: mismos filtros, expand y paginación que el listado. */
    trash: (query: AdvancedQuery = {}) =>
      unwrap(api<ApiEnvelope<PaginatedResult<ActionCategory>>>('/action-categories/trash', {
        method: 'QUERY',
        body: query
      })),

    /** `POST /action-categories/:id/restore` — saca la categoría de la papelera. Responde `data: null`. */
    restore: (id: string) =>
      unwrap(api<ApiEnvelope<null>>(`/action-categories/${id}/restore`, { method: 'POST' })),

    /** `POST /action-categories/bulk/restore` — restauración masiva. Responde `data: null`. */
    bulkRestore: (ids: string[]) =>
      unwrap(api<ApiEnvelope<null>>('/action-categories/bulk/restore', { method: 'POST', body: { ids } }))
  }
}
