import type { FetchError, FetchOptions, FetchRequest } from 'ofetch'
import type { RefreshResponse } from '~/types'

/**
 * Firma del cliente HTTP.
 *
 * Se declara sobre los tipos de `ofetch` en lugar de los de Nitro porque la API
 * usa el método HTTP `QUERY` para la búsqueda avanzada, y la unión de métodos de
 * Nitro (pensada para rutas internas) no lo incluye.
 */
export type ApiClient = <T>(request: FetchRequest, options?: FetchOptions<'json'>) => Promise<T>

/** Métodos cuyo cuerpo serializa `ofetch` por su cuenta (su lista `PayloadMethods`). */
const OFETCH_PAYLOAD_METHODS = new Set(['PATCH', 'POST', 'PUT', 'DELETE'])

/**
 * Convierte el cuerpo a JSON cuando `ofetch` no lo hace.
 *
 * `ofetch` solo serializa el cuerpo (y pone `content-type: application/json`) si
 * el método está en su lista `PayloadMethods`. La búsqueda avanzada usa `QUERY`,
 * que no está: el objeto llegaba al backend como `[object Object]` y respondía
 * 400 «El body no es JSON válido».
 */
function withSerializedBody(options?: FetchOptions<'json'>): FetchOptions<'json'> | undefined {
  const method = options?.method?.toUpperCase()
  const body = options?.body

  if (!options || !body || !method || OFETCH_PAYLOAD_METHODS.has(method)) {
    return options
  }

  // Solo objetos y arreglos planos: un FormData, Blob o URLSearchParams se envía
  // tal cual.
  const isPlainPayload = Array.isArray(body) || (typeof body === 'object' && body.constructor === Object)
  if (!isPlainPayload) {
    return options
  }

  const headers = new Headers(options.headers)
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }

  return { ...options, body: JSON.stringify(body), headers }
}

/**
 * Si el problema es del token de acceso y merece la pena renovarlo.
 *
 * Lo normal es un 401: el token caducó. Pero cuando la cookie llega rota
 * (truncada o editada a mano) el backend contesta 422, y hay que distinguirlo de
 * los 422 de validación de la propia API: flask-jwt-extended responde con su
 * formato `{ msg }` y la aplicación siempre con `{ error }`
 * (`app/utils/response.py`). Sin esa distinción, una cookie corrupta dejaba
 * todas las pantallas mostrando «422» sin forma de recuperarse.
 */
function isTokenProblem(error: unknown): boolean {
  const response = (error as FetchError<{ msg?: string, error?: string }>).response

  if (!response) return false
  if (response.status === 401) return true

  const body = response._data as { msg?: string, error?: string } | undefined
  return response.status === 422 && typeof body?.msg === 'string' && body.error === undefined
}

/**
 * Cliente HTTP único de la aplicación (patrón "custom $fetch" de la
 * documentación de Nuxt: https://nuxt.com/docs/guide/recipes/custom-usefetch).
 *
 * Responsabilidades:
 *  - añadir `Authorization: Bearer <access_token>` en cada petición;
 *  - si el token ya no sirve, renovar la sesión con `POST /auth/refresh` y
 *    reintentar UNA vez;
 *  - si la renovación falla, limpiar la sesión y mandar al login.
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  const session = useAuthSession()

  // Una sola renovación en vuelo: si varias peticiones fallan con 401 a la vez,
  // todas esperan al mismo refresh en lugar de rotar el token en paralelo (el
  // backend invalida el refresh token anterior en cada rotación).
  let refreshing: Promise<boolean> | null = null

  const http = $fetch.create({
    baseURL,
    // El refresh token ya no lo maneja este código (SEC-002): va en la cookie
    // httpOnly que pone el backend, y el navegador solo la manda si se pide
    // explícitamente. Las peticiones normales no la necesitan —solo llevan el
    // access token por cabecera— pero no está de más dejarlo consistente.
    credentials: 'include',
    onRequest({ options }) {
      if (session.accessToken.value) {
        options.headers.set('Authorization', `Bearer ${session.accessToken.value}`)
      }
    }
  }) as unknown as ApiClient

  /**
   * Renueva la sesión. Ya no hace falta comprobar si "hay" refresh token: el
   * navegador lo manda solo, en su cookie httpOnly, y si no hay ninguna el
   * backend responde 400/401 igual que antes.
   */
  async function renewSession(): Promise<boolean> {
    try {
      const response = await $fetch<RefreshResponse>('/auth/refresh', {
        baseURL,
        method: 'POST',
        credentials: 'include'
      })
      session.setTokens(response)
      return true
    } catch {
      return false
    }
  }

  function renewSessionOnce(): Promise<boolean> {
    refreshing ??= renewSession().finally(() => {
      refreshing = null
    })
    return refreshing
  }

  const api: ApiClient = async <T>(request: FetchRequest, rawOptions?: FetchOptions<'json'>) => {
    const options = withSerializedBody(rawOptions)

    try {
      return await http<T>(request, options)
    } catch (error) {
      const isAuthCall = typeof request === 'string' && request.startsWith('/auth/')

      // Ya no se puede saber de antemano si "hay" refresh token: vive en una
      // cookie httpOnly que este código no puede leer. Si no hay ninguna, o ya
      // no sirve, `renewSessionOnce` simplemente falla y cae al `session.clear()`
      // de abajo — un intento de más no tiene costo real.
      if (!isTokenProblem(error) || isAuthCall) {
        throw error
      }

      if (await renewSessionOnce()) {
        return await http<T>(request, options)
      }

      session.clear()
      if (import.meta.client) {
        const redirect = window.location.pathname + window.location.search
        await navigateTo({ path: '/login', query: { redirect } })
      }
      throw error
    }
  }

  return {
    provide: { api }
  }
})

declare module '#app' {
  interface NuxtApp {
    $api: ApiClient
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: ApiClient
  }
}
