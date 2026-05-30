# Backend NoteFlow: teoría y patrón cliente-servidor

Documento del curso para la API **`noteflow-api`** (Next.js + Neon PostgreSQL). La app móvil Expo **no** se conecta directamente a la base de datos.

---

## Por qué necesitamos un backend

Una app móvil **nunca** debe conectarse directamente a una base de datos.

Si el **connection string** de PostgreSQL estuviera embebido en el binario de la app, cualquiera que la descompilase tendría **acceso completo** a la base de datos: leer, modificar y borrar datos de todos los usuarios.

El patrón correcto es **cliente-servidor**:

```text
[ App móvil NoteFlow ]  --HTTP-->  [ API noteflow-api ]  --SQL-->  [ PostgreSQL (Neon) ]
     (cliente)                         (servidor / guardián)              (datos)
```

Cada capa tiene **una responsabilidad**:

| Capa | Responsabilidad |
|------|-----------------|
| **Cliente (móvil)** | UI, experiencia de usuario, llamadas HTTP a la API |
| **API (servidor)** | Validar entradas, autenticación/autorización, reglas de negocio, no exponer secretos |
| **Base de datos** | Persistencia relacional, consultas SQL |

La API actúa como **guardián**: comprueba que los datos que llegan son correctos (p. ej. con **Zod**) y que el cliente tiene permiso para la operación. La app solo conoce la URL pública de la API, no las credenciales de PostgreSQL.

En NoteFlow, la fase actual del móvil sigue usando **AsyncStorage** (solo dispositivo). La API prepara la sincronización en nube cuando el curso lo pida.

---

## Fundamentos de base de datos relacional

Las bases de datos relacionales organizan la información en **tablas** (filas + columnas).
Cada tabla representa una entidad del dominio (por ejemplo, `notes` o `checklist_items`) y se conectan entre sí mediante **claves**.

### ACID (transacciones fiables)

Las propiedades **ACID** garantizan operaciones seguras:

- **Atomicidad**: o se guarda todo o no se guarda nada.
- **Consistencia**: los datos siempre respetan reglas válidas.
- **Aislamiento**: transacciones concurrentes no se pisan entre sí.
- **Durabilidad**: una vez confirmado, el cambio persiste aunque haya caída del servidor.

Ejemplo NoteFlow: sin atomicidad, podrías crear una nota pero fallar al guardar sus ítems de checklist, dejando datos inconsistentes.

### Primary Key

La **Primary Key** es un identificador único e irrepetible de cada fila.
En apps móviles suele preferirse **UUID** frente a enteros autoincrementales, porque el cliente puede generar el id offline y sincronizar después cuando recupere conexión.

### Foreign Key

Una **Foreign Key** es una columna que referencia la primary key de otra tabla.
Ejemplo: `checklist_items.note_id` apunta a `notes.id`.

Con `ON DELETE CASCADE`, al borrar una nota se eliminan automáticamente sus checklist items asociados, evitando registros huérfanos.

### DDL vs DML

- **DDL** (Data Definition Language): define estructura (`CREATE`, `ALTER`, `DROP`).
- **DML** (Data Manipulation Language): manipula datos (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).

---

## Esquema SQL y diagrama entidad-relación

Script del esquema: [`../sql/schema.sql`](../sql/schema.sql)

### Tablas y columnas

1. **`notes`**
   - `id` (UUID, PK, `gen_random_uuid()`)
   - `title` (VARCHAR(255), NOT NULL)
   - `content` (TEXT)
   - `type` (VARCHAR(50), NOT NULL, `CHECK ('note' | 'checklist' | 'idea')`)
   - `color` (VARCHAR(7))
   - `created_at` (TIMESTAMPTZ, `NOW()`)
   - `updated_at` (TIMESTAMPTZ, `NOW()`)

2. **`checklist_items`**
   - `id` (UUID, PK, `gen_random_uuid()`)
   - `note_id` (UUID, FK → `notes.id`, NOT NULL, `ON DELETE CASCADE`)
   - `text` (VARCHAR(255), NOT NULL)
   - `is_completed` (BOOLEAN, `FALSE`)

3. **`note_tags`**
   - `id` (UUID, PK, `gen_random_uuid()`)
   - `note_id` (UUID, FK → `notes.id`, NOT NULL, `ON DELETE CASCADE`)
   - `tag` (VARCHAR(100), NOT NULL)

### Relaciones

- **`notes` 1 ── N `checklist_items`**: una nota tipo checklist puede tener varios ítems.
- **`notes` 1 ── N `note_tags`**: una nota/idea puede tener múltiples etiquetas.
- Ambas relaciones usan **`ON DELETE CASCADE`** para evitar registros huérfanos.

### Diagrama ER (texto)

```text
notes (id PK)
  ├── checklist_items (id PK, note_id FK -> notes.id, ON DELETE CASCADE)
  └── note_tags       (id PK, note_id FK -> notes.id, ON DELETE CASCADE)
```

