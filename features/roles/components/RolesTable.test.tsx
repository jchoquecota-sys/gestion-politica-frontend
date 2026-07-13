import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RolesTable } from './RolesTable';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Tests de integración para RolesTable.
 *
 * Cobertura:
 *  - Loading state
 *  - Renderizado de la lista de roles y badges
 *  - RBAC: visibilidad de botones según permisos
 *  - Apertura de modal de edición
 *  - Apertura de modal de confirmación de eliminación
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
// Setup: autenticar como super-admin antes de cada test
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

describe('RolesTable', () => {
  // ── Loading ──────────────────────────────────────────
  it('debe mostrar el spinner mientras carga los datos', () => {
    renderWithProviders(<RolesTable />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  // ── Renderizado de datos ─────────────────────────────
  it('debe renderizar los roles recibidos del servidor', async () => {
    renderWithProviders(<RolesTable />);

    await waitFor(() => {
      expect(screen.getByText('super-admin')).toBeInTheDocument();
      expect(screen.getByText('coordinador')).toBeInTheDocument();
    });
  });

  it('debe mostrar el badge "Sistema" solo en el rol super-admin', async () => {
    renderWithProviders(<RolesTable />);

    await waitFor(() => {
      expect(screen.getByText('Sistema')).toBeInTheDocument();
    });

    // El badge "Sistema" no debe aparecer en el rol coordinador
    expect(screen.getAllByText('Sistema')).toHaveLength(1);
  });

  it('debe mostrar los permisos del rol como badges', async () => {
    renderWithProviders(<RolesTable />);

    await waitFor(() => {
      expect(screen.getByText('roles:view')).toBeInTheDocument();
      expect(screen.getByText('roles:create')).toBeInTheDocument();
      expect(screen.getByText('users:view')).toBeInTheDocument();
    });
  });

  // ── RBAC ─────────────────────────────────────────────
  it('super-admin debe ver botones de editar y eliminar en cada fila', async () => {
    renderWithProviders(<RolesTable />);

    await waitFor(() => {
      expect(screen.getByText('super-admin')).toBeInTheDocument();
    });

    // Con 2 roles → debe haber botones de acción (ícono Edit2 y Trash2)
    const actionButtons = screen.getAllByRole('button');
    expect(actionButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('un usuario sin roles:edit ni roles:delete NO debe ver ningún botón de acción', async () => {
    useAuthStore.setState({
      token: 'token',
      user: {
        id: 2,
        name: 'Solo Visualizador',
        email: 'view@test.com',
        roles: ['visualizador'],
        permissions: ['roles:view'],
      },
    });

    renderWithProviders(<RolesTable />);

    await waitFor(() => {
      expect(screen.getByText('super-admin')).toBeInTheDocument();
    });

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('un usuario con solo roles:edit debe ver editar pero no eliminar', async () => {
    useAuthStore.setState({
      token: 'token',
      user: {
        id: 3,
        name: 'Editor',
        email: 'edit@test.com',
        roles: ['editor'],
        permissions: ['roles:view', 'roles:edit'],
      },
    });

    renderWithProviders(<RolesTable />);

    await waitFor(() => {
      expect(screen.getByText('super-admin')).toBeInTheDocument();
    });

    // Solo botones de editar (uno por cada rol → 2)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2); // 2 roles = 2 botones de editar
  });

  // ── Interacciones de modal ────────────────────────────
  it('debe abrir el modal "Editar Rol" al hacer click en el botón de editar', async () => {
    renderWithProviders(<RolesTable />);

    await waitFor(() => {
      expect(screen.getByText('super-admin')).toBeInTheDocument();
    });

    // El primer botón es el de editar del primer rol
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(screen.getByText('Editar Rol')).toBeInTheDocument();
    });
  });

  it('debe abrir el modal "¿Eliminar rol?" al hacer click en el botón de eliminar', async () => {
    renderWithProviders(<RolesTable />);

    await waitFor(() => {
      expect(screen.getByText('super-admin')).toBeInTheDocument();
    });

    // El segundo botón de la primera fila es el de eliminar
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);

    await waitFor(() => {
      expect(screen.getByText('¿Eliminar rol?')).toBeInTheDocument();
    });
  });

  it('el modal de eliminación debe cerrar al hacer click en Cancelar', async () => {
    renderWithProviders(<RolesTable />);

    await waitFor(() => {
      expect(screen.getByText('super-admin')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);

    await waitFor(() => {
      expect(screen.getByText('¿Eliminar rol?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    await waitFor(() => {
      expect(screen.queryByText('¿Eliminar rol?')).not.toBeInTheDocument();
    });
  });

  // ── Estado vacío ──────────────────────────────────────
  it('debe mostrar el mensaje vacío cuando no hay roles', async () => {
    const { server } = await import('@/tests/mocks/server');
    const { http, HttpResponse } = await import('msw');

    server.use(
      http.get('http://localhost:8000/api/roles', () =>
        HttpResponse.json({ data: [] })
      )
    );

    renderWithProviders(<RolesTable />);

    await waitFor(() => {
      expect(
        screen.getByText('No hay roles registrados en el sistema.')
      ).toBeInTheDocument();
    });
  });
});
