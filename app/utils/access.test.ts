import { describe, expect, it } from 'vitest'
import type { AccessState } from './access'
import {
  ASSIGNABLE_MODULES,
  GUARDED_MODULES,
  MANAGED_MODULES,
  RESTORABLE_MODULES,
  ROUTE_ACCESS,
  accessForRoute,
  resolveCan,
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

describe('resolveCan — caso reportado: la papelera de un módulo debe depender solo de "restore"', () => {
  it('con "restore" apagado, no importa que "bulk_restore" siga prendido: no cuenta para esto', () => {
    // Esto es justo lo que se reportó: en el rol, con "Restaurar" apagado y
    // "Restaurar masivo" prendido, el botón "Papelera" seguía saliendo. La
    // papelera del listado depende únicamente de `restore` (ver
    // `useModuleAccess.canRestore`); `bulk_restore` solo decide el botón de
    // "Restaurar masivo" que hay DENTRO de la papelera, no si se ofrece.
    const s = state({ granted: { 'roles::list': true, 'roles::restore': false, 'roles::bulk_restore': true } })
    expect(resolveCan(s, 'roles', 'restore')).toBe(false)
  })

  it('con "restore" concedido, da igual lo que diga "bulk_restore": la papelera sí se ofrece', () => {
    const s = state({ granted: { 'roles::restore': true, 'roles::bulk_restore': false } })
    expect(resolveCan(s, 'roles', 'restore')).toBe(true)
  })

  it('el mismo rol puede tener "restore" en un módulo y no en otro: cada módulo se decide aparte', () => {
    const s = state({
      granted: {
        'roles::list': true,
        'roles::restore': false,
        'roles::bulk_restore': true,
        'users::list': true,
        'users::restore': true,
        'users::bulk_restore': false
      }
    })

    expect(resolveCan(s, 'roles', 'restore')).toBe(false)
    expect(resolveCan(s, 'users', 'restore')).toBe(true)
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

  it('la papelera de un módulo exige "restore", no "list" ni "bulk_restore"', () => {
    const soloLista = state({ granted: { 'roles::list': true, 'roles::restore': false } })
    expect(resolveCanVisit(soloLista, '/roles/papelera')).toBe(false)

    // Igual con "restore" apagado y "bulk_restore" prendido: no basta.
    const soloBulk = state({ granted: { 'roles::list': true, 'roles::restore': false, 'roles::bulk_restore': true } })
    expect(resolveCanVisit(soloBulk, '/roles/papelera')).toBe(false)

    const conRestore = state({ granted: { 'roles::list': true, 'roles::restore': true } })
    expect(resolveCanVisit(conRestore, '/roles/papelera')).toBe(true)
  })

  it('la papelera de acciones cuelga de /roles/acciones pero exige el módulo "actions", no "roles"', () => {
    const s = state({ granted: { 'roles::restore': true, 'actions::restore': false } })
    expect(resolveCanVisit(s, '/roles/acciones/papelera')).toBe(false)
  })

  it('el formulario de alta exige "create", no "list": tener acceso al listado no basta para entrar a darlo de alta', () => {
    const soloLista = state({ granted: { 'actions::list': true, 'actions::create': false } })
    expect(resolveCanVisit(soloLista, '/roles/acciones/nueva')).toBe(false)

    const conCrear = state({ granted: { 'actions::list': true, 'actions::create': true } })
    expect(resolveCanVisit(conCrear, '/roles/acciones/nueva')).toBe(true)
  })

  it('las matrices de permisos por rol y por usuario exigen "assign", no "list"', () => {
    const soloLista = state({ granted: { 'role_permissions::list': true, 'role_permissions::assign': false } })
    expect(resolveCanVisit(soloLista, '/roles/permisos')).toBe(false)

    const conAssign = state({ granted: { 'role_permissions::list': false, 'role_permissions::assign': true } })
    expect(resolveCanVisit(conAssign, '/roles/permisos')).toBe(true)

    const usuarioSinAssign = state({ granted: { 'user_permissions::list': true, 'user_permissions::assign': false } })
    expect(resolveCanVisit(usuarioSinAssign, '/usuarios/permisos')).toBe(false)
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
  it('la ruta de papelera de un módulo resuelve contra ese módulo con "restore", no contra el listado', () => {
    const cases: Array<[string, string]> = [
      ['/usuarios/papelera', 'users'],
      ['/roles/papelera', 'roles'],
      ['/roles/acciones/papelera', 'actions'],
      ['/roles/categorias/papelera', 'action_categories']
    ]

    for (const [path, module] of cases) {
      expect(accessForRoute(path)).toEqual({ prefix: path, module, action: 'restore' })
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

  it('las matrices de permisos por rol y por usuario resuelven con "assign", no con "list"', () => {
    expect(accessForRoute('/roles/permisos')).toEqual({ prefix: '/roles/permisos', module: 'role_permissions', action: 'assign' })
    expect(accessForRoute('/usuarios/permisos')).toEqual({ prefix: '/usuarios/permisos', module: 'user_permissions', action: 'assign' })
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
    const modulosConCrear = new Set(ROUTE_ACCESS.filter(entry => entry.action === 'create').map(entry => entry.module))
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

describe('módulos con matriz de permisos', () => {
  it('ASSIGNABLE_MODULES son justo role_permissions y user_permissions, las dos matrices', () => {
    expect([...ASSIGNABLE_MODULES].sort()).toEqual(['role_permissions', 'user_permissions'])
  })

  it('todo módulo asignable también está entre los módulos con listado guardado', () => {
    for (const module of ASSIGNABLE_MODULES) {
      expect(GUARDED_MODULES).toContain(module)
    }
  })
})