---

## JOINs: INNER JOIN vs LEFT JOIN

Cuando una entidad tiene **relaciones 1 ── N** (una nota, muchos ítems), a menudo necesitas leer la tabla padre y sus hijos en **una sola consulta**. Ahí entran los **JOINs**: unen filas de dos tablas según una condición (normalmente `tabla_hija.foreign_key = tabla_padre.id`).

Consulta de referencia con agregación JSON: [`../sql/queries.sql`](../sql/queries.sql).

### INNER JOIN

Devuelve **solo** las filas donde **hay coincidencia en ambas tablas**.

```sql
SELECT n.title, ci.text
FROM notes n
INNER JOIN checklist_items ci ON n.id = ci.note_id;
```

- Si una nota **no tiene** ítems de checklist, **no aparece** en el resultado.
- **Cuándo usarlo en NoteFlow:** listar únicamente checklists que **ya tienen al menos un ítem** (p. ej. informe de “tareas en curso” donde un checklist vacío no aporta).

### LEFT JOIN

Devuelve **todas** las filas de la tabla **izquierda** (`notes`) y las coincidentes de la derecha; si no hay coincidencia, las columnas de la derecha son **NULL**.

```sql
SELECT n.*, ci.text
FROM notes n
LEFT JOIN checklist_items ci ON n.id = ci.note_id;
```

- Una nota **sin ítems** sigue apareciendo; `ci.text` será `NULL`.
- **Cuándo usarlo en NoteFlow:** listado general de notas (incluidas tipo `note` o `idea` sin checklist), detalle de una nota con sus ítems opcionales, o la consulta agregada de `queries.sql` que junta ítems y tags en arrays JSON.

### Comparación rápida

| Aspecto | INNER JOIN | LEFT JOIN |
|---------|------------|-----------|
| Tabla izquierda sin match en la derecha | Se **excluye** | Se **incluye** (NULL a la derecha) |
| Caso NoteFlow | Solo notas **con** ítems | **Todas** las notas, con o sin ítems/tags |
| Riesgo | “Perder” notas vacías en listados | Más filas antes de `GROUP BY`; usar `FILTER` en agregados |

En `queries.sql`, dos `LEFT JOIN` + `json_agg(...) FILTER (WHERE ... IS NOT NULL)` producen **una fila por nota** con arrays `items` y `tags` vacíos (`[]`) cuando no hay hijos, en lugar de omitir la nota o devolver `[null]`.

---

## Qué es una API REST

**REST** (Representational State Transfer) es un estilo para exponer recursos mediante **HTTP**:

- Cada recurso tiene una **ruta** (URL), p. ej. `/api/notes`, `/api/notes/abc-123`.
- Las operaciones se expresan con **métodos HTTP**, no con verbos en la URL (`/deleteNote`).
- El cuerpo suele ser **JSON**; las respuestas también.

En **Next.js App Router**, las rutas API viven en `app/api/.../route.ts` y exportan funciones `GET`, `POST`, `PATCH`, `DELETE` según el método.

---

## Métodos HTTP y operaciones de datos

| Método | Operación típica | Ejemplo NoteFlow |
|--------|-------------------|------------------|
| **GET** | Leer (lista o detalle) | Listar notas del usuario |
| **POST** | Crear | Crear una nota nueva |
| **PATCH** | Modificar **parcialmente** | Archivar o actualizar título |
| **DELETE** | Eliminar | Borrar definitivamente |

Convenciones útiles:

- **GET** y **DELETE** no llevan cuerpo con datos sensibles de creación; el id va en la ruta.
- **POST** crea; la respuesta suele ser **201 Created** con el recurso creado.
- **PATCH** actualiza solo los campos enviados (no hace falta mandar el objeto entero).

---

## Códigos de estado HTTP

El servidor comunica el **resultado** de la petición con un número. Los más usados en NoteFlow:

| Código | Significado | Cuándo usarlo |
|--------|-------------|---------------|
| **200 OK** | Éxito en lectura o actualización | GET, PATCH correctos |
| **201 Created** | Recurso creado | POST correcto |
| **400 Bad Request** | Datos inválidos (validación Zod, JSON mal formado) | El cliente mandó algo incorrecto |
| **401 Unauthorized** | No autenticado | Falta token o sesión inválida |
| **404 Not Found** | Recurso no existe | Id inexistente |
| **500 Internal Server Error** | Fallo en el servidor | Error inesperado en la API o BD |

### Seguridad en errores

**Nunca** devuelvas al cliente el error crudo de PostgreSQL (`relation "notes" does not exist`, detalle de constraint, etc.). Eso es **información interna** que un atacante podría explotar.

Patrón recomendado:

1. Registrar el error real en **logs del servidor** (solo backend).
2. Responder al móvil con un mensaje **genérico**, p. ej. `{ "error": "No se pudo completar la operación" }` y código **500**.

