import { describe, expect, it } from 'vitest'
import type { AccessState } from './access'
import {
  GUARDED_MODULES,
  MANAGED_MODULES,
  RESTORABLE_MODULES,
  ROUTE_ACCESS,
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

  it('el formulario de alta exige "create", no "list": tener acceso al listado no basta para entrar a darlo de alta', () => {
    const soloLista = state({ granted: { 'actions::list': true, 'actions::create': false } })
    expect(resolveCanVisit(soloLista, '/roles/acciones/nueva')).toBe(false)

    const conCrear = state({ granted: { 'actions::list': true, 'actions::create': true } })
    expect(resolveCanVisit(conCrear, '/roles/acciones/nueva')).toBe(true)
  })

  it('una edición por id sigue cayendo en el listado del módulo (no hay ruta propia por id)', () => {
    const s = state({ granted: { 'roles::list': true, 'roles::update': false } })
    // No hay forma de distinguir un id real de otro segmento por prefijo, así
    // que la ficha de edición todavía depende de "list": el botón de "Editar"
    // dentro del listado es quien de verdad exige "update" (ver los tests de
    // las páginas). Aquí solo se confirma que no quedó atrapada por error en
    // alguna de las rutas literales nuevas ("nuevo", "papelera").
    expect(resolveCanVisit(s, '/roles/9c6c9e2e-1234-4abc-8def-000000000001')).toBe(true)
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

  it('el formulario de alta de cada módulo resuelve contra ese módulo con "create", no con el listado', () => {
    const cases: Array<[string, string]> = [
      ['/usuarios/nuevo', 'users'],
      ['/roles/nuevo', 'roles'],
      ['/roles/acciones/nueva', 'actions'],
      ['/roles/categorias/nueva', 'action_categories']
    ]

    for (const [path, module] of cases) {
      expect(accessForRoute(path)).toEqual({ prefix: path, module, action: 'create' })
    }
  })
})

describe('módulos con listado y formulario completos', () => {
  it('MANAGED_MODULES sale de ROUTE_ACCESS (quién declara una ruta de alta con "create"), no de una lista aparte', () => {
    expect([...MANAGED_MODULES].sort()).toEqual(['action_categories', 'actions', 'roles', 'users'])
  })

  it('todo módulo gestionado también está entre los módulos con listado guardado', () => {
    for (const module of MANAGED_MODULES) {
      expect(GUARDED_MODULES).toContain(module)
    }
  })

  it('un módulo nuevo con su ruta de alta en ROUTE_ACCESS entraría solo, sin tocar MANAGED_MODULES a mano', () => {
    // No se puede mutar ROUTE_ACCESS desde aquí (es la tabla real de la app),
    // así que esto documenta el contrato en vez de ejecutarlo: MANAGED_MODULES
    // es `modulesRequiring('create')` sobre ROUTE_ACCESS, no una lista escrita
    // a mano. Que un módulo entre aquí depende únicamente de que declare esa
    // fila, igual que ya pasa con RESTORABLE_MODULES y "restore".
    const modulosConCrear = new Set(
      ROUTE_ACCESS
        .filter(entry => entry.action === 'create' || (Array.isArray(entry.action) && entry.action.includes('create')))
        .map(entry => entry.module)
    )

    expect(new Set(MANAGED_MODULES)).toEqual(modulosConCrear)
  })
})

describe('resolveCan — caso reportado, aplicado a crear/editar/eliminar', () => {
  it('con "list" pero sin "delete" en el módulo, el botón de eliminar de esa pantalla no debe ofrecerse', () => {
    const s = state({ granted: { 'roles::list': true, 'roles::delete': false } })
    expect(resolveCan(s, 'roles', 'delete')).toBe(false)
  })

  it('"delete" (uno) y "bulk_delete" (en lote) son permisos aparte: se puede tener uno sin el otro', () => {
    const s = state({ granted: { 'roles::delete': true, 'roles::bulk_delete': false } })
    expect(resolveCan(s, 'roles', 'delete')).toBe(true)
    expect(resolveCan(s, 'roles', 'bulk_delete')).toBe(false)
  })

  it('"create" y "update" también se decretan aparte, módulo por módulo', () => {
    const s = state({
      granted: {
        'roles::list': true,
        'roles::create': false,
        'roles::update': true,
        'users::list': true,
        'users::create': true,
        'users::update': false
      }
    })

    expect(resolveCan(s, 'roles', 'create')).toBe(false)
    expect(resolveCan(s, 'roles', 'update')).toBe(true)
    expect(resolveCan(s, 'users', 'create')).toBe(true)
    expect(resolveCan(s, 'users', 'update')).toBe(false)
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
