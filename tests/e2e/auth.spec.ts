import { test, expect } from '@playwright/test';

/**
 * Tests E2E – Autenticación y Gestión de Roles
 *
 * Todos los endpoints del backend son interceptados con page.route()
 * para que las pruebas funcionen de forma completamente autónoma.
 */

// ──────────────────────────────────────────────
// Datos mockeados
// ──────────────────────────────────────────────
const MOCK_TOKEN = 'fake-jwt-token-e2e';

const MOCK_USER = {
  id: 1,
  name: 'Juan Pérez',
  email: 'admin@gestion-politica.local',
  roles: ['super-admin'],
  permissions: [
    'roles:view',
    'roles:create',
    'roles:edit',
    'roles:delete',
    'users:view',
  ],
};

const MOCK_ROLES = [
  {
    id: 1,
    name: 'super-admin',
    permissions: ['roles:view', 'roles:create', 'roles:edit', 'roles:delete'],
    created_at: '2026-07-12T00:00:00Z',
    updated_at: '2026-07-12T00:00:00Z',
  },
  {
    id: 2,
    name: 'coordinador',
    permissions: ['users:view'],
    created_at: '2026-07-12T00:00:00Z',
    updated_at: '2026-07-12T00:00:00Z',
  },
];

const MOCK_PERMISSIONS = [
  'roles:view',
  'roles:create',
  'roles:edit',
  'roles:delete',
  'users:view',
  'users:create',
  'users:edit',
  'users:delete',
];

// ──────────────────────────────────────────────
async function interceptApiRoutes(page: ReturnType<typeof test.info>['project'] extends never ? never : Parameters<Parameters<typeof test>[1]>[0]['page']) {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.endsWith('/api/login')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: MOCK_TOKEN, user: MOCK_USER }),
      });
    } else if (url.endsWith('/api/me')) {
      const headers = route.request().headers();
      const authHeader = headers['authorization'];
      
      if (!authHeader || !authHeader.includes(MOCK_TOKEN)) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Unauthenticated.' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ user: MOCK_USER }),
        });
      }
    } else if (url.endsWith('/api/roles/permissions')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_PERMISSIONS }),
      });
    } else if (url.endsWith('/api/roles')) {
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: MOCK_ROLES }),
        });
      } else if (method === 'POST') {
        const body = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 3,
            name: body.name,
            permissions: body.permissions || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
      } else {
        await route.continue();
      }
    } else if (url.includes('/api/roles/')) {
      // Operaciones sobre rol específico
      if (method === 'PUT') {
        const body = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 2,
            name: body.name,
            permissions: body.permissions || [],
            created_at: '2026-07-12T00:00:00Z',
            updated_at: new Date().toISOString(),
          }),
        });
      } else if (method === 'DELETE') {
        await route.fulfill({ status: 204 });
      } else {
        await route.continue();
      }
    } else if (url.endsWith('/api/opciones/roles')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_ROLES.map((r) => ({ id: r.id, name: r.name })) }),
      });
    } else {
      console.warn('⚠️ E2E Playwright - Petición no mockeada detectada:', method, url);
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Mocked endpoint not found' }),
      });
    }
  });
}

// ──────────────────────────────────────────────
// Helper: inyectar sesión activa sin pasar por login
// ──────────────────────────────────────────────
async function setAuthInLocalStorage(page: Parameters<Parameters<typeof test>[1]>[0]['page']) {
  // Mockear /me para que responda 200 en esta página activa
  await page.route('**/api/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: MOCK_USER }),
    });
  });

  // Navegar primero para tener acceso al localStorage del dominio
  await page.goto('/login');
  await page.evaluate(
    ([token, user]) => {
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({ state: { token, user }, version: 0 })
      );
    },
    [MOCK_TOKEN, MOCK_USER]
  );
}

// ══════════════════════════════════════════════
// SUITE 1: Flujo de Autenticación
// ══════════════════════════════════════════════
test.describe('Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    await interceptApiRoutes(page);
  });

  test('muestra la página de login al acceder a /login', async ({ page }) => {
    await page.goto('/login');

    await expect(
      page.locator('text=Iniciar sesión').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('hace login con el botón de submit y redirige a /roles', async ({ page }) => {
    await page.goto('/login');

    await expect(
      page.locator('text=Iniciar sesión').first()
    ).toBeVisible({ timeout: 10_000 });

    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/roles/, { timeout: 15_000 });
  });

  test('muestra "Gestión de Roles" en la página destino tras login', async ({ page }) => {
    await page.goto('/login');
    await page.locator('button[type="submit"]').click();

    await expect(
      page.locator('text=Gestión de Roles').first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('redirige a /login si se accede a /roles sin sesión', async ({ page }) => {
    // No inyectamos sesión → el middleware debe redirigir
    await page.goto('/roles');

    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});

// ══════════════════════════════════════════════
// SUITE 2: Gestión de Roles
// ══════════════════════════════════════════════
test.describe('Gestión de Roles', () => {
  test.beforeEach(async ({ page }) => {
    await interceptApiRoutes(page);
    await setAuthInLocalStorage(page);
    await page.goto('/roles');

    // Esperar que la tabla cargue
    await expect(
      page.locator('text=super-admin').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('muestra el título "Gestión de Roles"', async ({ page }) => {
    await expect(
      page.locator('text=Gestión de Roles').first()
    ).toBeVisible();
  });

  test('muestra todos los roles de la lista simulada', async ({ page }) => {
    await expect(page.locator('text=super-admin').first()).toBeVisible();
    await expect(page.locator('text=coordinador').first()).toBeVisible();
  });

  test('muestra el badge "Sistema" en el rol super-admin', async ({ page }) => {
    await expect(page.locator('text=Sistema').first()).toBeVisible();
  });

  test('abre el formulario "Crear Nuevo Rol" al hacer click en el botón de crear', async ({ page }) => {
    // Buscar el botón que contiene "Crear" o "Nuevo"
    const createBtn = page
      .locator('button')
      .filter({ hasText: /crear|nuevo rol/i })
      .first();

    await createBtn.click();

    await expect(
      page.locator('text=Crear Nuevo Rol').first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('el formulario de creación de rol carga los permisos agrupados por módulo', async ({ page }) => {
    const createBtn = page
      .locator('button')
      .filter({ hasText: /crear|nuevo rol/i })
      .first();

    await createBtn.click();

    await expect(
      page.locator('text=Módulo: roles').first()
    ).toBeVisible({ timeout: 5_000 });

    await expect(
      page.locator('text=Módulo: users').first()
    ).toBeVisible();
  });

  test('el botón Cancelar cierra el formulario de crear rol', async ({ page }) => {
    const createBtn = page
      .locator('button')
      .filter({ hasText: /crear|nuevo rol/i })
      .first();

    await createBtn.click();

    await expect(page.locator('text=Crear Nuevo Rol').first()).toBeVisible();

    await page.locator('button').filter({ hasText: /cancelar/i }).click();

    await expect(
      page.locator('text=Crear Nuevo Rol')
    ).not.toBeVisible({ timeout: 3_000 });
  });
});
