# Backend NoteFlow: arquitectura, REST, SQL y JOINs

Documento del curso para la API **`noteflow-api`** (Next.js + Neon PostgreSQL). La app móvil Expo **no** se conecta directamente a la base de datos: consume la API vía HTTP (`lib/api.ts`).

---

## Arquitectura cliente-servidor

### Por qué la app no habla con PostgreSQL

Si el **connection string** de PostgreSQL estuviera embebido en el binario de la app, cualquiera que la descompilase tendría **acceso completo** a la base de datos: leer, modificar y borrar datos de todos los usuarios.

El patrón correcto es **cliente-servidor** en tres capas:

```text
┌─────────────────────┐     HTTP/JSON      ┌──────────────────────┐     SQL      ┌─────────────────────┐
│  App móvil NoteFlow │  ───────────────►  │  API noteflow-api    │  ─────────►  │  PostgreSQL (Neon)  │
│  (Expo + Zustand)   │  ◄───────────────  │  (Next.js Route      │  ◄─────────  │                     │
│  lib/api.ts         │                    │   Handlers)          │              │  notes, items, tags │
└─────────────────────┘                    └──────────────────────┘              └─────────────────────┘
     Cliente                                       Guardián / servidor                    Persistencia
```

| Capa | Ubicación en el repo | Responsabilidad |
|------|----------------------|-----------------|
| **Cliente (móvil)** | `app/`, `store/notesStore.ts`, `lib/api.ts` | UI, estado local, llamadas HTTP tipadas |
| **API (servidor)** | `noteflow-api/app/api/` | Validar entradas (Zod), reglas de negocio, no exponer secretos |
| **Base de datos** | Neon (remoto) + `sql/schema.sql` | Persistencia relacional, consultas SQL parametrizadas |

### Flujo de una petición típica (GET notas)

1. El usuario abre la app → `StoreHydrationGate` llama a `fetchNotes()`.
2. El store invoca `getNotes()` en `lib/api.ts`.
3. El cliente hace `GET {EXPO_PUBLIC_API_URL}/notes`.
4. Next.js ejecuta `GET` en `app/api/notes/route.ts`.
5. La ruta llama a `query(NOTES_LIST_SQL)` → Neon ejecuta el SQL con JOINs.
6. La API devuelve JSON (snake_case) → el cliente mapea a camelCase y reparte en `notes`, `checklists`, `ideas`.

```text
Pantalla → Zustand → lib/api.ts → fetch → route.ts → db.ts → Neon
                ↑                                              │
                └──────── JSON (ApiNoteRow[]) ◄────────────────┘
```

### Estructura del proyecto backend

```text
noteflow-api/
  app/api/
    notes/route.ts                    # GET (lista), POST (crear)
    notes/[id]/route.ts               # GET, PATCH, DELETE por id
    notes/[id]/checklist-items/route.ts  # GET, POST ítems de una nota
    checklist-items/[itemId]/route.ts    # PATCH, DELETE ítem suelto
  lib/
    db.ts                             # Cliente Neon + query() parametrizada
    noteQueries.ts                    # SQL reutilizable con JOINs
  .env.local                          # DATABASE_URL (no en git)
  .env.example                        # Plantilla vacía
sql/
  schema.sql                          # DDL: tablas y relaciones
  queries.sql                         # Consulta de referencia con JOINs
```

---

## Fundamentos de base de datos relacional

Las bases de datos relacionales organizan la información en **tablas** (filas + columnas). Cada tabla representa una entidad del dominio y se conectan mediante **claves foráneas**.

### ACID (transacciones fiables)

| Propiedad | Significado | Ejemplo NoteFlow |
|-----------|-------------|------------------|
| **Atomicidad** | Todo o nada | Crear nota + ítems en una transacción futura |
| **Consistencia** | Reglas siempre válidas | `type` solo puede ser `note`, `checklist` o `idea` |
| **Aislamiento** | Transacciones no se pisan | Dos PATCH simultáneos no corrompen datos |
| **Durabilidad** | Lo confirmado persiste | Tras archivar, el dato sigue en Neon |

