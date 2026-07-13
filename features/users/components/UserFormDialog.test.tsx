import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserFormDialog } from './UserFormDialog';

/**
 * Tests de integración para UserFormDialog.
 *
 * Cobertura:
 *  - Modo creación: renderizado, validaciones, submit exitoso, cancelar
 *  - Modo edición: prellenado de datos, roles preseleccionados, botón correcto
 *
 * Los endpoints son interceptados por MSW (configurado en tests/setup.ts).
 * Nota: Los checkboxes de Radix UI no exponen .checked nativo en JSDOM;
 *       se usa data-state="checked" o aria-checked para verificar selección.
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
// Datos de prueba
// ─────────────────────────────────────────────────────────
const mockExistingUser = {
  id: 2,
  name: 'Ana García',
  email: 'ana@test.com',
  roles: ['coordinador'],
  permissions: ['users:view'],
  created_at: '2026-07-13T00:00:00Z',
  persona: { id: 1, nombre_completo: 'Ana María García' },
};

// ─────────────────────────────────────────────────────────
// Tests: Modo Creación
// ─────────────────────────────────────────────────────────
describe('UserFormDialog › modo creación', () => {
  it('renderiza el título "Crear Nuevo Usuario"', () => {
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={vi.fn()} user={null} />
    );

    expect(screen.getByText('Crear Nuevo Usuario')).toBeInTheDocument();
  });

  it('renderiza todos los campos del formulario', () => {
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={vi.fn()} user={null} />
    );

    expect(screen.getByPlaceholderText('Ej: Juan Pérez')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('juan@ejemplo.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('muestra el botón de submit "Crear Usuario"', () => {
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={vi.fn()} user={null} />
    );

    expect(
      screen.getByRole('button', { name: /crear usuario/i })
    ).toBeInTheDocument();
  });

  it('carga y muestra los roles disponibles como opciones', async () => {
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={vi.fn()} user={null} />
    );

    await waitFor(() => {
      expect(screen.getByText('super-admin')).toBeInTheDocument();
      expect(screen.getByText('coordinador')).toBeInTheDocument();
    });
  });

  it('muestra error de validación cuando el nombre tiene menos de 2 caracteres', async () => {
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={vi.fn()} user={null} />
    );

    // Escribir un nombre demasiado corto
    fireEvent.change(screen.getByPlaceholderText('Ej: Juan Pérez'), {
      target: { value: 'A' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear usuario/i }));

    await waitFor(() => {
      expect(
        screen.getByText('El nombre debe tener al menos 2 caracteres')
      ).toBeInTheDocument();
    });
  });

  it('muestra error de validación cuando el email es inválido', async () => {
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={vi.fn()} user={null} />
    );

    // Nombre válido para que no bloquee otras validaciones
    fireEvent.change(screen.getByPlaceholderText('Ej: Juan Pérez'), {
      target: { value: 'Juan Pérez' },
    });

    const emailInput = screen.getByPlaceholderText('juan@ejemplo.com');

    // JSDOM bloquea el submit nativo para type="email" con valores inválidos
    // antes de que react-hook-form pueda ejecutar la validación de Zod.
    // Se neutraliza checkValidity en el elemento para forzar la ejecución
    // de la lógica de validación del schema.
    Object.defineProperty(emailInput, 'checkValidity', {
      value: () => true,
      configurable: true,
    });

    fireEvent.change(emailInput, {
      target: { value: 'esto-no-es-un-email' },
    });

    // Disparar submit directamente sobre el form para evitar la validación
    // nativa del navegador y permitir que Zod/react-hook-form validen
    const form = emailInput.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText('Ingresa un correo electrónico válido')
      ).toBeInTheDocument();
    });
  });

  it('muestra error de validación cuando la contraseña tiene menos de 8 caracteres', async () => {
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={vi.fn()} user={null} />
    );

    fireEvent.change(screen.getByPlaceholderText('Ej: Juan Pérez'), {
      target: { value: 'Juan Pérez' },
    });
    fireEvent.change(screen.getByPlaceholderText('juan@ejemplo.com'), {
      target: { value: 'juan@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: '123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear usuario/i }));

    await waitFor(() => {
      expect(
        screen.getByText('La contraseña debe tener al menos 8 caracteres')
      ).toBeInTheDocument();
    });
  });

  it('envía el formulario correctamente y llama a onClose al tener datos válidos', async () => {
    const handleClose = vi.fn();
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={handleClose} user={null} />
    );

    // Esperar que carguen los roles
    await waitFor(() => {
      expect(screen.getByText('coordinador')).toBeInTheDocument();
    });

    // Completar el formulario con datos válidos
    fireEvent.change(screen.getByPlaceholderText('Ej: Juan Pérez'), {
      target: { value: 'Nuevo Coordinador' },
    });
    fireEvent.change(screen.getByPlaceholderText('juan@ejemplo.com'), {
      target: { value: 'nuevo@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    // Seleccionar el rol coordinador
    const rolesCheckboxes = screen.getAllByRole('checkbox');
    // El rol "coordinador" es el segundo checkbox (índice 1)
    fireEvent.click(rolesCheckboxes[1]);

    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /crear usuario/i }));

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledOnce();
    });
  });

  it('llama a onClose cuando se hace click en Cancelar', () => {
    const handleClose = vi.fn();
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={handleClose} user={null} />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('los campos comienzan vacíos en modo creación', () => {
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={vi.fn()} user={null} />
    );

    const nameInput = screen.getByPlaceholderText('Ej: Juan Pérez') as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText('juan@ejemplo.com') as HTMLInputElement;

    expect(nameInput.value).toBe('');
    expect(emailInput.value).toBe('');
  });
});

// ─────────────────────────────────────────────────────────
// Tests: Modo Edición
// ─────────────────────────────────────────────────────────
describe('UserFormDialog › modo edición', () => {
  it('renderiza el título "Editar Usuario"', () => {
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={vi.fn()} user={mockExistingUser} />
    );

    expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
  });

  it('prelllena el nombre con el valor del usuario a editar', () => {
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={vi.fn()} user={mockExistingUser} />
    );

    const nameInput = screen.getByPlaceholderText('Ej: Juan Pérez') as HTMLInputElement;
    expect(nameInput.value).toBe(mockExistingUser.name);
  });

  it('prelllena el email con el valor del usuario a editar', () => {
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={vi.fn()} user={mockExistingUser} />
    );

    const emailInput = screen.getByPlaceholderText('juan@ejemplo.com') as HTMLInputElement;
    expect(emailInput.value).toBe(mockExistingUser.email);
  });

  it('muestra "Guardar Cambios" como texto del botón de submit', () => {
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={vi.fn()} user={mockExistingUser} />
    );

    expect(
      screen.getByRole('button', { name: /guardar cambios/i })
    ).toBeInTheDocument();
  });

  it('muestra la indicación de contraseña opcional en modo edición', () => {
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={vi.fn()} user={mockExistingUser} />
    );

    expect(
      screen.getByText(/dejar vacío para no cambiar/i)
    ).toBeInTheDocument();
  });

  it('el checkbox del rol asignado aparece seleccionado (data-state=checked)', async () => {
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={vi.fn()} user={mockExistingUser} />
    );

    // Esperar que carguen los roles desde MSW
    await waitFor(() => {
      expect(screen.getByText('coordinador')).toBeInTheDocument();
    });

    // Radix UI Checkbox usa data-state en lugar del atributo HTML checked
    const checkboxes = screen.getAllByRole('checkbox');
    const checkedCheckboxes = checkboxes.filter(
      (cb) => cb.getAttribute('data-state') === 'checked'
    );

    // El rol "coordinador" del usuario debe estar marcado
    expect(checkedCheckboxes.length).toBeGreaterThanOrEqual(1);
  });

  it('el checkbox del rol NO asignado aparece desmarcado (data-state=unchecked)', async () => {
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={vi.fn()} user={mockExistingUser} />
    );

    await waitFor(() => {
      expect(screen.getByText('super-admin')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    const uncheckedCheckboxes = checkboxes.filter(
      (cb) => cb.getAttribute('data-state') === 'unchecked'
    );

    // "super-admin" no está en los roles del usuario → debe estar unchecked
    expect(uncheckedCheckboxes.length).toBeGreaterThanOrEqual(1);
  });

  it('el campo de contraseña comienza vacío en modo edición', () => {
    renderWithProviders(
      <UserFormDialog isOpen={true} onClose={vi.fn()} user={mockExistingUser} />
    );

    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    expect(passwordInput.value).toBe('');
  });
});
