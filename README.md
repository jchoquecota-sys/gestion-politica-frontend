# Gestión Política - Frontend

Este es el frontend de la plataforma **Gestión Política**, una aplicación moderna desarrollada con **Next.js** (App Router) y **TypeScript**, optimizada para la administración de estructuras de campaña, control de cargos, sectores y personas vinculadas.

## 🛠️ Tecnologías Principales

*   **Framework:** [Next.js 15+](https://nextjs.org/) (React 19) con soporte de Turbopack.
*   **Diseño y Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) y [shadcn/ui](https://ui.shadcn.com/) para una UI de alto nivel y consistente.
*   **Gestión del Estado:**
    *   **Estado Global:** [Zustand](https://github.com/pmndrs/zustand) para la autenticación y permisos de usuario (RBAC).
    *   **Estado del Servidor (Caché):** [TanStack Query v5](https://tanstack.com/query/latest) (React Query) para la sincronización con el backend.
*   **Cliente HTTP:** [Axios](https://axios-http.com/) con interceptores globales para adjuntar el JWT token y redirigir al login en caso de expiración (error 401).
*   **Testing:**
    *   **Integración y Unitarios:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) + [MSW (Mock Service Worker)](https://mswjs.io/) para mockear la red a nivel de socket.
    *   **E2E (End-to-End):** [Playwright](https://playwright.dev/).

---

## 🚀 Requisitos Previos

Asegúrate de tener instalado en tu entorno de desarrollo:
*   [Node.js](https://nodejs.org/) (Versión v18 o superior recomendada)
*   [npm](https://www.npmjs.com/) (o pnpm / yarn)

---

## ⚙️ Instalación y Configuración

Sigue estos pasos para levantar el entorno local:

1.  **Instalar las dependencias:**
    ```bash
    npm install
    ```

2.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto copiando el archivo de ejemplo:
    ```bash
    cp .env.example .env
    ```
    Asegúrate de que la variable de API apunte al backend correspondiente (local o producción):
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000/api
    ```

3.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    Por defecto, la aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🧪 Pruebas (Testing)

El proyecto cuenta con una infraestructura de pruebas automatizadas que garantiza la integridad del sistema.

### 🧪 Pruebas Unitarias y de Integración (Vitest)
Utilizamos **Vitest** junto con **MSW** para probar hooks de React Query, tiendas de Zustand y componentes interactivos sin necesidad de conectarse a un servidor real de base de datos o backend.

*   **Ejecutar todas las pruebas una sola vez:**
    ```bash
    npm run test:run
    ```
*   **Ejecutar pruebas en modo de observación (Watch Mode):**
    ```bash
    npm run test
    ```

> [!NOTE]
> Las llamadas HTTP a la API están mockeadas a través de los manejadores definidos en `tests/mocks/handlers.ts`. Si creas nuevos endpoints en el backend, debes agregarlos allí para que los componentes puedan ser testeados de manera aislada.

### 🎭 Pruebas End-to-End (Playwright)
Validan flujos de usuario complejos en navegadores reales.

1.  **Instalar los navegadores requeridos por Playwright (solo la primera vez):**
    ```bash
    npx playwright install
    ```
2.  **Ejecutar pruebas E2E en segundo plano:**
    ```bash
    npm run test:e2e
    ```
3.  **Ejecutar pruebas E2E con la interfaz gráfica (UI Mode):**
    ```bash
    npm run test:e2e:ui
    ```

---

## 📂 Estructura del Código

El proyecto sigue una estructura modular orientada a **características (features)** para facilitar la escalabilidad y el trabajo colaborativo:

```text
├── app/                  # Enrutamiento de Next.js (App Router) y páginas
├── components/           # Componentes UI de uso común (ej. shadcn ui elements)
├── features/             # Módulos de negocio aislados
│   ├── auth/             # Autenticación, login, logout
│   ├── personas/         # Gestión de personas, tablas, filtros, modales
│   ├── cargos/           # Roles de campaña y asignación
│   └── sectores/         # Áreas y geolocalización política
│       ├── components/   # Componentes visuales específicos de la feature
│       ├── hooks/        # Hooks de react-query y lógica de negocio
│       └── services/     # Llamadas directas al backend
├── lib/                  # Clientes de axios e inicializadores de utilidades
├── store/                # Estados globales globales (Zustand)
└── tests/                # Infraestructura de pruebas, setup y MSW mocks
```

---

## 🤝 Buenas Prácticas Colaborativas

1.  **Linting y Formateo:**
    Antes de enviar un Pull Request, ejecuta el formateador y el linter para asegurar consistencia en el estilo del código:
    ```bash
    npm run format
    ```
    ```bash
    npm run lint
    ```
2.  **Verificación de Tipos:**
    Asegúrate de que TypeScript compile sin warnings ni errores de tipos:
    ```bash
    npm run typecheck
    ```
3.  **Seguridad:**
    *   Nunca subas archivos `.env` al repositorio de Git.
    *   Si introduces nuevas variables de entorno, regístralas de forma ilustrativa en `.env.example`.
