import type { Action, ApiEnvelope } from '~/types'

/**
 * `app/routes/action_routes.py` (`/actions`).
 *
 * Catálogo de solo lectura: son las acciones que reconoce
 * `require_permission(modulo, accion)` en el backend y las que alimentan los
 * interruptores de la matriz de permisos. Se protege con el módulo `permissions`.
 */
export function useActionsApi() {
  const api = useApi()

  return {
    /** `GET /actions` — catálogo completo. */
    list: () => listOrEmpty(unwrap(api<ApiEnvelope<Action[]>>('/actions')))
  }
}
