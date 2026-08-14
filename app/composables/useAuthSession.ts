import type { SessionUser } from '~/types'

const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30 // 30 días, igual que el refresh token del backend

/**
 * Estado crudo de la sesión: access token + usuario. No habla con la API (de
 * eso se encarga `useAuth`), así el plugin `$api` puede leer el token sin
 * crear una dependencia circular.
 *
 * El refresh token YA NO pasa por aquí (SEC-002): el backend lo entrega en una
 * cookie httpOnly (`rsv_refresh_token`, ver `app/main/routes.py`) que ni este
 * código ni un XSS pueden leer — el navegador la manda solo, y solo hacia
 * `/auth/*`. Es el secreto de 30 días; sacarlo de JS es lo que de verdad
 * importa.
 *
 * El access token SÍ sigue en cookie (no httpOnly): expira en una hora, así
 * que el margen de un XSS es mucho más chico, y mantenerlo en cookie es lo que
 * permite al middleware decidir el redirect también durante el render en
 * servidor sin una restauración aparte. Moverlo a memoria pura habría exigido
 * repetir esa restauración en cada arranque SSR; no vale el riesgo sin poder
 * probarlo en un navegador real.
 */
export function useAuthSession() {
  const remember = useCookie<boolean>('rsv_remember', {
    default: () => false,
    sameSite: 'lax',
    maxAge: REMEMBER_MAX_AGE
  })

  const cookieOptions = () => ({
    sameSite: 'lax' as const,
    secure: import.meta.env.PROD,
    // Sin `maxAge` la cookie muere al cerrar el navegador: es justo lo que
    // significa no marcar "Mantener la sesión abierta".
    ...(remember.value ? { maxAge: REMEMBER_MAX_AGE } : {})
  })

  /**
   * Guarda el access token con las opciones de ESTE momento.
   *
   * `useCookie` congela sus opciones al crear la referencia, y "Mantener la
   * sesión abierta" se marca en el mismo formulario de acceso: la referencia de
   * lectura ya existía cuando se elige, así que escribir por ella dejaba
   * siempre una cookie de sesión y la casilla no servía de nada. Por eso aquí
   * se pide una referencia nueva solo para escribir.
   */
  function writeToken(value: string | null) {
    useCookie<string | null>('rsv_access_token', cookieOptions()).value = value
  }

  // `watch: false`: esta referencia mantiene el estado en memoria (de ahí sale
  // `isAuthenticated`) pero no reescribe la cookie por su cuenta, que es
  // trabajo de `writeToken` y de sus opciones al día.
  const accessToken = useCookie<string | null>('rsv_access_token', {
    default: () => null,
    watch: false
  })

  const user = useState<SessionUser | null>('auth:user', () => null)

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  function setTokens(tokens: { access_token: string }) {
    writeToken(tokens.access_token)
    accessToken.value = tokens.access_token
  }

  function clear() {
    writeToken(null)
    accessToken.value = null
    user.value = null
  }

  return {
    accessToken,
    remember,
    user,
    isAuthenticated,
    setTokens,
    clear
  }
}
