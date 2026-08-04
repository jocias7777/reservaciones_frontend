/** Formateadores compartidos por las vistas. */

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
})

export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

/** `2026-08-04T00:00:00` → `2026-08-04`, que es lo que espera `<input type="date">`. */
export function toDateInputValue(value?: string | null): string {
  if (!value) return ''
  return value.slice(0, 10)
}

/**
 * Edad cumplida a partir de la fecha de nacimiento. Devuelve `null` si la fecha
 * está vacía, es inválida o cae en el futuro.
 */
export function ageFromBirthDate(value?: string | null): number | null {
  if (!value) return null

  const birth = new Date(value)
  if (Number.isNaN(birth.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }

  return age >= 0 && age < 150 ? age : null
}

/** Nombre completo del perfil, o `null` si no hay datos. */
export function fullName(profile?: { name?: string | null, last_name?: string | null } | null): string | null {
  const value = [profile?.name, profile?.last_name].filter(Boolean).join(' ').trim()
  return value.length ? value : null
}

/** Iniciales para el avatar: del nombre si existe, del correo si no. */
export function initials(source?: string | null): string {
  if (!source) return '?'

  const parts = source.trim().split(/[\s@._-]+/).filter(Boolean)
  const letters = parts.slice(0, 2).map(part => part[0] ?? '').join('')

  return (letters || source[0] || '?').toUpperCase()
}
