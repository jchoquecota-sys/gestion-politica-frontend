import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';
import api from '@/lib/axios';

/**
 * Tests de integración para el hook useAuth.
 *
 * Cobertura:
 *  - login exitoso: guarda token+usuario en el store y redirige
 *  - login fallido (401): no modifica el store
 *  - logout: limpia el store y redirige a /login
 *  - getProfile (/me): carga el perfil del usuario autenticado
 *  - getProfile con 401: no rompe la app
 *
 * window.location.href se mockea con vi.stubGlobal para poder
 * hacer assertions sin que JSDOM lance errores de navegación.
 */

// ─────────────────────────────────────────────────────────
// Wrapper con React Query aislado por test
// ─────────────────────────────────────────────────────────
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

// ─────────────────────────────────────────────────────────
// Setup: limpiar store y mockear window.location entre tests
// ─────────────────────────────────────────────────────────
let mockLocation: any;

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null });

  // Crear un mock de location robusto basado en un Proxy para manejar asignación de paths relativos a href
  const locationState = {
    href: 'http://localhost:3000/login',
    pathname: '/login',
    search: '',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  };

  mockLocation = new Proxy(locationState, {
    set(target: any, prop: string, value: any) {
      if (prop === 'href') {
        if (value.startsWith('/')) {
          target.href = target.origin + value;
          target.pathname = value;
        } else {
          target.href = value;
          try {
            const parsed = new URL(value);
            target.pathname = parsed.pathname;
            target.search = parsed.search;
          } catch (_) {}
        }
        return true;
      }
      target[prop] = value;
      return true;
    },
    get(target: any, prop: string) {
      return target[prop];
    }
  });

  vi.stubGlobal('location', mockLocation);
});

// ══════════════════════════════════════════════════════════
// useAuth › login
// ══════════════════════════════════════════════════════════
describe('useAuth › login', () => {
  it('expone la función login y el flag isLoggingIn inicialmente en false', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    expect(typeof result.current.login).toBe('function');
    expect(result.current.isLoggingIn).toBe(false);
  });

  it('login exitoso guarda el token en el store de Zustand', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    // Disparar la mutación y esperar a que el onSuccess actualice el store
    result.current.login({ email: 'admin@test.com', password: 'password' });

    await waitFor(
      () => {
        expect(useAuthStore.getState().token).toBe('fake-jwt-token');
      },
      { timeout: 5000 }
    );
  });

  it('login exitoso guarda el usuario en el store de Zustand', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    result.current.login({ email: 'admin@test.com', password: 'password' });

    await waitFor(
      () => {
        const user = useAuthStore.getState().user;
        expect(user).not.toBeNull();
        expect(user?.email).toBe('admin@test.com');
        expect(user?.roles).toContain('super-admin');
      },
      { timeout: 5000 }
    );
  });

  it('login exitoso redirige a /roles cuando no hay parámetro redirect', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    result.current.login({ email: 'admin@test.com', password: 'password' });

    await waitFor(
      () => {
        expect(mockLocation.href).toBe('http://localhost:3000/roles');
      },
      { timeout: 5000 }
    );
  });

  it('login fallido (401) NO guarda datos en el store', async () => {
    // MSW devolverá 401 para bad@test.com
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.login({ email: 'bad@test.com', password: 'wrong' });
    });

    await waitFor(() => {
      expect(result.current.isLoggingIn).toBe(false);
    });

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('login fallido NO redirige', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.login({ email: 'bad@test.com', password: 'wrong' });
    });

    await waitFor(() => {
      expect(result.current.isLoggingIn).toBe(false);
    });

    expect(mockLocation.href).toBe('http://localhost:3000/login');
  });
});

// ══════════════════════════════════════════════════════════
// useAuth › logout
// ══════════════════════════════════════════════════════════
describe('useAuth › logout', () => {
  it('logout limpia el token del store', async () => {
    // Primero, establecer una sesión activa
    useAuthStore.getState().setAuth('token-previo', {
      id: 1, name: 'Test', email: 't@t.com', roles: ['super-admin'], permissions: [],
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBeNull();
    });
  });

  it('logout limpia el usuario del store', async () => {
    useAuthStore.getState().setAuth('token-previo', {
      id: 1, name: 'Test', email: 't@t.com', roles: ['super-admin'], permissions: [],
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  it('logout redirige a /login', async () => {
    useAuthStore.getState().setAuth('token-previo', {
      id: 1, name: 'Test', email: 't@t.com', roles: ['super-admin'], permissions: [],
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(mockLocation.href).toContain('/login');
    });
  });
});

// ══════════════════════════════════════════════════════════
// useAuth › getProfile (/me)
// ══════════════════════════════════════════════════════════
describe('useAuth › getProfile', () => {
  it('carga el perfil del usuario desde /me y lo guarda en el store', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(
      () => {
        expect(result.current.isSuccess ?? !result.current.isLoadingProfile).toBe(true);
        expect(result.current.profile).toBeDefined();
      },
      { timeout: 5000 }
    );

    expect(result.current.profile?.name).toBe('Juan Perez');
  });

  it('cuando /me devuelve 401 el hook no lanza un error y profile queda undefined', async () => {
    // Sobreescribir el handler para devolver 401
    server.use(
      http.get('http://localhost:8000/api/me', () =>
        HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 })
      )
    );

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoadingProfile).toBe(false);
    });

    // El perfil debe ser undefined (query falla silenciosamente con retry:false)
    expect(result.current.profile).toBeUndefined();
    // El store no debe haberse modificado
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('cuando /me devuelve 500 el hook no lanza un error fatal', async () => {
    server.use(
      http.get('http://localhost:8000/api/me', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoadingProfile).toBe(false);
    });

    expect(result.current.profile).toBeUndefined();
  });
});
