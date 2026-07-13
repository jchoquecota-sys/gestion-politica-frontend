import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:8000/api';

// ─── Helpers de datos de prueba ──────────────────────────
const MOCK_USER_ADMIN = {
  id: 1,
  name: 'Juan Perez',
  email: 'admin@test.com',
  roles: ['super-admin'],
  permissions: [
    'roles:view', 'roles:create', 'roles:edit', 'roles:delete',
    'users:view', 'users:create', 'users:edit', 'users:delete',
    'personas:view', 'personas:create', 'personas:edit', 'personas:delete',
    'personas:list-all',
    'cargos:view', 'cargos:create', 'cargos:edit', 'cargos:delete',
    'sectores:view', 'sectores:create', 'sectores:edit', 'sectores:delete',
  ],
};

export const handlers = [
  // ──────────────────────────────────────────────
  // AUTH
  // ──────────────────────────────────────────────
  http.post(`${API_URL}/login`, async ({ request }) => {
    const data = (await request.json()) as { email: string; password: string };
    if (data.email === 'bad@test.com') {
      return HttpResponse.json(
        { message: 'Credenciales incorrectas.' },
        { status: 401 }
      );
    }
    return HttpResponse.json({
      token: 'fake-jwt-token',
      user: { ...MOCK_USER_ADMIN, email: data.email },
    });
  }),

  http.post(`${API_URL}/logout`, () => {
    return HttpResponse.json({ message: 'Logged out' });
  }),

  http.get(`${API_URL}/me`, () => {
    return HttpResponse.json({ user: MOCK_USER_ADMIN });
  }),

  // ──────────────────────────────────────────────
  // PERMISSIONS
  // ──────────────────────────────────────────────
  http.get(`${API_URL}/roles/permissions`, () => {
    return HttpResponse.json({
      data: [
        'roles:view', 'roles:create', 'roles:edit', 'roles:delete',
        'users:view', 'users:create', 'users:edit', 'users:delete',
      ],
    });
  }),

  // ──────────────────────────────────────────────
  // ROLES
  // ──────────────────────────────────────────────
  http.get(`${API_URL}/roles`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          name: 'super-admin',
          permissions: ['roles:view', 'roles:create', 'roles:edit', 'roles:delete',
            'users:view', 'users:create', 'users:edit', 'users:delete'],
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
      ],
    });
  }),

  http.get(`${API_URL}/opciones/roles`, () => {
    return HttpResponse.json({
      data: [
        { id: 1, name: 'super-admin' },
        { id: 2, name: 'coordinador' },
      ],
    });
  }),

  http.post(`${API_URL}/roles`, async ({ request }) => {
    const data = (await request.json()) as { name: string; permissions: string[] };
    return HttpResponse.json(
      { id: 3, name: data.name, permissions: data.permissions,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { status: 201 }
    );
  }),

  http.put(`${API_URL}/roles/:id`, async ({ request, params }) => {
    const data = (await request.json()) as { name: string; permissions: string[] };
    return HttpResponse.json({
      id: Number(params.id), name: data.name, permissions: data.permissions,
      created_at: '2026-07-12T00:00:00Z', updated_at: new Date().toISOString(),
    });
  }),

  http.delete(`${API_URL}/roles/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ──────────────────────────────────────────────
  // USERS
  // ──────────────────────────────────────────────
  http.get(`${API_URL}/users`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1, name: 'Juan Perez', email: 'juan@test.com',
          roles: ['super-admin'], permissions: ['roles:view', 'roles:create'],
          created_at: '2026-07-12T00:00:00Z', persona: null,
        },
        {
          id: 2, name: 'Ana García', email: 'ana@test.com',
          roles: ['coordinador'], permissions: ['users:view'],
          created_at: '2026-07-13T00:00:00Z',
          persona: { id: 1, nombre_completo: 'Ana María García' },
        },
      ],
    });
  }),

  http.post(`${API_URL}/users`, async ({ request }) => {
    const data = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { id: 3, name: data.name, email: data.email,
        roles: data.roles || [], permissions: [],
        created_at: new Date().toISOString(), persona: null },
      { status: 201 }
    );
  }),

  http.put(`${API_URL}/users/:id`, async ({ request, params }) => {
    const data = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: Number(params.id), name: data.name, email: data.email,
      roles: data.roles || [], permissions: [],
      created_at: '2026-07-12T00:00:00Z', persona: null,
    });
  }),

  http.delete(`${API_URL}/users/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ──────────────────────────────────────────────
  // PERSONAS
  // ──────────────────────────────────────────────
  http.get(`${API_URL}/personas`, () => {
    return HttpResponse.json({
      status: 'success',
      data: [
        {
          id: 1, nombres: 'Ana María', apellidos: 'García López',
          nombre_completo: 'Ana María García López',
          dni: '12345678', celular: '0991234567',
          email: 'ana@test.com', direccion: 'Calle Principal 123',
          foto_url: null, created_at: '2026-07-12T00:00:00Z',
        },
        {
          id: 2, nombres: 'Carlos', apellidos: 'López Martínez',
          nombre_completo: 'Carlos López Martínez',
          dni: '87654321', celular: '0997654321',
          email: 'carlos@test.com', direccion: null,
          foto_url: null, created_at: '2026-07-13T00:00:00Z',
        },
      ],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 2 },
    });
  }),

  http.get(`${API_URL}/opciones/personas`, () => {
    return HttpResponse.json({
      data: [
        { id: 1, nombre_completo: 'Ana María García', dni: '12345678' },
        { id: 2, nombre_completo: 'Carlos López', dni: '87654321' },
      ],
    });
  }),

  http.post(`${API_URL}/personas`, async () => {
    return HttpResponse.json(
      {
        id: 3, nombres: 'Nuevo', apellidos: 'Persona',
        nombre_completo: 'Nuevo Persona',
        dni: '11111111', celular: null, email: null,
        direccion: null, foto_url: null,
        created_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.post(`${API_URL}/personas/:id`, async ({ params }) => {
    // Laravel spoofing: POST con _method=PUT
    return HttpResponse.json({
      id: Number(params.id), nombres: 'Actualizado', apellidos: 'Persona',
      dni: '12345678', updated_at: new Date().toISOString(),
    });
  }),

  http.delete(`${API_URL}/personas/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ──────────────────────────────────────────────
  // CARGOS
  // ──────────────────────────────────────────────
  http.get(`${API_URL}/cargos`, () => {
    return HttpResponse.json({
      status: 'success',
      data: [
        {
          id: 1, nombre: 'Coordinador Zonal', descripcion: 'Coordina la zona asignada',
          auditoria: { creado_por: 'Admin', creado_el: '2026-07-12T00:00:00Z',
            actualizado_por: null, actualizado_el: '2026-07-12T00:00:00Z' },
        },
        {
          id: 2, nombre: 'Promotor Electoral', descripcion: 'Realiza actividades de promoción',
          auditoria: { creado_por: 'Admin', creado_el: '2026-07-12T00:00:00Z',
            actualizado_por: null, actualizado_el: '2026-07-12T00:00:00Z' },
        },
      ],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 2 },
    });
  }),

  http.get(`${API_URL}/opciones/cargos`, () => {
    return HttpResponse.json({
      data: [
        { id: 1, nombre: 'Coordinador Zonal' },
        { id: 2, nombre: 'Promotor Electoral' },
      ],
    });
  }),

  http.post(`${API_URL}/cargos`, async ({ request }) => {
    const data = (await request.json()) as { nombre: string; descripcion?: string };
    return HttpResponse.json(
      {
        id: 3, nombre: data.nombre, descripcion: data.descripcion || '',
        auditoria: { creado_por: 'Admin', creado_el: new Date().toISOString(),
          actualizado_por: null, actualizado_el: new Date().toISOString() },
      },
      { status: 201 }
    );
  }),

  http.put(`${API_URL}/cargos/:id`, async ({ request, params }) => {
    const data = (await request.json()) as { nombre: string; descripcion?: string };
    return HttpResponse.json({
      id: Number(params.id), nombre: data.nombre, descripcion: data.descripcion || '',
      auditoria: { creado_por: 'Admin', creado_el: '2026-07-12T00:00:00Z',
        actualizado_por: 'Admin', actualizado_el: new Date().toISOString() },
    });
  }),

  http.delete(`${API_URL}/cargos/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ──────────────────────────────────────────────
  // SECTORES
  // ──────────────────────────────────────────────
  http.get(`${API_URL}/sectores`, () => {
    return HttpResponse.json({
      status: 'success',
      data: [
        {
          id: 1, nombre: 'Sector Norte', codigo: 'SN-01',
          descripcion: 'Sector ubicado en la zona norte',
          referencia_ubicacion: 'Av. Norte 100',
          responsable: { id: 1, nombre_completo: 'Ana García', cargo: 'Coordinador Zonal' },
          created_at: '2026-07-12T00:00:00Z',
        },
        {
          id: 2, nombre: 'Sector Sur', codigo: 'SS-01',
          descripcion: 'Sector ubicado en la zona sur',
          referencia_ubicacion: null,
          responsable: null,
          created_at: '2026-07-13T00:00:00Z',
        },
      ],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 2 },
    });
  }),

  http.get(`${API_URL}/opciones/sectores`, () => {
    return HttpResponse.json({
      data: [
        { id: 1, nombre: 'Sector Norte' },
        { id: 2, nombre: 'Sector Sur' },
      ],
    });
  }),

  http.get(`${API_URL}/sectores/:id`, ({ params }) => {
    return HttpResponse.json({
      data: {
        id: Number(params.id), nombre: 'Sector Norte', codigo: 'SN-01',
        descripcion: 'Sector norte', referencia_ubicacion: 'Av. Norte 100',
        responsable: { id: 1, nombre_completo: 'Ana García', cargo: 'Coordinador Zonal' },
        equipo: [],
      },
    });
  }),

  http.post(`${API_URL}/sectores`, async ({ request }) => {
    const data = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: 3, nombre: data.nombre, codigo: data.codigo,
        descripcion: data.descripcion || null, referencia_ubicacion: null,
        responsable: null, created_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.put(`${API_URL}/sectores/:id`, async ({ request, params }) => {
    const data = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: Number(params.id), nombre: data.nombre, codigo: data.codigo,
      descripcion: data.descripcion || null, updated_at: new Date().toISOString(),
    });
  }),

  http.delete(`${API_URL}/sectores/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ──────────────────────────────────────────────
  // BASES (opciones)
  // ──────────────────────────────────────────────
  http.get(`${API_URL}/opciones/bases`, () => {
    return HttpResponse.json({
      data: [
        { id: 1, nombre: 'Base Central' },
        { id: 2, nombre: 'Base Norte' },
      ],
    });
  }),
];
