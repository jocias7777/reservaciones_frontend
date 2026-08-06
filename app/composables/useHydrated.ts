/**
 * `false` mientras pinta el servidor y en el primer render del cliente; `true`
 * a partir del montaje.
 *
 * Las pantallas piden sus datos solo en el navegador (`server: false`), así que
 * el servidor pinta siempre el estado "sin cargar" y el cliente empezaba a
 * cargar antes de hidratar: Vue veía dos árboles distintos y avisaba de un
 * desajuste de hidratación. Con esto el primer render del cliente es idéntico
 * al del servidor y el indicador de carga aparece justo después.
 */
export function useHydrated() {
  const hydrated = ref(false)

  onMounted(() => {
    hydrated.value = true
  })

  return hydrated
}

/**
 * El `status` de un `useAsyncData`, contado como "cargando" solo a partir del
 * montaje: es la forma de pintar esqueletos e indicadores sin desajustar la
 * hidratación.
 */
export function usePendingAfterHydration(status: MaybeRefOrGetter<string>) {
  const hydrated = useHydrated()

  return computed(() => hydrated.value && toValue(status) === 'pending')
}
