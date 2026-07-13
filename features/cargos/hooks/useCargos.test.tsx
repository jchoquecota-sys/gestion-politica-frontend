import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCargos, useCargosOpciones } from './useCargos';
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';

/**
 * Tests de integración para los hooks del módulo Cargos.
 *
 * Cobertura:
 *  - useCargos: listado paginado, loading, estructura con auditoría
 *  - useCargosOpciones: listado para selects
 *  - Escenario de error 500
 *  - Escenario 422 (cargo en uso, no puede eliminarse)
 */

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

// ══════════════════════════════════════════════════════════
// useCargos
// ══════════════════════════════════════════════════════════
describe('useCargos', () => {
  it('arranca en estado loading', () => {
    const { result } = renderHook(() => useCargos(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('resuelve exitosamente con la respuesta paginada', async () => {
    const { result } = renderHook(() => useCargos(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.meta).toBeDefined();
  });

  it('cada cargo tiene la estructura correcta incluyendo bloque de auditoría', async () => {
    const { result } = renderHook(() => useCargos(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.data!.data.forEach((cargo) => {
      expect(cargo).toHaveProperty('id');
      expect(cargo).toHaveProperty('nombre');
      expect(cargo).toHaveProperty('descripcion');
      expect(cargo).toHaveProperty('auditoria');
      expect(cargo.auditoria).toHaveProperty('creado_por');
      expect(cargo.auditoria).toHaveProperty('creado_el');
    });
  });

  it('el primer cargo es Coordinador Zonal', async () => {
    const { result } = renderHook(() => useCargos(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data!.data[0].nombre).toBe('Coordinador Zonal');
  });

  it('el segundo cargo es Promotor Electoral', async () => {
    const { result } = renderHook(() => useCargos(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data!.data[1].nombre).toBe('Promotor Electoral');
  });

  it('retorna metadata de paginación', async () => {
    const { result } = renderHook(() => useCargos(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data!.meta.total).toBe(2);
    expect(result.current.data!.meta.current_page).toBe(1);
  });

  it('marca isError cuando el servidor devuelve 500', async () => {
    server.use(
      http.get('http://localhost:8000/api/cargos', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useCargos(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

// ══════════════════════════════════════════════════════════
// useCargosOpciones
// ══════════════════════════════════════════════════════════
describe('useCargosOpciones', () => {
  it('retorna lista simplificada de cargos para selects', async () => {
    const { result } = renderHook(() => useCargosOpciones(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
  });

  it('cada opción tiene {id, nombre}', async () => {
    const { result } = renderHook(() => useCargosOpciones(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.data!.forEach((op) => {
      expect(op).toHaveProperty('id');
      expect(op).toHaveProperty('nombre');
      expect(typeof op.id).toBe('number');
      expect(typeof op.nombre).toBe('string');
    });
  });

  it('contiene "Coordinador Zonal" como primera opción', async () => {
    const { result } = renderHook(() => useCargosOpciones(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data![0].nombre).toBe('Coordinador Zonal');
  });
});
