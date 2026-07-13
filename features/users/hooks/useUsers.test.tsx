import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUsers } from './useUsers';

/**
 * Tests de integración para los hooks del módulo Users.
 *
 * Cobertura:
 *  - useUsers: listado, loading, estructura de cada usuario
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
// useUsers
// ─────────────────────────────────────────────────────────
describe('useUsers', () => {
  it('arranca en estado loading antes de recibir datos', () => {
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('resuelve exitosamente con la lista de usuarios del mock', async () => {
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
  });

  it('el primer usuario es Juan Perez', async () => {
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data![0].name).toBe('Juan Perez');
    expect(result.current.data![0].email).toBe('juan@test.com');
  });

  it('el segundo usuario es Ana García', async () => {
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data![1].name).toBe('Ana García');
    expect(result.current.data![1].email).toBe('ana@test.com');
  });

  it('cada usuario tiene la estructura correcta: {id, name, email, roles, created_at}', async () => {
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.data!.forEach((user) => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('roles');
      expect(user).toHaveProperty('created_at');
      expect(typeof user.id).toBe('number');
      expect(typeof user.name).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(Array.isArray(user.roles)).toBe(true);
    });
  });

  it('Juan Perez tiene el rol super-admin', async () => {
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data![0].roles).toContain('super-admin');
  });

  it('Ana García tiene el rol coordinador', async () => {
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data![1].roles).toContain('coordinador');
  });

  it('Ana García tiene persona vinculada', async () => {
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const ana = result.current.data![1];
    expect(ana.persona).toBeDefined();
    expect(ana.persona?.nombre_completo).toBe('Ana María García');
  });
});
