import type { FetchError } from 'ofetch'
import type { ApiClient } from '~/plugins/api'
import type { AdvancedQuery, ApiEnvelope, BulkWriteResult, PaginatedResult } from '~/types'

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

/** Límite máximo de `limit` que acepta `AdvancedQuerySchema` en el backend. */
export const MAX_QUERY_LIMIT = 100

/**
 * Recorre la paginación de un endpoint `QUERY` y devuelve el catálogo entero.
 *
 * Hace falta porque `GET /<recurso>` dejó de servir para esto: ahora responde
 * opciones de combo (`{ label, value }`), no los registros. Lo que necesita el
 * catálogo completo —la matriz de permisos, la auditoría de módulos— son los
 * campos de verdad, y esos solo salen por `QUERY`.
 *
 * Se pide de 100 en 100, que es el tope del backend.
 */
export async function fetchAllPages<T>(
  fetcher: (query: AdvancedQuery) => Promise<PaginatedResult<T>>,
  query: AdvancedQuery = {}
): Promise<T[]> {
  const rows: T[] = []
  let page = 1
  let hasMorePages = true

  while (hasMorePages) {
    const result = await fetcher({ ...query, page, limit: MAX_QUERY_LIMIT })

    rows.push(...result.items)
    hasMorePages = page < (result.pages || 1)
    page += 1
  }

  return rows
}

/**
 * Llama a un endpoint de escritura masiva (`.../bulk/create` o `.../bulk/update`).
 *
 * El backend valida el formato de todos los elementos antes de tocar la base
 * —eso sí corta la petición entera, con un 400 sin envoltorio `data`— pero los
 * choques de negocio (un duplicado, una fila que ya no existe) no cancelan el
 * lote: se procesan uno por uno y el resultado sale siempre en el cuerpo,
 * incluso cuando fallan TODOS. Ahí el código es 400 en vez de 201/200/207, así
 * que `ofetch` lo trata como una excepción de red aunque traiga el desglose
 * completo. Esta función deshace ese entuerto: si lo que llegó tiene forma de
 * resultado de bulk, se devuelve como tal en vez de dejarlo escapar como error.
 */
export async function bulkWrite<Item>(
  api: ApiClient,
  endpoint: string,
  method: 'POST' | 'PUT',
  items: Item[]
): Promise<BulkWriteResult> {
  try {
    return await unwrap(api<ApiEnvelope<BulkWriteResult>>(endpoint, { method, body: { items } }))
  } catch (error) {
    const body = (error as FetchError<ApiEnvelope<BulkWriteResult>>)?.data

    if (body?.data && typeof body.data === 'object' && 'errores' in body.data) {
      return body.data
    }

    throw error
  }
}
