/**
 * Los indicadores de permiso de una pantalla de listado con Agregar, Editar,
 * Eliminar (uno o en lote) y papelera.
 *
 * Los cuatro listados actuales (usuarios, roles, acciones, categorías de
 * acciones) calculaban esto mismo por su cuenta, cinco `computed` repetidos en
 * cada pantalla. Vive aquí para que agregar un listado nuevo con estos mismos
 * botones sea una línea —`useModuleAccess('modulo_nuevo')`— en vez de volver a
 * copiar esos cinco `computed`.
 *
 * Que de verdad se calculen bien depende de que el módulo tenga sus rutas
 * declaradas en `ROUTE_ACCESS` (`app/utils/access.ts`): la de alta
 * (`action: 'create'`) para que entre en `MANAGED_MODULES`, y la de papelera
 * (`action: ['restore', 'bulk_restore']`) para que entre en
 * `RESTORABLE_MODULES`. Sin esas filas, `useAccessControl` no sabe que tiene
 * que sondear esas acciones y las concede por defecto — el mismo hueco que
 * tenía la papelera antes de arreglarlo, así que no te lo saltes al copiar el
 * patrón de un módulo existente para uno nuevo.
 */
export function useModuleAccess(module: string) {
  const access = useAccessControl()

  /**
   * `restore` (una fila) y `bulk_restore` (varias) por separado: dentro de la
   * papelera cada botón exige el suyo —el de cada fila no sirve de nada si
   * falta `restore`, aunque sí haya `bulk_restore`, y viceversa con el de
   * "Restaurar" en lote—, así que hace falta saberlos aparte y no solo la
   * combinación que decide si vale la pena ofrecer la papelera.
   */
  const canRestoreOne = computed(() => access.can(module, 'restore'))
  const canRestoreMany = computed(() => access.can(module, 'bulk_restore'))

  return {
    canCreate: computed(() => access.can(module, 'create')),
    canUpdate: computed(() => access.can(module, 'update')),
    canDelete: computed(() => access.can(module, 'delete')),
    canBulkDelete: computed(() => access.can(module, 'bulk_delete')),
    canRestoreOne,
    canRestoreMany,
    /** Si vale la pena ofrecer el botón "Papelera" del listado: con cualquiera de los dos ya sirve. */
    canRestore: computed(() => canRestoreOne.value || canRestoreMany.value)
  }
}
