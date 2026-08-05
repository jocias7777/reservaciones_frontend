import type {
  ActionCategory,
  AdvancedQuery,
  ApiEnvelope,
  CreateActionCategoryPayload,
  PaginatedResult,
  UpdateActionCategoryPayload
} from '~/types'

/**
 * Categorías de acciones — `app/routes/action_category_routes.py`
 * (`/action-categories`, tabla `sa_category_permissions`).
 *
 * Son los bloques con los que se reparten las acciones dentro de la tarjeta de
 * cada módulo. Se protegen con el módulo `permissions`, igual que el catálogo de
 * acciones. Como en el resto de la interfaz, el borrado definitivo del backend
 * no se expone: aquí solo se hace borrado lógico.
 */
export function useActionCategoriesApi() {
  const api = useApi()

  return {
    /** `GET /action-categories` — catálogo completo, base de la matriz de permisos. */
    list: () => listOrEmpty(unwrap(api<ApiEnvelope<ActionCategory[]>>('/action-categories'))),

    /** `QUERY /action-categories` — búsqueda avanzada. Expand disponible: `actions`. */
    query: (query: AdvancedQuery = {}) =>
      unwrap(api<ApiEnvelope<PaginatedResult<ActionCategory>>>('/action-categories', {
        method: 'QUERY',
        body: query
      })),

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
      unwrap(api<ApiEnvelope<null>>('/action-categories/bulk', { method: 'DELETE', body: { ids } }))
  }
}
