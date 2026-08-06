/**
 * Catálogo sobre el que se dibuja cualquier matriz de permisos: los módulos, las
 * acciones y las categorías que las agrupan.
 *
 * Lo usan las dos pantallas que editan permisos —la del rol y la del usuario—,
 * que antes repetían la misma carga y, con ella, la decisión de qué hacer si no
 * llegan las categorías.
 */
export function usePermissionCatalog() {
  const modulesApi = useModulesApi()
  const actionsApi = useActionsApi()
  const actionCategoriesApi = useActionCategoriesApi()

  /**
   * Se pide todo a la vez. Las categorías son lo único opcional: sin ellas la
   * matriz sigue siendo usable (las acciones caen en un único bloque), así que
   * no se deja caer la pantalla entera por eso.
   */
  async function fetchPermissionCatalog() {
    const [modules, actions, categories] = await Promise.all([
      modulesApi.list(),
      actionsApi.list(),
      actionCategoriesApi.list().catch(() => [])
    ])

    return { modules, actions, categories }
  }

  return { fetchPermissionCatalog }
}
