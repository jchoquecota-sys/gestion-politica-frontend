# 📘 Guía de Implementación: Módulo de Actividades

Esta guía detalla cómo interactuar con el nuevo módulo de Actividades desde el Frontend.

---

## 🔐 Sistema de Permisos

El acceso a las actividades está restringido por tres niveles de permisos:

1.  **`actividades:manage-all`**: Acceso total. Ideal para administradores centrales.
2.  **`actividades:manage-sector`**: Permite gestionar actividades vinculadas a los sectores del usuario, sus bases y personas pertenecientes a dichos sectores/bases.
3.  **`actividades:manage-base`**: Restringe el acceso únicamente a registros vinculados a la base específica del usuario y sus personas.

> [!NOTE]
> Un usuario siempre tendrá acceso a las actividades que él mismo haya creado (`created_by`), independientemente de los permisos anteriores.

---

## 🚀 Endpoints de la API

### 1. Tipos de Actividad
Utiliza estos endpoints para llenar selectores o gestionar categorías de actividades.

*   **GET `/api/tipos-actividad`**
    *   **Descripción**: Lista todos los tipos disponibles (ej: Mitin, Capacitación).
    *   **Respuesta**:
        ```json
        {
            "status": "success",
            "data": [
                { "id": 1, "nombre": "Mitin", "descripcion": "..." },
                { "id": 2, "nombre": "Reunión", "descripcion": "..." }
            ]
        }
        ```

### 2. Gestión de Actividades

*   **GET `/api/actividades`**
    *   **Filtros aceptados**: `tipo_actividad_id`, `estado` (borrador|creada|cancelada), `search`, `sort_by`, `sort_order`, `per_page`.
    *   **Respuesta**: Estructura paginada estándar.

*   **POST `/api/actividades`**
    *   **Cuerpo (JSON)**:
        ```json
        {
            "titulo": "Gran Mitin Vecinal",
            "descripcion": "Reunión para coordinar acciones",
            "fecha_actividad": "2026-06-15 18:00:00",
            "tipo_actividad_id": 1,
            "estado": "creada",
            "sujetos": [
                {
                    "sujeto_id": 5,
                    "sujeto_type": "sector",
                    "descripcion_ejecucion": "Responsable del sector sur",
                    "evidencias": ["url_foto_1.jpg"]
                },
                {
                    "sujeto_id": 12,
                    "sujeto_type": "persona",
                    "descripcion_ejecucion": "Coordinador de zona"
                }
            ]
        }
        ```
    *   **Valores válidos para `sujeto_type`**: `persona`, `base`, `sector`.

*   **GET `/api/actividades/{id}`**: Obtiene el detalle completo.
*   **PUT `/api/actividades/{id}`**: Actualiza datos y sujetos (reemplaza lista de sujetos).
*   **DELETE `/api/actividades/{id}`**: Eliminación lógica (Soft Delete).

---

## 🛠️ Estructura de Datos de "Sujetos"

Las actividades son polimórficas, lo que significa que pueden estar vinculadas a diferentes tipos de entidades simultáneamente.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `sujeto_id` | Integer | ID de la Persona, Base o Sector. |
| `sujeto_type` | String | `persona`, `base` o `sector`. |
| `descripcion_ejecucion`| Text | Detalles específicos de lo que hizo ese sujeto en la actividad. |
| `evidencias` | JSON | Array de strings (URLs) o IDs de documentos/fotos. |

---

## 💡 Tips para el Frontend

1.  **Selector de Sujetos**: Al crear una actividad, permite al usuario buscar personas, bases o sectores. Envía el tipo correspondiente en `sujeto_type`.
2.  **Estados**: Utiliza el enum `borrador`, `creada`, `cancelada` para mostrar badges de colores.
3.  **Fechas**: Envía siempre la fecha en formato `YYYY-MM-DD HH:mm:ss`.
