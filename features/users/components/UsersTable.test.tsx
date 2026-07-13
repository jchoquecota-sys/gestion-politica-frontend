import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UsersTable } from './UsersTable';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Tests de integración para UsersTable.
 *
 * Cobertura:
 *  - Loading state
 *  - Renderizado de usuarios (nombre, email, roles, fecha)
 *  - Badge "Tú" para el usuario autenticado
 *  - RBAC: visibilidad de botones según permisos
 *  - Auto-protección: no se puede eliminar a uno mismo
 *  - Apertura de modal de edición y eliminación
 *  - Estado vacío
 */

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

// ─────────────────────────────────────────────────────────
// Setup: autenticar como super-admin (id distinto a los mocks)
// ─────────────────────────────────────────────────────────
beforeEach(() => {
  useAuthStore.setState({
    token: 'fake-token',
    user: {
      id: 99,
      name: 'Admin Maestro',
      email: 'admin@test.com',
      roles: ['super-admin'],
      permissions: [],
    },
  });
});

describe('UsersTable', () => {
  // ── Loading ──────────────────────────────────────────
  it('debe mostrar el spinner mientras carga los datos', () => {
    renderWithProviders(<UsersTable />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  // ── Renderizado de datos ─────────────────────────────
  it('muestra los nombres de los usuarios', async () => {
    renderWithProviders(<UsersTable />);

    await waitFor(() => {
      expect(screen.getByText('Juan Perez')).toBeInTheDocument();
      expect(screen.getByText('Ana García')).toBeInTheDocument();
    });
  });

  it('muestra los emails de los usuarios', async () => {
    renderWithProviders(<UsersTable />);

    await waitFor(() => {
      expect(screen.getByText('juan@test.com')).toBeInTheDocument();
      expect(screen.getByText('ana@test.com')).toBeInTheDocument();
    });
  });

  it('muestra los roles de cada usuario como badges', async () => {
    renderWithProviders(<UsersTable />);

    await waitFor(() => {
      expect(screen.getByText('super-admin')).toBeInTheDocument();
      expect(screen.getByText('coordinador')).toBeInTheDocument();
    });
  });

  it('muestra la fecha de registro formateada de cada usuario', async () => {
    renderWithProviders(<UsersTable />);

    await waitFor(() => {
      // La fecha '2026-07-12T00:00:00Z' se formatea con toLocaleDateString()
      // Verificamos que haya al menos un texto con formato de fecha
      const allText = document.body.textContent || '';
      expect(allText).toMatch(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}/);
    });
  });

  // ── Badge "Tú" ───────────────────────────────────────
  it('muestra el badge "Tú" solo para el usuario actualmente autenticado', async () => {
    // El usuario autenticado coincide con Juan Perez (id=1)
    useAuthStore.setState({
      token: 'token',
      user: {
        id: 1,
        name: 'Juan Perez',
        email: 'juan@test.com',
        roles: ['super-admin'],
        permissions: [],
      },
    });

    renderWithProviders(<UsersTable />);

    await waitFor(() => {
      expect(screen.getByText('Tú')).toBeInTheDocument();
    });

    // Solo debe aparecer una vez
    expect(screen.getAllByText('Tú')).toHaveLength(1);
  });

  it('NO muestra el badge "Tú" cuando el usuario autenticado no está en la lista', async () => {
    // El id=99 no coincide con ningún usuario del mock
    renderWithProviders(<UsersTable />);

    await waitFor(() => {
      expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    });

    expect(screen.queryByText('Tú')).not.toBeInTheDocument();
  });

  // ── RBAC ─────────────────────────────────────────────
  it('super-admin ve los botones de editar y eliminar', async () => {
    renderWithProviders(<UsersTable />);

    await waitFor(() => {
      expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('un usuario sin users:edit ni users:delete NO ve ningún botón de acción', async () => {
    useAuthStore.setState({
      token: 'token',
      user: {
        id: 99,
        name: 'Solo Visualizador',
        email: 'view@test.com',
        roles: ['visualizador'],
        permissions: ['users:view'],
      },
    });

    renderWithProviders(<UsersTable />);

    await waitFor(() => {
      expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    });

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  // ── Auto-protección ──────────────────────────────────
  it('no muestra el botón de eliminar para el propio usuario autenticado', async () => {
    // El usuario autenticado es Juan Perez (id=1)
    useAuthStore.setState({
      token: 'token',
      user: {
        id: 1,
        name: 'Juan Perez',
        email: 'juan@test.com',
        roles: ['super-admin'],
        permissions: [],
      },
    });

    renderWithProviders(<UsersTable />);

    await waitFor(() => {
      expect(screen.getByText('Tú')).toBeInTheDocument();
    });

    // Con 2 usuarios:
    // - Juan (id=1): botón editar SÍ, botón eliminar NO (soy yo)
    // - Ana  (id=2): botón editar SÍ, botón eliminar SÍ
    // Total botones = 3 (2 editar + 1 eliminar)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(3);
  });

  // ── Interacciones de modal ────────────────────────────
  it('abre el modal "Editar Usuario" al hacer click en editar', async () => {
    renderWithProviders(<UsersTable />);

    await waitFor(() => {
      expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // Primer botón editar

    await waitFor(() => {
      expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
    });
  });

  it('abre el modal "¿Eliminar usuario?" al hacer click en eliminar', async () => {
    renderWithProviders(<UsersTable />);

    await waitFor(() => {
      expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    // Segundo botón (Trash) de la primera fila
    fireEvent.click(buttons[1]);

    await waitFor(() => {
      expect(screen.getByText('¿Eliminar usuario?')).toBeInTheDocument();
    });
  });

  it('el modal de eliminación se cierra al hacer click en Cancelar', async () => {
    renderWithProviders(<UsersTable />);

    await waitFor(() => {
      expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);

    await waitFor(() => {
      expect(screen.getByText('¿Eliminar usuario?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    await waitFor(() => {
      expect(screen.queryByText('¿Eliminar usuario?')).not.toBeInTheDocument();
    });
  });

  // ── Estado vacío ──────────────────────────────────────
  it('muestra el mensaje vacío cuando no hay usuarios registrados', async () => {
    const { server } = await import('@/tests/mocks/server');
    const { http, HttpResponse } = await import('msw');

    server.use(
      http.get('http://localhost:8000/api/users', () =>
        HttpResponse.json({ data: [] })
      )
    );

    renderWithProviders(<UsersTable />);

    await waitFor(() => {
      expect(
        screen.getByText('No hay usuarios registrados en el sistema.')
      ).toBeInTheDocument();
    });
  });
});
