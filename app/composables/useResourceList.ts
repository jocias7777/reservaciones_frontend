import type { AdvancedQuery, Filters, PaginatedResult, SortOrder } from '~/types'

export interface UseResourceListOptions<T> {
  /** Clave de `useAsyncData`; debe ser única por pantalla. */
  key: string
  /** Normalmente `useXxxApi().query`. */
  fetcher: (query: AdvancedQuery) => Promise<PaginatedResult<T>>
  limit?: number
  sortBy?: string
  sortOrder?: SortOrder
  /** Columnas donde buscar el texto libre (whitelist del recurso en el backend). */
  searchFields?: string[]
  /** Relaciones a traer con la respuesta. */
  expand?: string[]
  /** Filtros fijos o reactivos que se envían junto a la búsqueda. */
  filters?: MaybeRefOrGetter<Filters | undefined>
  /** Milisegundos de espera antes de disparar la búsqueda al teclear. */
  searchDelay?: number
}

/**
 * Estado de un listado paginado sobre el endpoint `QUERY` de un recurso:
 * página, tamaño, texto de búsqueda (con retardo) y orden.
 *
 * Los datos se piden solo en el cliente: la API necesita el token de sesión y
 * la llamada sale contra una URL relativa que solo existe en el navegador.
 */
export function useResourceList<T>(options: UseResourceListOptions<T>) {
  const page = ref(1)
  const limit = ref(options.limit ?? 10)
  const sortBy = ref(options.sortBy ?? 'created_at')
  const sortOrder = ref<SortOrder>(options.sortOrder ?? 'DESC')

  /** Lo que escribe el usuario. */
  const searchInput = ref('')
  /** Lo que se envía al backend (con retardo, para no pedir en cada tecla). */
  const search = ref('')

  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  watch(searchInput, (value) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      search.value = value.trim()
      page.value = 1
    }, options.searchDelay ?? 350)
  })

  onScopeDispose(() => clearTimeout(debounceTimer))

  // Volver a la primera página cuando cambia el tamaño o los filtros: pedir la
  // página 7 de un resultado que ahora tiene 2 devolvería una lista vacía.
  watch([limit, () => toValue(options.filters)], () => {
    page.value = 1
  })

  const query = computed<AdvancedQuery>(() => {
    const filters = toValue(options.filters)

    return {
      page: page.value,
      limit: limit.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      ...(search.value ? { search: search.value } : {}),
      ...(search.value && options.searchFields?.length ? { searchFields: options.searchFields } : {}),
      ...(options.expand?.length ? { expand: options.expand } : {}),
      ...(filters && Object.keys(filters).length ? { filters } : {})
    }
  })

  const empty: PaginatedResult<T> = {
    items: [],
    total: 0,
    page: 1,
    limit: limit.value,
    pages: 0,
    grouped: false,
    groupBy: null
  }

  const { data, status, error, refresh } = useAsyncData(
    options.key,
    () => options.fetcher(query.value),
    {
      watch: [query],
      server: false,
      default: () => empty
    }
  )

  const items = computed<T[]>(() => data.value?.items ?? [])
  const total = computed(() => data.value?.total ?? 0)
  const pending = usePendingAfterHydration(status)
  /** Hay filtros activos: distingue "no hay nada" de "no hay resultados". */
  const isFiltered = computed(() => Boolean(search.value))

  return {
    page,
    limit,
    searchInput,
    items,
    total,
    error,
    pending,
    isFiltered,
    refresh
  }
}
