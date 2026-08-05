export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate'
    },

    /**
     * `UPageHeader` viene dimensionado para portadas: título de `text-4xl`,
     * descripción de `text-lg` separada 4 y `py-8` de aire. En un panel de
     * administración se come la pantalla, así que se ajusta una sola vez aquí
     * en lugar de repetir `:ui` en cada página.
     */
    pageHeader: {
      slots: {
        root: 'border-b-0 pt-0 pb-0',
        title: 'text-xl sm:text-2xl font-semibold',
        description: 'text-[15px] mt-1'
      },
      variants: {
        title: {
          true: {
            description: 'mt-1'
          }
        }
      }
    },

    /** Los títulos de tarjeta ("Cuenta", "Perfil") acompañan al de la pantalla. */
    pageCard: {
      slots: {
        title: 'text-[17px]'
      }
    },

    /**
     * Botones un punto más grandes de lo que trae el tema (14px de texto e
     * iconos de 20px). Se ajusta el tamaño `md`, que es el que usa toda la
     * aplicación, así crecen todos por igual: texto y también iconos.
     */
    button: {
      variants: {
        size: {
          md: {
            base: 'text-[15px]',
            leadingIcon: 'size-[22px]',
            trailingIcon: 'size-[22px]'
          }
        }
      }
    }
  }
})