### Primary Key y Foreign Key

- **Primary Key (PK):** identificador único de cada fila. En NoteFlow usamos **UUID** (`gen_random_uuid()`), útil para sincronización offline futura.
- **Foreign Key (FK):** columna que referencia la PK de otra tabla. Ejemplo: `checklist_items.note_id → notes.id`.
- **`ON DELETE CASCADE`:** al borrar una nota, se eliminan automáticamente sus `checklist_items` y `note_tags` (sin registros huérfanos).

### DDL vs DML

| Tipo | Comandos | Uso en NoteFlow |
|------|----------|-----------------|
| **DDL** | `CREATE`, `ALTER`, `DROP` | `sql/schema.sql` al crear el proyecto en Neon |
| **DML** | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Todas las rutas API en runtime |

---

## Esquema SQL y diagrama entidad-relación

Script: [`../sql/schema.sql`](../sql/schema.sql)

### Tablas

**`notes`** — entidad principal (los tres tipos de contenido comparten tabla)

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID PK | `gen_random_uuid()` |
| `title` | VARCHAR(255) NOT NULL | Mín. 3 caracteres (validado también en Zod) |
| `content` | TEXT | Texto de nota; null en checklist/idea |
| `type` | VARCHAR(50) | `CHECK`: `note` \| `checklist` \| `idea` |
| `color` | VARCHAR(7) | Hex para ideas |
| `is_archived` | BOOLEAN | Default `FALSE`; archivado sin borrar |
| `created_at` / `updated_at` | TIMESTAMPTZ | Auditoría temporal |

**`checklist_items`** — tareas de una checklist

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID PK | |
| `note_id` | UUID FK → `notes.id` | `ON DELETE CASCADE` |
| `text` | VARCHAR(255) NOT NULL | |
| `is_completed` | BOOLEAN | Default `FALSE` |

**`note_tags`** — etiquetas de ideas (y extensible a otros tipos)

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID PK | |
| `note_id` | UUID FK → `notes.id` | `ON DELETE CASCADE` |
| `tag` | VARCHAR(100) NOT NULL | |

### Diagrama ER

```text
notes (id PK)
  ├── checklist_items (id PK, note_id FK → notes.id, ON DELETE CASCADE)
  └── note_tags       (id PK, note_id FK → notes.id, ON DELETE CASCADE)
```

---

## JOINs: INNER JOIN vs LEFT JOIN

Cuando una entidad tiene relaciones **1 ── N** (una nota, muchos ítems), a menudo necesitas leer padre e hijos en **una sola consulta**. Los **JOINs** unen filas de dos tablas según una condición (`tabla_hija.foreign_key = tabla_padre.id`).

Consulta de referencia: [`../sql/queries.sql`](../sql/queries.sql)  
Implementación en código: [`noteflow-api/lib/noteQueries.ts`](../noteflow-api/lib/noteQueries.ts)

### INNER JOIN

Devuelve **solo** filas donde **hay coincidencia en ambas tablas**.

```sql
SELECT n.title, ci.text
FROM notes n
INNER JOIN checklist_items ci ON n.id = ci.note_id;
```

- Una nota **sin ítems** no aparece.
- **Cuándo usarlo:** informes donde solo interesan checklists **con al menos un ítem** (p. ej. “tareas en curso”, excluyendo listas vacías).

### LEFT JOIN

Devuelve **todas** las filas de la tabla **izquierda** (`notes`) y las coincidentes de la derecha; si no hay match, las columnas derechas son **NULL**.

```sql
SELECT n.*, ci.text
FROM notes n
LEFT JOIN checklist_items ci ON n.id = ci.note_id;
```

- Una nota **sin ítems** sigue apareciendo (`ci.text` = NULL).
- **Cuándo usarlo:** listado general (`GET /api/notes`), detalle con relaciones opcionales, notas tipo `note` o `idea` sin checklist.

### Agregación con `json_agg` y `GROUP BY`

Con varios hijos por nota, un JOIN “plano” duplica filas de la nota padre. NoteFlow agrupa en arrays JSON:

