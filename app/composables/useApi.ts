import type { ApiClient } from '~/plugins/api'
import type { ApiEnvelope } from '~/types'

/** Cliente HTTP con la sesión ya resuelta (ver `app/plugins/api.ts`). */
export function useApi(): ApiClient {
  return useNuxtApp().$api
}

/**
 * Quita el envoltorio `{ data, message }` con el que responde el backend.
 * Los composables de cada recurso lo usan para devolver datos limpios.
 */
export async function unwrap<T>(promise: Promise<ApiEnvelope<T>>): Promise<T> {
  const response = await promise
  return response.data
}
