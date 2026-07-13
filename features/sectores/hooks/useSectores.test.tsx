import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSectores, useSectoresOpciones, useSector } from './useSectores';
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';

/**
 * Tests de integración para los hooks del módulo Sectores.
 *
 * Cobertura:
 *  - useSectores: listado paginado, estructura con responsable
 *  - useSectoresOpciones: listado para selects
 *  - useSector: obtención de un sector por ID (enabled cuando id !== null)
 *  - Escenarios de error: 404, 500
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
// useSectores
// ══════════════════════════════════════════════════════════
describe('useSectores', () => {
  it('arranca en estado loading', () => {
    const { result } = renderHook(() => useSectores(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('resuelve exitosamente con la respuesta paginada', async () => {
    const { result } = renderHook(() => useSectores(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.meta).toBeDefined();
  });

  it('cada sector tiene la estructura correcta: {id, nombre, codigo}', async () => {
    const { result } = renderHook(() => useSectores(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.data!.data.forEach((sector) => {
      expect(sector).toHaveProperty('id');
      expect(sector).toHaveProperty('nombre');
      expect(sector).toHaveProperty('codigo');
    });
  });

  it('el primer sector es "Sector Norte" con código "SN-01"', async () => {
    const { result } = renderHook(() => useSectores(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const norte = result.current.data!.data[0];
    expect(norte.nombre).toBe('Sector Norte');
    expect(norte.codigo).toBe('SN-01');
  });

  it('el primer sector tiene responsable definido con nombre_completo y cargo', async () => {
    const { result } = renderHook(() => useSectores(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const responsable = result.current.data!.data[0].responsable;
    expect(responsable).toBeDefined();
    expect(responsable?.nombre_completo).toBe('Ana García');
    expect(responsable?.cargo).toBe('Coordinador Zonal');
  });

  it('el segundo sector tiene responsable null sin lanzar error', async () => {
    const { result } = renderHook(() => useSectores(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const sur = result.current.data!.data[1];
    expect(sur.nombre).toBe('Sector Sur');
    expect(sur.responsable).toBeNull();
  });

  it('marca isError cuando el servidor devuelve 500', async () => {
    server.use(
      http.get('http://localhost:8000/api/sectores', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useSectores(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

// ══════════════════════════════════════════════════════════
// useSectoresOpciones
// ══════════════════════════════════════════════════════════
describe('useSectoresOpciones', () => {
  it('retorna lista simplificada de sectores para selects', async () => {
    const { result } = renderHook(() => useSectoresOpciones(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
  });

  it('cada opción tiene {id, nombre}', async () => {
    const { result } = renderHook(() => useSectoresOpciones(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.data!.forEach((op) => {
      expect(op).toHaveProperty('id');
      expect(op).toHaveProperty('nombre');
    });
  });

  it('incluye Sector Norte y Sector Sur', async () => {
    const { result } = renderHook(() => useSectoresOpciones(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const nombres = result.current.data!.map((s) => s.nombre);
    expect(nombres).toContain('Sector Norte');
    expect(nombres).toContain('Sector Sur');
  });
});

// ══════════════════════════════════════════════════════════
// useSector (singular, por ID)
// ══════════════════════════════════════════════════════════
describe('useSector', () => {
  it('NO ejecuta la query cuando id es null (enabled: false)', () => {
    const { result } = renderHook(() => useSector(null), { wrapper: createWrapper() });

    // Con enabled:false, la query no debe entrar en loading automáticamente
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('ejecuta la query y retorna el sector cuando id es un número válido', async () => {
    const { result } = renderHook(() => useSector(1), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.nombre).toBe('Sector Norte');
    expect(result.current.data?.codigo).toBe('SN-01');
  });

  it('retorna el responsable del sector consultado por ID', async () => {
    const { result } = renderHook(() => useSector(1), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.responsable?.nombre_completo).toBe('Ana García');
  });

  it('marca isError cuando el servidor devuelve 404 para un sector inexistente', async () => {
    server.use(
      http.get('http://localhost:8000/api/sectores/:id', () =>
        HttpResponse.json({ message: 'Sector not found' }, { status: 404 })
      )
    );

    const { result } = renderHook(() => useSector(999), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
