import type {
  Action,
  AdvancedQuery,
  ApiEnvelope,
  CreateActionPayload,
  PaginatedResult,
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

  return {
    /** `GET /actions` — catálogo completo. */
    list: () => listOrEmpty(unwrap(api<ApiEnvelope<Action[]>>('/actions'))),

    /** `QUERY /actions` — búsqueda avanzada. Expand disponible: `category`. */
    query: (query: AdvancedQuery = {}) =>
      unwrap(api<ApiEnvelope<PaginatedResult<Action>>>('/actions', { method: 'QUERY', body: query })),

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
      unwrap(api<ApiEnvelope<null>>('/actions/bulk', { method: 'DELETE', body: { ids } }))
  }
}
