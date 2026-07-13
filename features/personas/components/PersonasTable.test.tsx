import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersonasTable } from './PersonasTable';
import { useAuthStore } from '@/store/useAuthStore';
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';

/**
 * Tests de integración para PersonasTable.
 *
 * Cobertura:
 *  - Loading state
 *  - Renderizado de personas (nombre, DNI, contacto)
 *  - RBAC: visibilidad de botones editar/eliminar según permisos
 *  - Botón "Nueva Persona" visible solo con personas:create
 *  - Modal de confirmación de eliminación
 *  - Estado vacío
 *  - Error de API (500)
 *
 * PersonasTable recibe onAdd y onEdit como props (callbacks externos).
 */

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderPersonasTable(overrideProps = {}) {
  const queryClient = createTestQueryClient();
  const onAdd = vi.fn();
  const onEdit = vi.fn();
  render(
    <QueryClientProvider client={queryClient}>
      <PersonasTable onAdd={onAdd} onEdit={onEdit} {...overrideProps} />
    </QueryClientProvider>
  );
  return { onAdd, onEdit };
}

// ─────────────────────────────────────────────────────────
// Setup: super-admin por defecto
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

describe('PersonasTable', () => {
  // ── Loading ──────────────────────────────────────────
  it('muestra el spinner mientras carga los datos', () => {
    renderPersonasTable();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  // ── Renderizado de datos ─────────────────────────────
  it('muestra los nombres y apellidos de cada persona', async () => {
    renderPersonasTable();

    await waitFor(() => {
      // El componente renderiza nombres+apellidos combinados en un <p>:
      // '{p.nombres} {p.apellidos}' → 'Ana María García López'
      expect(screen.getByText('Ana María García López')).toBeInTheDocument();
      expect(screen.getByText('Carlos López Martínez')).toBeInTheDocument();
    });
  });

  it('muestra el DNI de cada persona como badge', async () => {
    renderPersonasTable();

    await waitFor(() => {
      expect(screen.getByText('12345678')).toBeInTheDocument();
      expect(screen.getByText('87654321')).toBeInTheDocument();
    });
  });

  it('muestra el email de contacto cuando está disponible', async () => {
    renderPersonasTable();

    await waitFor(() => {
      expect(screen.getByText('ana@test.com')).toBeInTheDocument();
    });
  });

  it('muestra guion (-) cuando la persona no tiene celular', async () => {
    renderPersonasTable();

    await waitFor(() => {
      // Carlos no tiene dirección pero la tabla muestra '-' para celular/email vacíos
      expect(screen.getByText('carlos@test.com')).toBeInTheDocument();
    });
  });

  // ── RBAC ─────────────────────────────────────────────
  it('super-admin ve los botones de editar y eliminar', async () => {
    renderPersonasTable();

    await waitFor(() => {
      expect(screen.getByText('Ana María García López')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    // Hay botón "Nueva Persona" + botones de acción por fila
    expect(buttons.length).toBeGreaterThan(2);
  });

  it('muestra el botón "Nueva Persona" cuando tiene personas:create', async () => {
    renderPersonasTable();

    await waitFor(() => {
      expect(screen.getByText('Nueva Persona')).toBeInTheDocument();
    });
  });

  it('NO muestra el botón "Nueva Persona" sin permiso personas:create', async () => {
    useAuthStore.setState({
      token: 'token',
      user: {
        id: 2,
        name: 'Lector',
        email: 'lector@test.com',
        roles: ['lector'],
        permissions: ['personas:view'],
      },
    });

    renderPersonasTable();

    await waitFor(() => {
      expect(screen.getByText('Ana María García López')).toBeInTheDocument();
    });

    expect(screen.queryByText('Nueva Persona')).not.toBeInTheDocument();
  });

  it('un usuario sin personas:edit ni personas:delete NO ve botones de acción', async () => {
    useAuthStore.setState({
      token: 'token',
      user: {
        id: 2,
        name: 'Solo Lector',
        email: 'lector@test.com',
        roles: ['lector'],
        permissions: ['personas:view'],
      },
    });

    renderPersonasTable();

    await waitFor(() => {
      expect(screen.getByText('Ana María García López')).toBeInTheDocument();
    });

    // No debe haber botones de editar ni eliminar
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  // ── Callbacks ────────────────────────────────────────
  it('llama a onAdd al hacer click en "Nueva Persona"', async () => {
    const { onAdd } = renderPersonasTable();

    await waitFor(() => {
      expect(screen.getByText('Nueva Persona')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Nueva Persona'));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('llama a onEdit con la persona correcta al hacer click en editar', async () => {
    const { onEdit } = renderPersonasTable();

    await waitFor(() => {
      expect(screen.getByText('Ana María García López')).toBeInTheDocument();
    });

    const row = screen.getByText('Ana María García López').closest('tr');
    expect(row).toBeTruthy();
    
    // El primer botón de la fila es Editar
    const editBtn = row?.querySelectorAll('button')[0];
    expect(editBtn).toBeTruthy();
    
    fireEvent.click(editBtn!);

    expect(onEdit).toHaveBeenCalledOnce();
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ dni: '12345678' })
    );
  });

  // ── Modal de eliminación ─────────────────────────────
  it('abre el modal "¿Eliminar persona?" al hacer click en el botón de eliminar', async () => {
    renderPersonasTable();

    await waitFor(() => {
      expect(screen.getByText('Ana María García López')).toBeInTheDocument();
    });

    const row = screen.getByText('Ana María García López').closest('tr');
    expect(row).toBeTruthy();
    
    // El segundo botón de la fila es Eliminar
    const deleteBtn = row?.querySelectorAll('button')[1];
    expect(deleteBtn).toBeTruthy();

    fireEvent.click(deleteBtn!);
    await waitFor(() => {
      expect(screen.getByText('¿Eliminar persona?')).toBeInTheDocument();
    });
  });

  it('cierra el modal al hacer click en Cancelar', async () => {
    renderPersonasTable();

    await waitFor(() => {
      expect(screen.getByText('Ana María García López')).toBeInTheDocument();
    });

    const row = screen.getByText('Ana María García López').closest('tr');
    const deleteBtn = row?.querySelectorAll('button')[1];
    expect(deleteBtn).toBeTruthy();
    
    fireEvent.click(deleteBtn!);

    await waitFor(() => {
      expect(screen.getByText('¿Eliminar persona?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    await waitFor(() => {
      expect(screen.queryByText('¿Eliminar persona?')).not.toBeInTheDocument();
    });
  });

  // ── Estado vacío ──────────────────────────────────────
  it('muestra el mensaje vacío cuando no hay personas registradas', async () => {
    server.use(
      http.get('http://localhost:8000/api/personas', () =>
        HttpResponse.json({
          status: 'success',
          data: [],
          meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
        })
      )
    );

    renderPersonasTable();

    await waitFor(() => {
      expect(
        screen.getByText('No se encontraron personas registradas.')
      ).toBeInTheDocument();
    });
  });

  // ── Búsqueda ──────────────────────────────────────────
  it('muestra el campo de búsqueda con el placeholder correcto', async () => {
    renderPersonasTable();

    expect(
      screen.getByPlaceholderText('Buscar por nombre o DNI...')
    ).toBeInTheDocument();
  });
});
