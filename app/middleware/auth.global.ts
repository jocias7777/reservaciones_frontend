/** Rutas que no exigen sesión: el acceso y la demo de la plantilla. */
const PUBLIC_ROUTES = new Set(['/login', '/plantilla'])

export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuthSession()

  // La raíz es la entrada al panel, no una portada.
  if (to.path === '/') {
    return navigateTo(isAuthenticated.value ? '/usuarios' : '/login')
  }

  if (PUBLIC_ROUTES.has(to.path)) {
    // Con sesión activa, el login no aporta nada: al panel.
    if (to.path === '/login' && isAuthenticated.value) {
      return navigateTo('/usuarios')
    }
    return
  }

  if (!isAuthenticated.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
