import type { FetchError } from 'ofetch'

/**
 * La espera que impone el backend tras demasiados intentos seguidos.
 *
 * Los tres formularios de acceso —entrar, pedir el enlace de recuperación y
 * fijar la contraseña nueva— chocan con el mismo freno
 * (`app/services/login_throttle.py`) y lo resolvían con el mismo bloque de
 * código copiado: un `ref`, un `setInterval`, su limpieza y la lectura de
 * `reintentar_en`. Aquí vive una sola vez.
 *
 * La cuenta atrás corre en el navegador a propósito: el backend ya dijo cuántos
 * segundos faltan, así que preguntárselo otra vez solo para saber si ya se puede
 * reintentar sería gastar una petición —y encima una que el propio freno cuenta—.
 */
export function useRetryAfter() {
  const seconds = ref(0)
  let timer: ReturnType<typeof setInterval> | undefined

  function start(value: number) {
    clearInterval(timer)
    seconds.value = Math.max(0, Math.ceil(value))

    timer = setInterval(() => {
      seconds.value -= 1
      if (seconds.value <= 0) clearInterval(timer)
    }, 1000)
  }

  // Sin esto el intervalo sobrevive a la pantalla que lo creó.
  onScopeDispose(() => clearInterval(timer))

  /**
   * Arranca la espera si el error es uno de estos frenos.
   *
   * El backend responde 429 con `reintentar_en` en segundos; cualquier otro
   * error se ignora aquí y lo trata quien llama, que es el que sabe qué decir.
   */
  function noteError(error: unknown) {
    if (apiErrorStatus(error) !== 429) return

    const wait = (error as FetchError<{ reintentar_en?: number }>)?.data?.reintentar_en
    if (typeof wait === 'number') start(wait)
  }

  const blocked = computed(() => seconds.value > 0)

  /** Texto del botón de envío: el de siempre, o los segundos que faltan. */
  function submitLabel(idle: string) {
    return blocked.value ? `Espera ${seconds.value}s…` : idle
  }

  return { seconds, blocked, noteError, submitLabel }
}
