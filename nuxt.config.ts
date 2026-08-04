// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Backend Flask al que reenvía `server/routes/api/[...path].ts`. Solo lo ve
    // el servidor: el navegador nunca llama directamente al backend, por lo que
    // no hace falta configurar CORS.
    apiProxyTarget: process.env.NUXT_API_PROXY_TARGET || 'http://127.0.0.1:5000',

    public: {
      // Prefijo de la API tal como lo ve el navegador.
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
    }
  },

  routeRules: {
    // La raíz redirige al panel (ver `middleware/auth.global.ts`); la portada de
    // la plantilla se conserva en /plantilla y sigue siendo estática.
    '/plantilla': { prerender: true }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
