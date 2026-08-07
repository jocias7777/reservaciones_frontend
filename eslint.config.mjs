// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Los skills de agentes instalados con `npx skills add` traen sus propios
  // scripts .mjs, escritos con otro estilo. No son código de la aplicación y no
  // se corrigen aquí.
  {
    ignores: ['.claude/**', '.agents/**']
  }
)