Para validación (Zod), **400** con mensajes **claros y seguros** («El título debe tener al menos 3 caracteres») está bien: no revelan estructura interna de la BD.

---

## Stack del backend en este repo

| Herramienta | Rol |
|-------------|-----|
| **Next.js** (`noteflow-api/`) | Framework del servidor; rutas API en `app/api/` |
| **Neon** (`@neondatabase/serverless`) | PostgreSQL serverless; conexión HTTP sin mantener pool en serverless |
| **Zod** | Validar body y query antes de ejecutar SQL |
| **Variables de entorno** | `DATABASE_URL` solo en `.env.local` (ignorado por git) |

### Conexión a la base de datos

Módulo: [`noteflow-api/lib/db.ts`](../noteflow-api/lib/db.ts)

```ts
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await sql(text, params);
  return result as T[];
}
```

### Configuración local (orden obligatorio)

1. Crear proyecto: `npx create-next-app@latest noteflow-api --typescript --app --no-tailwind --no-src-dir`
2. `npm install @neondatabase/serverless zod`
3. Crear **`.env.local`** con tu `DATABASE_URL` de Neon.
4. Añadir **`.env.local`** al `.gitignore` (ya cubierto por `.env*`).
5. Commitear solo **`.env.example`** como plantilla (`DATABASE_URL=`).

```bash
cd noteflow-api
cp .env.example .env.local
# Editar .env.local con el connection string del panel de Neon
npm run dev
```

---

## Relación con la app móvil

| Ahora (móvil) | Con backend (futuro) |
|---------------|----------------------|
| Zustand + AsyncStorage | Zustand + `fetch` a `noteflow-api` |
| Datos solo en el dispositivo | Datos en Neon, opcional caché local |
| Sin autenticación en API | Token / sesión en cabeceras HTTP |

La app móvil seguirá validando con Zod **antes** de enviar; la API **vuelve a validar** (defensa en profundidad).

---

## Pruebas CRUD reales (rutas API)

### Notas

Handlers en:

- `noteflow-api/app/api/notes/route.ts` → `GET`, `POST`
- `noteflow-api/app/api/notes/[id]/route.ts` → `GET`, `PATCH`, `DELETE`

Respuestas observadas en pruebas HTTP locales:

- `GET /api/notes` → **200** (array de notas; inicialmente vacío `[]`).
- `POST /api/notes` con body válido → **201** (nota creada con `id` UUID).
- `POST /api/notes` con body inválido (`title` corto) → **400** con `errors` de Zod.
- `GET /api/notes/not-a-uuid` → **400** (`El id debe ser un UUID válido`).
- `PATCH /api/notes/not-a-uuid` → **400** (`El id debe ser un UUID válido`).
- `PATCH /api/notes/{uuid}` con body `{}` → **400** (`Debes enviar al menos un campo para actualizar`).
- `PATCH /api/notes/{uuid}` con body válido → **200** (nota actualizada).
- `DELETE /api/notes/{uuid}` → **204** (sin body).

Nota: cuando `DELETE` responde **204 No Content** (caso exitoso), no devuelve body. Además, por `ON DELETE CASCADE`, se eliminan automáticamente `checklist_items` y `note_tags` asociados a la nota.

### Ítems de checklist

Handlers en:

- `noteflow-api/app/api/notes/[id]/checklist-items/route.ts` → `GET`, `POST`
- `noteflow-api/app/api/checklist-items/[itemId]/route.ts` → `PATCH`, `DELETE`

| Método | Ruta | Body (JSON) | Respuesta esperada |
|--------|------|-------------|-------------------|
| **GET** | `/api/notes/{noteId}/checklist-items` | — | **200** array de ítems; **404** si la nota no existe |
| **POST** | `/api/notes/{noteId}/checklist-items` | `{ "text": "...", "is_completed": false }` | **201** ítem creado; **400** validación Zod |
| **PATCH** | `/api/checklist-items/{itemId}` | `{ "is_completed": true }` | **200** ítem actualizado; **404** si no existe |
| **DELETE** | `/api/checklist-items/{itemId}` | — | **204** sin body; **404** si no existe |

Ejemplo de flujo (con `noteId` e `itemId` UUID reales):

```bash
# Crear nota tipo checklist
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Seguimiento cliente","type":"checklist"}'

# Añadir ítem
curl -X POST http://localhost:3000/api/notes/{noteId}/checklist-items \
  -H "Content-Type: application/json" \
  -d '{"text":"Enviar acta"}'

# Marcar hecho
curl -X PATCH http://localhost:3000/api/checklist-items/{itemId} \
  -H "Content-Type: application/json" \
  -d '{"is_completed":true}'
```

---

## Enlaces

- [Neon — serverless driver](https://neon.tech/docs/serverless/serverless-driver)
- [Next.js — Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- Persistencia solo local (fase anterior): [`persistencia.md`](persistencia.md)
