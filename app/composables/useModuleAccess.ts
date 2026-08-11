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
 * (`action: 'restore'`) para que entre en `RESTORABLE_MODULES`. Sin esas
 * filas, `useAccessControl` no sabe que tiene que sondear esas acciones y las
 * concede por defecto — el mismo hueco que tenía la papelera antes de
 * arreglarlo, así que no te lo saltes al copiar el patrón de un módulo
 * existente para uno nuevo.
 */
export function useModuleAccess(module: string) {
  const access = useAccessControl()

  /**
   * `restore` (una fila) y `bulk_restore` (varias) son permisos aparte en el
   * backend, y dentro de la papelera cada botón exige el suyo: el de cada
   * fila necesita `restore` y el de "Restaurar masivo" necesita
   * `bulk_restore`, sin mezclarlos.
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
    /**
     * Si vale la pena ofrecer el botón "Papelera" del listado.
     *
     * Depende solo de `restore`, no de `bulk_restore`: sin `restore` no hay
     * ninguna fila que recuperar una por una dentro de la papelera, así que
     * abrirla solo por tener `bulk_restore` no serviría de nada.
     */
    canRestore: canRestoreOne
  }
}