```sql
SELECT
  n.*,
  json_agg(ci.*) FILTER (WHERE ci.id IS NOT NULL) AS items,
  json_agg(nt.tag) FILTER (WHERE nt.id IS NOT NULL) AS tags
FROM notes n
LEFT JOIN checklist_items ci ON n.id = ci.note_id
LEFT JOIN note_tags nt ON n.id = nt.note_id
GROUP BY n.id
ORDER BY n.created_at DESC;
```

- **`json_agg`:** convierte filas hijas en un array JSON por nota.
- **`FILTER (WHERE … IS NOT NULL)`:** evita `[null]` cuando no hay hijos; el cliente recibe `null` o array vacío según el driver.
- **`GROUP BY n.id`:** obligatorio al usar funciones de agregación; **una fila por nota**.

### Comparación rápida

| Aspecto | INNER JOIN | LEFT JOIN |
|---------|------------|-----------|
| Nota sin hijos | **Excluida** | **Incluida** (NULL a la derecha) |
| Caso NoteFlow | Solo notas con ítems | **Todas** las notas del listado |
| Riesgo | “Perder” notas vacías | Más filas antes del `GROUP BY`; usar `FILTER` |

---

## Qué es una API REST

**REST** (Representational State Transfer) expone **recursos** identificados por URL y operados con **métodos HTTP**:

| Principio | En NoteFlow |
|-----------|-------------|
| Recursos con nombre sustantivo | `/api/notes`, `/api/checklist-items/{id}` |
| Verbos en HTTP, no en la URL | `PATCH /api/notes/{id}` (no `/api/archiveNote`) |
| Representación JSON | Request y response en `application/json` |
| Stateless | Cada petición lleva toda la info necesaria (sin sesión aún) |

En **Next.js App Router**, cada ruta API es un archivo `route.ts` que exporta funciones nombradas según el método: `GET`, `POST`, `PATCH`, `DELETE`.

### Recursos del dominio NoteFlow

| Recurso | Ruta base | Descripción |
|---------|-----------|-------------|
| Notas (todos los tipos) | `/api/notes` | Nota, checklist e idea comparten tabla `notes` |
| Nota individual | `/api/notes/{id}` | Detalle, actualización parcial, borrado |
| Ítems de checklist | `/api/notes/{id}/checklist-items` | Colección anidada bajo la nota padre |
| Ítem suelto | `/api/checklist-items/{itemId}` | Marcar completado o eliminar sin pasar por la nota |

---

## Métodos HTTP y operaciones CRUD

| Método | Operación | Idempotente | Body | Ejemplo NoteFlow |
|--------|-----------|-------------|------|------------------|
| **GET** | Leer | Sí | No | Listar todas las notas |
| **POST** | Crear | No | Sí (JSON) | Crear nota o ítem |
| **PATCH** | Actualizar parcial | No | Sí (solo campos a cambiar) | Archivar (`is_archived: true`) |
| **DELETE** | Eliminar | Sí | No | Borrado definitivo |

Convenciones usadas en este repo:

- **POST** exitoso → **201 Created** con el recurso creado en el body.
- **PATCH** / **GET** exitoso → **200 OK** con el recurso.
- **DELETE** exitoso → **204 No Content** (sin body).
- Validación fallida → **400** con `{ "errors": [...] }` (issues de Zod).
- Recurso inexistente → **404** con `{ "error": "..." }`.
- Fallo interno → **500** con mensaje genérico (detalle solo en logs del servidor).

### Formato de respuesta de una nota (GET list / GET one / POST / PATCH)

La API devuelve **snake_case** (convención PostgreSQL/JSON del servidor). El móvil lo mapea a camelCase en `mapApiRowToAnyNote`.

```json
{
  "id": "uuid",
  "title": "Reunión cliente Acme",
  "content": "Texto de la nota",
  "type": "note",
  "color": null,
  "is_archived": false,
  "created_at": "2026-05-30T12:00:00.000Z",
  "updated_at": "2026-05-30T12:00:00.000Z",
  "items": null,
  "tags": null
}
```

