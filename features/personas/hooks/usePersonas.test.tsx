import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePersonas, usePersonasOpciones } from './usePersonas';
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';

/**
 * Tests de integración para los hooks del módulo Personas.
 *
 * Cobertura:
 *  - usePersonas: listado paginado, loading, estructura de datos
 *  - usePersonasOpciones: listado para selects
 *  - Escenario de error (API 500)
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
// usePersonas
// ══════════════════════════════════════════════════════════
describe('usePersonas', () => {
  it('arranca en estado loading', () => {
    const { result } = renderHook(() => usePersonas(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('resuelve exitosamente con la respuesta paginada del servidor', async () => {
    const { result } = renderHook(() => usePersonas(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.meta).toBeDefined();
  });

  it('retorna los datos de personas con la estructura correcta', async () => {
    const { result } = renderHook(() => usePersonas(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const personas = result.current.data!.data;
    personas.forEach((p) => {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('nombres');
      expect(p).toHaveProperty('apellidos');
      expect(p).toHaveProperty('dni');
    });
  });

  it('la primera persona es Ana María García', async () => {
    const { result } = renderHook(() => usePersonas(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data!.data[0].nombres).toBe('Ana María');
    expect(result.current.data!.data[0].apellidos).toBe('García López');
    expect(result.current.data!.data[0].dni).toBe('12345678');
  });

  it('la segunda persona tiene dirección null manejada sin errores', async () => {
    const { result } = renderHook(() => usePersonas(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const carlos = result.current.data!.data[1];
    expect(carlos.nombres).toBe('Carlos');
    // La dirección puede ser null — el hook debe devolverla sin transformarla
    expect(carlos.direccion === null || carlos.direccion === undefined).toBe(true);
  });

  it('retorna metadata de paginación correcta', async () => {
    const { result } = renderHook(() => usePersonas(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const meta = result.current.data!.meta;
    expect(meta.current_page).toBe(1);
    expect(meta.total).toBe(2);
    expect(meta.last_page).toBe(1);
  });

  it('marca isError cuando el servidor devuelve 500', async () => {
    server.use(
      http.get('http://localhost:8000/api/personas', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 })
      )
    );

    const { result } = renderHook(() => usePersonas(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
  });
});

// ══════════════════════════════════════════════════════════
// usePersonasOpciones
// ══════════════════════════════════════════════════════════
describe('usePersonasOpciones', () => {
  it('retorna la lista simplificada de personas para selects', async () => {
    const { result } = renderHook(() => usePersonasOpciones(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
  });

  it('cada opción tiene {id, nombre_completo, dni}', async () => {
    const { result } = renderHook(() => usePersonasOpciones(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.data!.forEach((op) => {
      expect(op).toHaveProperty('id');
      expect(op).toHaveProperty('nombre_completo');
      expect(op).toHaveProperty('dni');
    });
  });

  it('contiene "Ana María García" como primera opción', async () => {
    const { result } = renderHook(() => usePersonasOpciones(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data![0].nombre_completo).toBe('Ana María García');
    expect(result.current.data![0].dni).toBe('12345678');
  });
});
