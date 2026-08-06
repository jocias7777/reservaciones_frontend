export interface UsePermissionSelectionOptions {
  /** Parámetro de la URL donde viaja lo elegido: `rol` o `usuario`. */
  queryKey: string
  /** Cómo se nombra lo elegido en las preguntas: «rol», «usuario». */
  noun: string
  /** Si la matriz tiene cambios sin guardar. */
  isDirty: MaybeRefOrGetter<boolean>
}

/**
 * Qué rol o qué usuario se está editando en una pantalla de permisos.
 *
 * Lo elegido viaja en la URL (`?rol=…`, `?usuario=…`): así la pantalla se puede
 * compartir, aguanta un F5 y las flechas del navegador funcionan; el selector es
 * solo la forma de cambiarlo.
 *
 * Además protege lo que no se ha guardado: cambiar de rol o de usuario descarta
 * la edición en curso, y salir de la pantalla también, así que en ambos casos se
 * pregunta antes.
 */
export function usePermissionSelection(options: UsePermissionSelectionOptions) {
  const route = useRoute()
  const router = useRouter()

  const selectedId = computed({
    get: () => {
      const value = route.query[options.queryKey]
      return typeof value === 'string' ? value : ''
    },
    set: (value: string) => {
      router.replace({ query: value ? { [options.queryKey]: value } : {} })
    }
  })

  /**
   * Lo que ve y escribe el selector. Si hay cambios sin guardar se pregunta; al
   * cancelar no se toca nada y el selector se queda como estaba.
   */
  const picked = computed({
    get: () => selectedId.value,
    set: (value: string) => {
      if (value === selectedId.value) return

      if (toValue(options.isDirty)
        && !window.confirm(`Hay cambios sin guardar en este ${options.noun}. ¿Cambiar de ${options.noun} y descartarlos?`)) {
        return
      }

      selectedId.value = value
    }
  })

  onBeforeRouteLeave(() => {
    if (!toValue(options.isDirty)) return true
    return window.confirm('Hay cambios de permisos sin guardar. ¿Salir de todos modos?')
  })

  return { selectedId, picked }
}
