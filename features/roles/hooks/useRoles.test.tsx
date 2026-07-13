import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRoles, usePermissions } from './useRoles';

/**
 * Tests de integración para los hooks del módulo Roles.
 *
 * Cobertura:
 *  - useRoles:       listado, loading, estructura de cada rol
 *  - usePermissions: listado, formato modulo:accion
 *
 * Los endpoints son interceptados por MSW (configurado en tests/setup.ts).
 */

// ─────────────────────────────────────────────────────────
// Wrapper con React Query aislado por test
// ─────────────────────────────────────────────────────────
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

// ─────────────────────────────────────────────────────────
// useRoles
// ─────────────────────────────────────────────────────────
describe('useRoles', () => {
  it('arranca en estado loading antes de recibir datos', () => {
    const { result } = renderHook(() => useRoles(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('resuelve exitosamente con la lista de roles del mock', async () => {
    const { result } = renderHook(() => useRoles(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
  });

  it('el primer rol es super-admin', async () => {
    const { result } = renderHook(() => useRoles(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data![0].name).toBe('super-admin');
  });

  it('el segundo rol es coordinador', async () => {
    const { result } = renderHook(() => useRoles(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data![1].name).toBe('coordinador');
  });

  it('cada rol tiene la estructura {id, name, permissions}', async () => {
    const { result } = renderHook(() => useRoles(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.data!.forEach((role) => {
      expect(role).toHaveProperty('id');
      expect(role).toHaveProperty('name');
      expect(role).toHaveProperty('permissions');
      expect(typeof role.id).toBe('number');
      expect(typeof role.name).toBe('string');
      expect(Array.isArray(role.permissions)).toBe(true);
    });
  });

  it('los permisos del rol super-admin incluyen roles:delete', async () => {
    const { result } = renderHook(() => useRoles(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const superAdmin = result.current.data!.find((r) => r.name === 'super-admin');
    expect(superAdmin?.permissions).toContain('roles:delete');
  });
});

// ─────────────────────────────────────────────────────────
// usePermissions
// ─────────────────────────────────────────────────────────
describe('usePermissions', () => {
  it('arranca en estado loading', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('resuelve exitosamente con todos los permisos del sistema', async () => {
    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data!.length).toBeGreaterThan(0);
  });

  it('contiene los permisos de roles y de users', async () => {
    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const perms = result.current.data!;
    expect(perms).toContain('roles:view');
    expect(perms).toContain('roles:create');
    expect(perms).toContain('roles:edit');
    expect(perms).toContain('roles:delete');
    expect(perms).toContain('users:view');
    expect(perms).toContain('users:create');
    expect(perms).toContain('users:edit');
    expect(perms).toContain('users:delete');
  });

  it('cada permiso sigue el formato "modulo:accion"', async () => {
    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.data!.forEach((perm) => {
      expect(perm).toMatch(/^[a-z]+:[a-z]+$/);
    });
  });
});
