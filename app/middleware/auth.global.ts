/** Rutas que no exigen sesión: el acceso y la demo de la plantilla. */
const PUBLIC_ROUTES = new Set(['/login', '/plantilla'])

/** Con sesión pero sin permisos, esta es la única pantalla que queda. */
const NO_ACCESS_ROUTE = '/sin-acceso'

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated } = useAuthSession()
  const access = useAccessControl()

  // La raíz es la entrada al panel, no una portada.
  if (to.path === '/') {
    if (!isAuthenticated.value) return navigateTo('/login')

    await access.ensureLoaded()
    return navigateTo(access.firstAllowedRoute.value ?? NO_ACCESS_ROUTE)
  }

  if (PUBLIC_ROUTES.has(to.path)) {
    // Con sesión activa, el login no aporta nada: al panel.
    if (to.path === '/login' && isAuthenticated.value) {
      return navigateTo('/')
    }
    return
  }

  if (!isAuthenticated.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  /**
   * Con sesión, además hay que poder entrar.
   *
   * Antes bastaba con estar identificado: cualquiera llegaba a cualquier
   * pantalla y solo se enteraba de que no le correspondía cuando ya estaba
   * montada y sus peticiones respondían 403, dejando una tabla vacía bajo un
   * error rojo. Se pregunta antes y se le manda a algo que sí pueda abrir.
   */
  await access.ensureLoaded()

  if (to.path === NO_ACCESS_ROUTE) {
    // Ya no está encerrado: si recupera permisos, esta pantalla sobra.
    const destination = access.firstAllowedRoute.value
    return destination ? navigateTo(destination) : undefined
  }

  if (!access.canVisit(to.path)) {
    return navigateTo(access.firstAllowedRoute.value ?? NO_ACCESS_ROUTE)
  }
})
