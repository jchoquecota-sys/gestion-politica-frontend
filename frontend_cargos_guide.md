# 🚀 Guía de Implementación Frontend: Gestión de Cargos

Esta guía detalla cómo integrar el módulo de cargos en el frontend de forma profesional y escalable.

---

## 1. Definición de Interfaces (TypeScript)

Define el modelo de datos para asegurar la consistencia.

```typescript
export interface Cargo {
  id: number;
  nombre: string;
  descripcion: string;
  auditoria: {
    creado_por: string;
    creado_el: string;
    actualizado_por: string | null;
    actualizado_el: string;
  };
}

export interface CargoFormData {
  nombre: string;
  descripcion?: string;
}
```

---

## 2. Servicio de API

Implementa los métodos para interactuar con el backend.

```typescript
// cargos.service.ts
const API_URL = '/api/cargos';

export const getCargos = () => http.get(API_URL);
export const createCargo = (data: CargoFormData) => http.post(API_URL, data);
export const updateCargo = (id: number, data: CargoFormData) => http.put(`${API_URL}/${id}`, data);
export const deleteCargo = (id: number) => http.delete(`${API_URL}/${id}`);
```

---

## 3. Consideraciones de UX

### Validación Preventiva
- **Nombre Único**: El backend validará que el nombre no se repita. En el frontend, captura el error 422 y muestra el mensaje `errors.nombre`.
- **Eliminación Protegida**: Si intentas eliminar un cargo que ya está asignado a una persona en un sector, el backend devolverá un error 422. Debes mostrar una alerta informativa: *"No se puede eliminar el cargo porque tiene personas asignadas"*.

### Auditoría
- Utiliza el objeto `auditoria` para mostrar tooltips en la tabla que indiquen quién creó el registro y cuándo fue la última modificación.

---

## 4. Ejemplo de Flujo (CargosTable.tsx)

```tsx
const handleDelete = async (id: number) => {
  const confirm = await confirmDialog("¿Estás seguro de eliminar este cargo?");
  if (confirm) {
    try {
      await deleteCargo(id);
      toast.success("Cargo eliminado correctamente");
      fetchCargos(); // Recargar tabla
    } catch (error: any) {
      if (error.status === 422) {
        toast.error(error.data.message); // Error de integridad (está en uso)
      } else {
        toast.error("Ocurrió un error inesperado");
      }
    }
  }
};
```

---

## 5. Endpoints Disponibles
- `GET /api/cargos`: Lista completa.
- `POST /api/cargos`: Registro `{ nombre, descripcion }`.
- `PUT /api/cargos/{id}`: Actualización `{ nombre, descripcion }`.
- `DELETE /api/cargos/{id}`: Eliminación lógica.
