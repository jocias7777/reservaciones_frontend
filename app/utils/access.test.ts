import { describe, expect, it } from 'vitest'
import type { AccessState } from './access'
import {
  GUARDED_MODULES,
  RESTORABLE_MODULES,
  accessForRoute,
  resolveCan,
  resolveCanRestoreAny,
  resolveCanVisit
} from './access'

function state(overrides: Partial<AccessState> = {}): AccessState {
  return { granted: {}, loaded: true, source: 'declared', ...overrides }
}

describe('resolveCan', () => {
  it('concede todo mientras no se ha resuelto (loaded=false), para que el menú no parpadee', () => {
    expect(resolveCan(state({ loaded: false, granted: {} }), 'roles', 'restore')).toBe(true)
  })

  it('respeta lo que diga el mapa, esté concedido o no', () => {
    const s = state({ granted: { 'roles::restore': true, 'roles::list': false } })
    expect(resolveCan(s, 'roles', 'restore')).toBe(true)
    expect(resolveCan(s, 'roles', 'list')).toBe(false)
  })

  it('con permisos declarados por el backend, lo que no aparece es que no se tiene', () => {
    const s = state({ source: 'declared', granted: { 'roles::list': true } })
    expect(resolveCan(s, 'roles', 'restore')).toBe(false)
    expect(resolveCan(s, 'roles', 'bulk_restore')).toBe(false)
  })

  it('sondeando (sin declarar), lo que no se probó se concede: el backend cortará si no tocaba', () => {
    const s = state({ source: 'probed', granted: { 'roles::list': true } })
    expect(resolveCan(s, 'roles', 'create')).toBe(true)
  })
})

describe('resolveCanRestoreAny — caso reportado: "list" sin "restore" no debe mostrar la papelera', () => {
  it('con "list" pero sin "restore" ni "bulk_restore" en el módulo, la papelera no se ofrece', () => {
    const s = state({ granted: { 'roles::list': true, 'roles::restore': false, 'roles::bulk_restore': false } })
    expect(resolveCanRestoreAny(s, 'roles')).toBe(false)
  })

  it('con "restore" concedido (aunque falte "bulk_restore"), la papelera sí se ofrece', () => {
    const s = state({ granted: { 'roles::restore': true, 'roles::bulk_restore': false } })
    expect(resolveCanRestoreAny(s, 'roles')).toBe(true)
  })

  it('con solo "bulk_restore" concedido, la papelera también se ofrece', () => {
    const s = state({ granted: { 'roles::restore': false, 'roles::bulk_restore': true } })
    expect(resolveCanRestoreAny(s, 'roles')).toBe(true)
  })

  it('el mismo rol puede tener "restore" en un módulo y no en otro: cada módulo se decide aparte', () => {
    const s = state({
      granted: {
        'roles::list': true,
        'roles::restore': false,
        'roles::bulk_restore': false,
        'users::list': true,
        'users::restore': true,
        'users::bulk_restore': false
      }
    })

    expect(resolveCanRestoreAny(s, 'roles')).toBe(false)
    expect(resolveCanRestoreAny(s, 'users')).toBe(true)
  })
})

describe('resolveCanVisit', () => {
  it('una ruta sin requisitos (login, sin-acceso...) siempre se puede visitar', () => {
    expect(resolveCanVisit(state({ granted: {} }), '/login')).toBe(true)
  })

  it('el listado normal solo exige "list"', () => {
    const conLista = state({ granted: { 'roles::list': true } })
    const sinLista = state({ granted: { 'roles::list': false } })

    expect(resolveCanVisit(conLista, '/roles')).toBe(true)
    expect(resolveCanVisit(sinLista, '/roles')).toBe(false)
  })

  it('la papelera de un módulo exige "restore" o "bulk_restore", no "list"', () => {
    const soloLista = state({ granted: { 'roles::list': true, 'roles::restore': false, 'roles::bulk_restore': false } })
    expect(resolveCanVisit(soloLista, '/roles/papelera')).toBe(false)

    const conRestore = state({ granted: { 'roles::list': true, 'roles::restore': true } })
    expect(resolveCanVisit(conRestore, '/roles/papelera')).toBe(true)

    const soloBulk = state({ granted: { 'roles::list': true, 'roles::bulk_restore': true } })
    expect(resolveCanVisit(soloBulk, '/roles/papelera')).toBe(true)
  })

  it('la papelera de acciones cuelga de /roles/acciones pero exige el módulo "actions", no "roles"', () => {
    const s = state({ granted: { 'roles::restore': true, 'actions::restore': false, 'actions::bulk_restore': false } })
    expect(resolveCanVisit(s, '/roles/acciones/papelera')).toBe(false)
  })

  it('una ruta hermana de la papelera (crear/editar) sigue pidiendo "list", sin verse afectada', () => {
    const s = state({ granted: { 'actions::list': true, 'actions::restore': false, 'actions::bulk_restore': false } })
    expect(resolveCanVisit(s, '/roles/acciones/nueva')).toBe(true)
  })
})

describe('accessForRoute — especificidad de prefijos', () => {
  it('la ruta de papelera de un módulo resuelve contra ese módulo con ["restore","bulk_restore"], no contra el listado', () => {
    const cases: Array<[string, string]> = [
      ['/usuarios/papelera', 'users'],
      ['/roles/papelera', 'roles'],
      ['/roles/acciones/papelera', 'actions'],
      ['/roles/categorias/papelera', 'action_categories']
    ]

    for (const [path, module] of cases) {
      const resolved = accessForRoute(path)
      expect(resolved?.module).toBe(module)
      expect(resolved?.action).toEqual(['restore', 'bulk_restore'])
    }
  })

  it('las rutas normales de esos mismos módulos siguen pidiendo "list"', () => {
    expect(accessForRoute('/usuarios')).toEqual({ prefix: '/usuarios', module: 'users', action: 'list' })
    expect(accessForRoute('/roles')).toEqual({ prefix: '/roles', module: 'roles', action: 'list' })
  })
})

describe('módulos con papelera', () => {
  it('RESTORABLE_MODULES son justo los que declaran una ruta de papelera, ni más ni menos', () => {
    expect([...RESTORABLE_MODULES].sort()).toEqual(['action_categories', 'actions', 'roles', 'users'])
  })

  it('todo módulo con papelera también está entre los módulos con listado guardado', () => {
    for (const module of RESTORABLE_MODULES) {
      expect(GUARDED_MODULES).toContain(module)
    }
  })
})
