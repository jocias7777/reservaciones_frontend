import { defineConfig } from 'vitest/config'

/**
 * Solo cubre lógica pura (composables/utils sin runtime de Nuxt de por medio),
 * así que no hace falta el entorno de Nuxt para las pruebas: un Node normal
 * basta y arranca al instante.
 */
export default defineConfig({
  test: {
    include: ['app/**/*.test.ts']
  }
})
