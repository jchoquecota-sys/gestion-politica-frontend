# 🏛️ Guía de Arquitectura Frontend - Gestión Política

Esta guía define los estándares, la estructura y las convenciones para mantener el proyecto frontend escalable, profesional y mantenible.

## 🛠️ Tecnologías Core
- **Framework:** Next.js 16 (App Router)
- **Estilos:** TailwindCSS + Shadcn UI (Componentes base)
- **Estado Global:** Zustand (Para auth y estados UI globales)
- **Estado del Servidor (Caché):** TanStack Query (React Query v5)
- **Peticiones HTTP:** Axios (Con interceptores para manejar tokens)
- **Formularios:** React Hook Form + Zod (Validaciones)

---

## 📁 Estructura de Carpetas

Adoptamos una arquitectura orientada a características (**Feature-based architecture**). Cada módulo nuevo debe estar autocontenido lo más posible para facilitar la mantenibilidad.

```
src/ (o raíz si no se usa src)
├── app/                  # Rutas de Next.js (App Router)
│   ├── (auth)/           # Grupo de rutas de autenticación (login, etc.)
│   ├── (dashboard)/      # Grupo de rutas protegidas (layout con sidebar)
│   │   ├── roles/        # Páginas del módulo de roles
│   │   └── page.tsx      # Dashboard principal
│   ├── layout.tsx        # Root layout (Providers, fuentes)
│   └── globals.css       # Estilos globales y Tailwind
├── components/           # Componentes UI compartidos
│   ├── ui/               # Componentes genéricos (Shadcn UI)
│   └── layout/           # Sidebar, Navbar, etc.
├── features/             # 🌟 Módulos del sistema (Arquitectura Escalable)
│   ├── auth/             # Módulo de autenticación
│   │   ├── components/   # Componentes específicos (LoginForm)
│   │   ├── hooks/        # Hooks de react-query (useLogin, useProfile)
│   │   └── types/        # Tipos TypeScript
│   └── roles/            # Módulo de roles
│       ├── components/   # RolesTable, RoleForm
│       ├── hooks/        # useRoles, useRole, useCreateRole
│       └── types/        # Interfaces y tipos de roles
├── hooks/                # Hooks personalizados compartidos
├── lib/                  # Utilidades y configuración de librerías
│   ├── axios.ts          # Configuración de instancia Axios
│   ├── queryClient.ts    # Configuración de TanStack Query
│   └── utils.ts          # Utilidades (cn para Tailwind, etc.)
├── store/                # Estados globales (Zustand)
│   └── useAuthStore.ts   # Manejo del estado del usuario logueado
└── types/                # Tipos compartidos globales (Pagination, API responses)
```

---

## 🚀 Flujo de Trabajo para Nuevos Módulos

Para añadir un **nuevo módulo** (Ejemplo: `Usuarios`):

### 1. Definir Tipos (`features/usuarios/types/index.ts`)
Define las interfaces basadas en lo que retorna y espera el backend.
```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
}
```

### 2. Crear los Hooks de API (`features/usuarios/hooks/index.ts`)
Centraliza las llamadas HTTP usando Axios y React Query. No uses Axios directamente en los componentes.
```typescript
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data;
    }
  });
};
```

### 3. Crear Componentes de la Feature (`features/usuarios/components/`)
Crea formularios, tablas y vistas necesarias.
- **Formularios:** Usa `react-hook-form` y valida con `zod`.
- **Componentes Base:** Usa los componentes genéricos de `components/ui` (Shadcn).

### 4. Conectar en Rutas (`app/(dashboard)/usuarios/page.tsx`)
Renderiza los componentes en la página correspondiente de Next.js, manteniéndola lo más simple posible.

---

## 🔒 Manejo de Autenticación y Autorización

### Zustand (`useAuthStore`)
Guarda el token y la información del usuario (`user`, `permissions`).
- **Login:** Al hacer login, guarda el token en `localStorage` o `cookies` y en el store de Zustand.
- **Hydration:** Al recargar la app, verifica si hay token e invoca el endpoint `/me` para re-hidratar el estado del usuario y sus permisos actualizados.

### Axios Interceptors (`lib/axios.ts`)
- **Request:** Adjunta automáticamente el `Bearer Token` si existe en el estado.
- **Response:** Si hay un error `401`, dispara la acción de logout automáticamente y redirige a `/login`.

### Control de Acceso UI
Crea un componente o hook (ej. `HasPermission`) que revise si el `user` del store incluye un permiso específico (ej. `roles:create`) para renderizar un botón.
