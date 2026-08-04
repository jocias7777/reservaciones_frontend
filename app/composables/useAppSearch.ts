/** Estado compartido del buscador del header (la lupa y el atajo de teclado). */
export function useAppSearch() {
  const isOpen = useState<boolean>('app:search-open', () => false)

  return {
    isOpen,
    open: () => {
      isOpen.value = true
    },
    close: () => {
      isOpen.value = false
    }
  }
}
