import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';

/**
 * Tests unitarios para useAuthStore (Zustand)
 *
 * Cobertura:
 *  - Estado inicial
 *  - setAuth / setUser / logout
 *  - hasPermission: super-admin, permisos específicos, sin usuario
 */

// Reiniciar el store entre cada test para garantizar aislamiento total
beforeEach(() => {
  useAuthStore.setState({ token: null, user: null });
});

// ─────────────────────────────────────────────────────────
// 1. Estado inicial
// ─────────────────────────────────────────────────────────
describe('useAuthStore › estado inicial', () => {
  it('debe iniciar con token null', () => {
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('debe iniciar con user null', () => {
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('hasPermission debe retornar false cuando no hay usuario', () => {
    expect(useAuthStore.getState().hasPermission('roles:view')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────
// 2. setAuth
// ─────────────────────────────────────────────────────────
describe('useAuthStore › setAuth', () => {
  it('debe persistir el token y el usuario en el store', () => {
    const mockUser = {
      id: 1,
      name: 'Juan Perez',
      email: 'juan@test.com',
      roles: ['super-admin'],
      permissions: [],
    };

    useAuthStore.getState().setAuth('mi-token-secreto', mockUser);

    const { token, user } = useAuthStore.getState();
    expect(token).toBe('mi-token-secreto');
    expect(user).toEqual(mockUser);
  });

  it('debe sobreescribir sesiones previas', () => {
    const user1 = { id: 1, name: 'A', email: 'a@t.com', roles: [], permissions: [] };
    const user2 = { id: 2, name: 'B', email: 'b@t.com', roles: [], permissions: [] };

    useAuthStore.getState().setAuth('token-1', user1);
    useAuthStore.getState().setAuth('token-2', user2);

    expect(useAuthStore.getState().token).toBe('token-2');
    expect(useAuthStore.getState().user?.id).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────
// 3. setUser
// ─────────────────────────────────────────────────────────
describe('useAuthStore › setUser', () => {
  it('debe actualizar el usuario sin modificar el token', () => {
    const user = { id: 1, name: 'Original', email: 'o@t.com', roles: [], permissions: [] };
    useAuthStore.getState().setAuth('token-original', user);

    useAuthStore.getState().setUser({ ...user, name: 'Actualizado' });

    expect(useAuthStore.getState().token).toBe('token-original');
    expect(useAuthStore.getState().user?.name).toBe('Actualizado');
  });

  it('puede añadir permisos nuevos via setUser', () => {
    const user = { id: 1, name: 'T', email: 't@t.com', roles: ['coord'], permissions: ['users:view'] };
    useAuthStore.getState().setAuth('tok', user);

    useAuthStore.getState().setUser({ ...user, permissions: ['users:view', 'users:create'] });

    expect(useAuthStore.getState().user?.permissions).toContain('users:create');
  });
});

// ─────────────────────────────────────────────────────────
// 4. logout
// ─────────────────────────────────────────────────────────
describe('useAuthStore › logout', () => {
  it('debe limpiar el token y el usuario al hacer logout', () => {
    const user = { id: 1, name: 'Test', email: 't@t.com', roles: [], permissions: [] };
    useAuthStore.getState().setAuth('mi-token', user);

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('después del logout hasPermission debe retornar false', () => {
    const user = { id: 1, name: 'T', email: 't@t.com', roles: ['super-admin'], permissions: [] };
    useAuthStore.getState().setAuth('tok', user);
    useAuthStore.getState().logout();

    expect(useAuthStore.getState().hasPermission('roles:delete')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────
// 5. hasPermission – RBAC
// ─────────────────────────────────────────────────────────
describe('useAuthStore › hasPermission (RBAC)', () => {
  it('super-admin tiene acceso a cualquier permiso sin necesidad de listarlo', () => {
    useAuthStore.getState().setAuth('tok', {
      id: 1,
      name: 'Admin',
      email: 'a@t.com',
      roles: ['super-admin'],
      permissions: [], // No tiene permisos explícitos
    });

    const { hasPermission } = useAuthStore.getState();
    expect(hasPermission('roles:delete')).toBe(true);
    expect(hasPermission('users:create')).toBe(true);
    expect(hasPermission('cualquier:permiso-inexistente')).toBe(true);
  });

  it('un usuario con permisos específicos solo puede acceder a los suyos', () => {
    useAuthStore.getState().setAuth('tok', {
      id: 2,
      name: 'Coordinador',
      email: 'c@t.com',
      roles: ['coordinador'],
      permissions: ['users:view', 'roles:view'],
    });

    const { hasPermission } = useAuthStore.getState();
    expect(hasPermission('users:view')).toBe(true);
    expect(hasPermission('roles:view')).toBe(true);
    expect(hasPermission('roles:delete')).toBe(false);
    expect(hasPermission('users:create')).toBe(false);
    expect(hasPermission('users:delete')).toBe(false);
  });

  it('un usuario sin ningún permiso no puede acceder a nada', () => {
    useAuthStore.getState().setAuth('tok', {
      id: 3,
      name: 'Sin Permisos',
      email: 'sp@t.com',
      roles: ['visualizador'],
      permissions: [],
    });

    const { hasPermission } = useAuthStore.getState();
    expect(hasPermission('roles:view')).toBe(false);
    expect(hasPermission('users:view')).toBe(false);
  });

  it('verifica todos los permisos estándar del sistema uno a uno', () => {
    const todosLosPermisos = [
      'roles:view',
      'roles:create',
      'roles:edit',
      'roles:delete',
      'users:view',
      'users:create',
      'users:edit',
      'users:delete',
    ];

    useAuthStore.getState().setAuth('tok', {
      id: 4,
      name: 'Full Access',
      email: 'fa@t.com',
      roles: ['operador'],
      permissions: todosLosPermisos,
    });

    const { hasPermission } = useAuthStore.getState();
    todosLosPermisos.forEach((perm) => {
      expect(hasPermission(perm)).toBe(true);
    });
  });
});
