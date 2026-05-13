# 📖 Guía de Uso API: Gestión de Bases

Este módulo gestiona las bases territoriales que pertenecen a un sector. Incluye geolocalización y asignación de personal especializado.

---

## 🏗️ Lógica de Listado (Filtros y Permisos)
El listado de bases tiene un comportamiento especial basado en permisos:

1.  **Permiso `bases:list-all`**: Si el usuario tiene este permiso (ej: Super Admin), puede ver todas las bases del sistema.
2.  **Sin permiso especial**: Es **obligatorio** enviar el parámetro `sector_id` en la URL. De lo cual contrario, el sistema devolverá un error `403 Forbidden`.

---

## 📍 Bases (`/api/bases`)

### 1. Listar Bases
- **URL:** `GET /api/bases?sector_id={id}`
- **Permiso:** `bases:list`
- **Nota:** Si tienes `bases:list-all`, puedes omitir `sector_id`.

### 2. Crear Base
Permite registrar una base vinculada a un sector con coordenadas para el mapa.
- **URL:** `POST /api/bases`
- **Permiso:** `bases:create`
- **Body (JSON):**
```json
{
  "sector_id": 1,
  "nombre": "Base Naval - Puerto",
  "descripcion": "Base principal de vigilancia costera",
  "direccion": "Av. La Marina 123",
  "latitud": -12.046374,
  "longitud": -77.042793,
  "personas": [
    {
      "persona_id": 2,
      "cargo_id": 3,
      "es_principal": true,
      "fecha_inicio": "2024-05-13",
      "observaciones": "Líder de base"
    }
  ]
}
```

### 3. Ver Detalle
Devuelve la información completa incluyendo el sector al que pertenece y el equipo asignado.
- **URL:** `GET /api/bases/{id}`
- **Permiso:** `bases:view`

### 4. Actualizar Base
- **URL:** `PUT /api/bases/{id}`
- **Permiso:** `bases:edit`

### 5. Eliminar Base (Soft Delete)
- **URL:** `DELETE /api/bases/{id}`
- **Permiso:** `bases:delete`

---

## 💡 Notas para Frontend
1.  **Mapa**: Los campos `latitud` y `longitud` se devuelven dentro del objeto `coordenadas`. Asegúrate de validar que no sean nulos antes de renderizar en el mapa.
2.  **Integridad**: No se puede crear una base sin un `sector_id` válido.
3.  **Filtrado en UI**: Se recomienda que al entrar al módulo de Bases, si el usuario no es Super Admin, primero seleccione un Sector para disparar el listado.
