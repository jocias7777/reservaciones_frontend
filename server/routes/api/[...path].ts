import type { H3Event } from 'h3'

/**
 * Métodos cuyo cuerpo sí reenvía `proxyRequest` por su cuenta: son los de la
 * lista `PayloadMethods` de h3. Para el resto (aquí: `QUERY`) hay que leerlo a
 * mano, y solo para el resto: leerlo dos veces deja el flujo agotado y la
 * petición se queda colgada.
 */
const H3_PAYLOAD_METHODS = new Set(['PATCH', 'POST', 'PUT', 'DELETE'])

/** Métodos que nunca llevan cuerpo. */
const BODYLESS_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/**
 * Lee el cuerpo de la petición sin pasar por h3.
 *
 * `readRawBody` y `getRequestWebStream` rechazan con 405 cualquier método que no
 * esté en `PayloadMethods`, así que para `QUERY` se consume el flujo directamente.
 */
async function readRawBodyAnyMethod(event: H3Event): Promise<ArrayBuffer | undefined> {
  // Cuando la petición entra por la capa web (SSR interno, presets no-Node),
  // el cuerpo ya viene como Request estándar.
  const webRequest = event.web?.request
  if (webRequest) {
    const buffer = await webRequest.arrayBuffer()
    return buffer.byteLength ? buffer : undefined
  }

  const chunks: Uint8Array[] = []
  let size = 0

  for await (const chunk of event.node.req) {
    const bytes = chunk as Uint8Array
    chunks.push(bytes)
    size += bytes.byteLength
  }

  if (!size) return undefined

  const body = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  // `body` se creó con el tamaño exacto, así que su búfer es el cuerpo completo.
  return body.buffer as ArrayBuffer
}

/**
 * Puente entre el navegador y el backend Flask.
 *
 * Todo lo que el cliente pide a `/api/**` se reenvía al backend: las peticiones
 * salen del mismo origen, así que no dependen de la configuración de CORS.
 *
 * ¿Por qué un handler propio y no `routeRules: { '/api/**': { proxy } }`? Porque
 * la búsqueda avanzada usa el método `QUERY` con los filtros en el cuerpo, y el
 * proxy de h3 descarta el cuerpo de los métodos que no conoce: el backend
 * recibía la petición sin filtros y respondía con los valores por defecto.
 */
export default defineEventHandler(async (event) => {
  const { apiProxyTarget } = useRuntimeConfig(event)
  const target = `${apiProxyTarget.replace(/\/+$/, '')}${event.path}`

  const needsManualBody = !H3_PAYLOAD_METHODS.has(event.method) && !BODYLESS_METHODS.has(event.method)

  if (!needsManualBody) {
    return proxyRequest(event, target)
  }

  // `fetchOptions` tiene prioridad sobre el cuerpo que calcula `proxyRequest`.
  return proxyRequest(event, target, {
    fetchOptions: { body: await readRawBodyAnyMethod(event) }
  })
})
