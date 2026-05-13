# 📖 Guía de Uso API: Gestión de Sectores

Este módulo permite administrar los sectores territoriales, sus encargados y el personal asignado, siguiendo los estándares de auditoría y Soft Deletes definidos en la arquitectura.

---

## 🏗️ Estructura de Datos (Campos Auditables)
Todos los registros en este módulo incluyen automáticamente:
- `created_by`, `updated_by`, `deleted_by`: IDs de usuario que realizaron la acción.
- `deleted_at`: Para borrado lógico (Soft Delete).

---

## 📍 Sectores (`/api/sectores`)

### 1. Listar Sectores
Devuelve todos los sectores con su responsable principal.
- **URL:** `GET /api/sectores`
- **Permiso:** `sectores:list`

### 2. Crear Sector
Permite registrar un sector y opcionalmente vincular personas (encargados).
- **URL:** `POST /api/sectores`
- **Permiso:** `sectores:create`
- **Body (JSON):**
```json
{
  "nombre": "Sector 01 - Centro Histórico",
  "descripcion": "Zona monumental de la ciudad",
  "codigo": "SEC-01",
  "referencia_ubicacion": "Plaza de Armas",
  "personas": [
    {
      "persona_id": 1,
      "cargo_id": 1,
      "es_principal": true,
      "observaciones": "Encargado de turno mañana"
    }
  ]
}
```

### 3. Ver Detalle
- **URL:** `GET /api/sectores/{id}`
- **Permiso:** `sectores:view`

### 4. Actualizar Sector
- **URL:** `PUT /api/sectores/{id}`
- **Permiso:** `sectores:edit`

### 5. Eliminar Sector (Soft Delete)
- **URL:** `DELETE /api/sectores/{id}`
- **Permiso:** `sectores:delete`

---

## 👤 Personas (`/api/personas`)
Gestión de ciudadanos o contactos que pueden ser vinculados a sectores.

- **GET `/api/personas`**: Listar todas.
- **POST `/api/personas`**: Registrar nueva persona.
  - Campos: `nombres`, `apellidos`, `dni` (8 digitos), `celular`, `email`, `direccion`.
- **PUT `/api/personas/{id}`**: Actualizar datos.
- **DELETE `/api/personas/{id}`**: Eliminar.

---

## 🏷️ Cargos (`/api/cargos`)
Definición de roles dentro de un sector (Ej: Responsable, Colaborador).

- **GET `/api/cargos`**: Listar cargos disponibles.
- **POST `/api/cargos`**: Crear nuevo cargo (Ej: "Coordinador de Seguridad").

---

## 💡 Notas para Frontend
1. **Responsable Principal**: En el listado de sectores, el campo `responsable` contiene el objeto de la persona con `es_principal: true`.
2. **Auditoría**: El campo `auditoria` en las respuestas muestra los nombres de los usuarios que crearon/actualizaron el registro, facilitando la trazabilidad en la UI.
3. **Manejo de Errores**: Todas las respuestas fallidas devuelven un JSON con `status: "error"` y un mensaje descriptivo.
