import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { server } from './mocks/server';

// Iniciar el servidor MSW antes de todas las pruebas
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Resetear manejadores entre pruebas (limpia simulaciones específicas)
afterEach(() => server.resetHandlers());

// Cerrar el servidor después de terminar todas las pruebas
afterAll(() => server.close());

// Mock de Next.js Navigation para evitar errores en pruebas de integración de componentes
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: vi.fn(),
      replace: vi.fn(),
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock de window.matchMedia (a menudo requerido por UI Radix/Shadcn)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Obsoleto
    removeListener: vi.fn(), // Obsoleto
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock de ResizeObserver para componentes Radix/Shadcn
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver;

// Mock de PointerEvent (requerido por Radix en JSDOM)
if (typeof window !== 'undefined' && !window.PointerEvent) {
  class MockPointerEvent extends Event {
    button = 0;
    ctrlKey = false;
    pointerType = 'mouse';
    constructor(type: string, props: any = {}) {
      super(type, props);
      this.button = props.button || 0;
      this.ctrlKey = props.ctrlKey || false;
      this.pointerType = props.pointerType || 'mouse';
    }
  }
  window.PointerEvent = MockPointerEvent as any;
}