Para `type: "checklist"`, `items` es un array de objetos `{ id, note_id, text, is_completed }`.  
Para `type: "idea"`, `tags` es un array de strings y `color` suele ser un hex.

---

## Códigos de estado HTTP

| Código | Significado | Cuándo en NoteFlow |
|--------|-------------|-------------------|
| **200** | OK | GET, PATCH correctos |
| **201** | Created | POST correcto |
| **204** | No Content | DELETE correcto |
| **400** | Bad Request | UUID inválido, body vacío en PATCH, Zod falla |
| **404** | Not Found | Id de nota o ítem inexistente |
| **500** | Internal Server Error | Error de BD o excepción no controlada |

### Seguridad en errores

**Nunca** devuelvas al cliente el error crudo de PostgreSQL. Patrón del repo:

1. `console.error('[GET /api/notes]', error)` en el servidor.
2. Respuesta al móvil: `{ "error": "Error interno" }` con **500**.

Para validación Zod, **400** con mensajes claros («El título debe tener al menos 3 caracteres») es aceptable: no revelan estructura interna de la BD.

---

## Stack del backend

| Herramienta | Rol |
|-------------|-----|
| **Next.js 16** | Route Handlers en `app/api/` |
| **Neon** (`@neondatabase/serverless`) | PostgreSQL serverless vía HTTP |
| **Zod** | Validación de body y params antes de SQL |
| **Variables de entorno** | `DATABASE_URL` solo en `.env.local` |

### Conexión a la base de datos

[`noteflow-api/lib/db.ts`](../noteflow-api/lib/db.ts):

```ts
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = params?.length
    ? await sql.query(text, params)
    : await sql.query(text);
  return result as T[];
}
```

Todas las rutas usan **`query(text, [param1, param2, …])`** con placeholders `$1`, `$2` — ver [`docs/seguridad-api.md`](seguridad-api.md).

---

## Relación con la app móvil

| Aspecto | Implementación actual |
|---------|------------------------|
| Fuente de verdad | API REST (Neon), no AsyncStorage |
| Cliente HTTP | `lib/api.ts` (`getNotes`, `createNote`, `updateNote`, …) |
| Estado UI | `store/notesStore.ts` (Zustand, acciones async) |
| Carga inicial | `StoreHydrationGate` → `fetchNotes()` al abrir la app |
| URL de la API | `EXPO_PUBLIC_API_URL` en `.env` del proyecto raíz |
| Mapeo de datos | snake_case (API) → camelCase (tipos en `types/`) |

La app valida con Zod **antes** de enviar; la API **vuelve a validar** (defensa en profundidad). Ver [`docs/seguridad-api.md`](seguridad-api.md).

### Datos demo

Script opcional para poblar Neon:

```bash
node scripts/seedDemoApi.mjs
```

Requiere la API en marcha (`npm run dev` dentro de `noteflow-api`).

---

## Referencia rápida de endpoints

Detalle completo (body, respuestas, variables): sección **Backend** del [`README.md`](../README.md).

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/notes` | Lista todas las notas con `items` y `tags` agregados |
| POST | `/api/notes` | Crea nota, checklist o idea |
| GET | `/api/notes/{id}` | Detalle de una nota |
| PATCH | `/api/notes/{id}` | Actualiza campos parciales (incl. `is_archived`) |
| DELETE | `/api/notes/{id}` | Borra nota y cascada de hijos |
| GET | `/api/notes/{id}/checklist-items` | Lista ítems de una checklist |
| POST | `/api/notes/{id}/checklist-items` | Añade ítem a una checklist |
| PATCH | `/api/checklist-items/{itemId}` | Marca/desmarca `is_completed` |
| DELETE | `/api/checklist-items/{itemId}` | Elimina un ítem |

---

## Enlaces

- [Neon — serverless driver](https://neon.tech/docs/serverless/serverless-driver)
- [Next.js — Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- Seguridad (SQL injection, secretos): [`seguridad-api.md`](seguridad-api.md)
- Modelo de datos en el móvil: [`modelo-datos.md`](modelo-datos.md)
- Esquema SQL: [`../sql/schema.sql`](../sql/schema.sql)
