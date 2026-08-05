import type { FetchError } from 'ofetch'
import type { ApiErrorBody } from '~/types'

/**
 * Extrae el mensaje de error del backend, que siempre responde `{ error: '...' }`
 * (`app/utils/response.py`). Si la petición no llegó a responder, devuelve
 * `fallback`.
 */
export function apiErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  const fetchError = error as FetchError<ApiErrorBody>
  const body = fetchError?.data

  if (body && typeof body.error === 'string' && body.error.length) {
    return body.error
  }

  const status = fetchError?.response?.status

  if (status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.'
  if (status === 403) return 'No tienes permisos para realizar esta acción.'
  if (status === 404) return 'El recurso solicitado no existe.'
  if (status === 422) return 'Los datos enviados no son válidos.'

  if (error instanceof Error && error.message) return error.message

  return fallback
}

/** Código HTTP de un error de `$fetch`, si lo hubo. */
export function apiErrorStatus(error: unknown): number | undefined {
  return (error as FetchError)?.response?.status
}

/**
 * Los endpoints `GET /<recurso>` del backend responden 404 con un mensaje del
 * tipo "No hay X registrados" cuando la tabla está vacía, en lugar de una lista
 * vacía. Para un listado eso es un caso normal, no un error: se traduce a `[]`.
 */
export async function listOrEmpty<T>(promise: Promise<T[]>): Promise<T[]> {
  try {
    return await promise
  } catch (error) {
    if (apiErrorStatus(error) === 404) return []
    throw error
  }
}
