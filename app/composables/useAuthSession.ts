import type { SessionUser } from '~/types'

const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30 // 30 días, igual que el refresh token del backend

/**
 * Estado crudo de la sesión: tokens + usuario. No habla con la API (de eso se
 * encarga `useAuth`), así el plugin `$api` puede leer los tokens sin crear una
 * dependencia circular.
 *
 * Los tokens viven en cookies (no `localStorage`) para que el middleware pueda
 * decidir el redirect también durante el render en servidor.
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

  const accessToken = useCookie<string | null>('rsv_access_token', {
    default: () => null,
    ...cookieOptions()
  })

  const refreshToken = useCookie<string | null>('rsv_refresh_token', {
    default: () => null,
    ...cookieOptions()
  })

  const user = useState<SessionUser | null>('auth:user', () => null)

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  function setTokens(tokens: { access_token: string, refresh_token?: string }) {
    accessToken.value = tokens.access_token
    if (tokens.refresh_token) {
      refreshToken.value = tokens.refresh_token
    }
  }

  function clear() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
  }

  return {
    accessToken,
    refreshToken,
    remember,
    user,
    isAuthenticated,
    setTokens,
    clear
  }
}
