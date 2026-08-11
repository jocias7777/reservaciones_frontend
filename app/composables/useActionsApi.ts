import type {
  Action,
  AdvancedQuery,
  ApiEnvelope,
  CreateActionPayload,
  PaginatedResult,
  SelectOptionsParams,
  SelectOptionsResult,
  UpdateActionPayload
} from '~/types'

/**
 * `app/routes/action_routes.py` (`/actions`).
 *
 * Catálogo de acciones: son las que reconoce `require_permission(modulo, accion)`
 * en el backend y las que alimentan los interruptores de la matriz de permisos.
 * Se protege con el módulo `permissions`.
 *
 * Se pueden dar de alta, con la misma salvedad que los módulos: una acción nueva
 * no restringe nada hasta que algún endpoint se proteja con su `code`.
 */
export function useActionsApi() {
  const api = useApi()

  /** `QUERY /actions` — búsqueda avanzada. Expand disponible: `category`. Exige `list`. */
  const query = (query: AdvancedQuery = {}) =>
    unwrap(api<ApiEnvelope<PaginatedResult<Action>>>('/actions', { method: 'QUERY', body: query }))

  return {
    /**
     * Catálogo completo de acciones. Va por `QUERY` porque la matriz necesita
     * `code` y `category_id` de cada una, y `GET /actions` responde opciones de
     * combo (`{ label, value }`). Exige la acción `list`.
     */
    list: () => listOrEmpty(fetchAllPages(query)),

    /** `GET /actions?q=&limit=` — opciones para un desplegable. Exige `select`. */
    options: (params: SelectOptionsParams = {}) =>
      unwrap(api<ApiEnvelope<SelectOptionsResult>>('/actions', { query: params })),

    query,

    /** `GET /actions/:id`. */
    get: (id: string) => unwrap(api<ApiEnvelope<Action>>(`/actions/${id}`)),

    /** `POST /actions`. */
    create: (payload: CreateActionPayload) =>
      unwrap(api<ApiEnvelope<Action>>('/actions', { method: 'POST', body: payload })),

    /** `PUT /actions/:id`. */
    update: (id: string, payload: UpdateActionPayload) =>
      unwrap(api<ApiEnvelope<Action>>(`/actions/${id}`, { method: 'PUT', body: payload })),

    /**
     * `DELETE /actions/:id` — borrado lógico. Responde `data: null`.
     *
     * El backend responde 409 si la acción está concedida en algún permiso: hay
     * que quitarla de ahí antes de poder eliminarla.
     */
    remove: (id: string) => unwrap(api<ApiEnvelope<null>>(`/actions/${id}`, { method: 'DELETE' })),

    /** `DELETE /actions/bulk` — borrado lógico masivo (todo o nada). */
    bulkRemove: (ids: string[]) =>
      unwrap(api<ApiEnvelope<null>>('/actions/bulk', { method: 'DELETE', body: { ids } })),

    /** `QUERY /actions/trash` — la papelera: mismos filtros, expand y paginación que el listado. */
    trash: (query: AdvancedQuery = {}) =>
      unwrap(api<ApiEnvelope<PaginatedResult<Action>>>('/actions/trash', { method: 'QUERY', body: query })),

    /** `POST /actions/:id/restore` — saca la acción de la papelera. Responde `data: null`. */
    restore: (id: string) => unwrap(api<ApiEnvelope<null>>(`/actions/${id}/restore`, { method: 'POST' })),

    /** `POST /actions/bulk/restore` — restauración masiva. Responde `data: null`. */
    bulkRestore: (ids: string[]) =>
      unwrap(api<ApiEnvelope<null>>('/actions/bulk/restore', { method: 'POST', body: { ids } }))
  }
}
