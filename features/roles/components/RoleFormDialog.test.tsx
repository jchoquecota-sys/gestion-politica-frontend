import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { RoleFormDialog } from './RoleFormDialog';

// Crear QueryClient de prueba para aislar el caché de React Query en cada test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('RoleFormDialog (Component Integration Test)', () => {
  it('debe renderizar correctamente los campos y la lista de permisos agrupados', async () => {
    const handleClose = vi.fn();

    renderWithProviders(
      <RoleFormDialog isOpen={true} onClose={handleClose} role={null} />
    );

    // Verificar título de creación
    expect(screen.getByText('Crear Nuevo Rol')).toBeInTheDocument();
    
    // Verificar input del nombre del rol
    const nameInput = screen.getByPlaceholderText('Ej: manager');
    expect(nameInput).toBeInTheDocument();

    // Esperar a que MSW cargue los permisos simulados
    await waitFor(() => {
      expect(screen.getByText('Módulo: roles')).toBeInTheDocument();
      expect(screen.getByText('Módulo: users')).toBeInTheDocument();
    });

    // Verificar que los permisos individuales estén renderizados
    expect(screen.getAllByLabelText('create')[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText('view')[0]).toBeInTheDocument();
  });

  it('debe funcionar el botón de "Seleccionar todo" por módulo', async () => {
    const handleClose = vi.fn();

    renderWithProviders(
      <RoleFormDialog isOpen={true} onClose={handleClose} role={null} />
    );

    // Esperar a que se carguen los permisos
    await waitFor(() => {
      expect(screen.getByText('Módulo: roles')).toBeInTheDocument();
    });

    // Obtener los checkboxes del módulo "roles" (roles:view, roles:create, roles:edit, roles:delete)
    const checkboxes = screen.getAllByRole('checkbox');
    // Verificar que al menos los checkboxes de roles estén desmarcados al inicio
    const rolesCheckboxes = checkboxes.slice(0, 4);
    rolesCheckboxes.forEach((cb) => {
      expect(cb).not.toBeChecked();
    });

    // Hacer click en "Seleccionar todo" para el Módulo de roles
    const selectAllButtons = screen.getAllByText('Seleccionar todo');
    // El primer botón es para el módulo de roles
    fireEvent.click(selectAllButtons[0]);

    // Verificar que todos los checkboxes del módulo de roles ahora estén marcados
    rolesCheckboxes.forEach((cb) => {
      expect(cb).toBeChecked();
    });

    // El botón debería cambiar a "Desmarcar todo"
    expect(screen.getByText('Desmarcar todo')).toBeInTheDocument();

    // Desmarcar haciendo click de nuevo
    const deselectButton = screen.getByText('Desmarcar todo');
    fireEvent.click(deselectButton);

    // Verificar que se hayan desmarcado
    rolesCheckboxes.forEach((cb) => {
      expect(cb).not.toBeChecked();
    });
  });

  it('debe enviar los datos del formulario de forma exitosa', async () => {
    const handleClose = vi.fn();

    renderWithProviders(
      <RoleFormDialog isOpen={true} onClose={handleClose} role={null} />
    );

    // Esperar a que cargue
    await waitFor(() => {
      expect(screen.getByText('Módulo: roles')).toBeInTheDocument();
    });

    // Escribir el nombre del rol
    const nameInput = screen.getByPlaceholderText('Ej: manager');
    fireEvent.change(nameInput, { target: { value: 'coordinador-zona' } });

    // Seleccionar permisos de roles
    const selectAllButtons = screen.getAllByText('Seleccionar todo');
    fireEvent.click(selectAllButtons[0]);

    // Enviar formulario
    const submitButton = screen.getByRole('button', { name: /crear rol/i });
    fireEvent.click(submitButton);

    // Esperar a que se invoque la mutación exitosa y se llame a onClose
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
