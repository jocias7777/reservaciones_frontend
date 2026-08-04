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
        title: 'text-[26px] sm:text-[32px] font-semibold',
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
     * Los módulos del header (Usuarios y Roles) van en negro también cuando no
     * son la pantalla actual: el tema los deja en `text-muted` con el icono en
     * `text-dimmed`, y ahí se leían grises. El verde se reserva para el activo.
     */
    navigationMenu: {
      variants: {
        active: {
          false: {
            link: 'text-highlighted',
            linkLeadingIcon: 'text-highlighted'
          }
        }
      }
    }
  }
})
