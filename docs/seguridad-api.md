# Seguridad API: SQL injection, validación y variables de entorno

Guía de riesgos y buenas prácticas al construir y consumir **`noteflow-api`**. Complementa la parte teórica de [`backend-teoria.md`](backend-teoria.md).

---

## Modelo de amenazas (NoteFlow)

| Amenaza | Superficie | Mitigación en el repo |
|---------|------------|------------------------|
| **SQL injection** | Body JSON, params de ruta | Consultas parametrizadas (`$1`, `$2`) en `lib/db.ts` |
| **Exposición de secretos** | Commits, binario móvil | `DATABASE_URL` solo en `.env.local`; nunca en código |
| **Filtrado de errores internos** | Respuestas 500 | Mensaje genérico al cliente; detalle en `console.error` |
| **Datos mal formados** | POST/PATCH | Zod en cada route handler antes de tocar la BD |
| **IDs manipulados** | `{id}`, `{itemId}` en URL | Regex UUID en schemas Zod de params |

La app móvil **no es un entorno de confianza**: cualquier petición HTTP puede fabricarse con curl o Postman. La API debe validar **todo** de nuevo.

---

## Qué es SQL injection

La **inyección SQL** ocurre cuando datos de entrada del usuario se **concatenan** dentro de una cadena SQL. El motor puede interpretar parte del input como **código SQL**, no como dato.

Payload de ejemplo en un campo `title`:

```text
'; DROP TABLE notes;--
```

Si el backend construye la consulta así, el atacante podría borrar tablas o leer datos ajenos.

---

## Ejemplo vulnerable (no usar)

```ts
// ❌ Vulnerable: el valor del usuario forma parte del SQL
const title = req.body.title;
const sql = "SELECT * FROM notes WHERE title = '" + title + "'";
await db.query(sql);
```

Problemas:

- Las comillas del payload cierran el literal SQL y añaden instrucciones nuevas.
- Un atacante no necesita acceso al código fuente; basta con interceptar o falsificar peticiones.

---

## Ejemplo seguro: consultas parametrizadas

Patrón usado en **todo** `noteflow-api` vía `query()`:

```ts
// ✅ Seguro: estructura y datos van separados
const rows = await query(
  'SELECT * FROM notes WHERE title = $1',
  [req.body.title]
);
```

Por qué funciona:

- PostgreSQL trata `$1` como **parámetro vinculado**, nunca como fragmento ejecutable.
- Comillas, punto y coma o palabras reservadas dentro del valor **no alteran** la estructura de la consulta.

### Ejemplos reales del repo

**INSERT al crear nota** (`app/api/notes/route.ts`):

```ts
await query(
  'INSERT INTO notes (title, type, content, color) VALUES ($1, $2, $3, $4) RETURNING id',
  [title, type, content ?? null, color ?? null]
);
```

**UPDATE dinámico al PATCH** (`app/api/notes/[id]/route.ts`):

Los nombres de columna (`title`, `is_archived`, …) se eligen en código **solo** a partir de claves validadas por Zod — nunca desde input libre del usuario. Los **valores** van siempre en `$n`:

```ts
// setClauses solo contiene columnas permitidas por patchSchema
const sql = `
  UPDATE notes
  SET ${setClauses.join(', ')}, updated_at = NOW()
  WHERE id = $1
  RETURNING id
`;
await query(sql, [parsedParams.data.id, ...values]);
```

**Regla:** los identificadores SQL (nombres de tabla/columna) no pueden parametrizarse en PostgreSQL; por eso el PATCH **no** acepta nombres de campo arbitrarios — solo el conjunto fijo definido en `patchSchema`.

---

## Validación con Zod (defensa en profundidad)

Incluso con consultas parametrizadas, conviene **rechazar datos inválidos** antes de la BD:

| Campo | Regla Zod | Motivo |
|-------|-----------|--------|
| `title` | `min(3)` | Evita registros basura y reduce superficie |
| `type` | `enum(['note','checklist','idea'])` | Solo valores del dominio |
| `id` (params) | regex UUID | Evita ids malformados en rutas |
| `text` (checklist) | `min(1).max(255)` | Coherente con `VARCHAR(255)` |
| PATCH body | `.refine` ≥ 1 campo | Evita UPDATE vacío |

La app móvil también valida con Zod en formularios (`schemas/noteSchemas.ts`); la API **no confía** en esa capa y repite la validación.

---

## Errores: qué loguear y qué devolver

| Situación | Servidor (logs) | Cliente (JSON) |
|-----------|-----------------|----------------|
| Constraint violation en Neon | Error completo | `{ "error": "Error interno" }` + 500 |
| Título demasiado corto | Opcional | `{ "errors": [...] }` + 400 |
| UUID inválido en URL | No necesario | `{ "errors": [...] }` + 400 |
| Nota no encontrada | No necesario | `{ "error": "Nota no encontrada" }` + 404 |

**Nunca** incluyas en la respuesta HTTP:

- Stack traces de Node.js
- Mensajes crudos de PostgreSQL (`relation "notes" does not exist`, detalle de FK, etc.)
- El valor de `DATABASE_URL` o fragmentos del connection string

---

## Variables de entorno y secretos

Una **variable de entorno** es configuración **externa al código**: se inyecta en runtime y no debe versionarse con valores reales.

### Dónde va cada cosa (Neon vs archivos)

| Qué | Dónde |
|-----|--------|
| SQL (`CREATE TABLE`, `ALTER TABLE`) | **Neon → SQL Editor** |
| `DATABASE_URL` | `noteflow-api/.env.local` · **Vercel** → Environment Variables |
| `JWT_SECRET` | `noteflow-api/.env.local` · **Vercel** → Environment Variables |
| `EXPO_PUBLIC_API_URL` | `.env` en la raíz del proyecto Expo |

**Error habitual:** pegar `JWT_SECRET=abc123...` en el SQL Editor de Neon. Neon solo ejecuta SQL; verás `syntax error at or near "JWT_SECRET"`. El secreto va en `.env.local`, no en la base de datos.

Guía paso a paso: [`setup-auth-local.md`](setup-auth-local.md).

### Backend (`noteflow-api`)

| Variable | Archivo | ¿Secreta? | Descripción |
|----------|---------|-----------|-------------|
| `DATABASE_URL` | `.env.local` | **Sí** | Connection string completo de Neon (usuario, contraseña, host) |

**Reglas:**

1. Copiar plantilla: `cp .env.example .env.local` y pegar el string del panel de Neon.
2. **`.env.local` está en `.gitignore`** — no hacer commit.
3. Commitear solo **`.env.example`** con valor vacío (`DATABASE_URL=`).
4. **Nunca** pegar el connection string real en issues, Trello, capturas ni en este markdown.

### App móvil (raíz del repo)

| Variable | Archivo | ¿Secreta? | Descripción |
|----------|---------|-----------|-------------|
| `EXPO_PUBLIC_API_URL` | `.env` | No (pública) | URL base de la API, p. ej. `http://192.168.1.39:3000/api` |

**Prefijo `EXPO_PUBLIC_`:** Expo incluye estas variables en el bundle del cliente. Cualquier usuario puede verlas inspeccionando la app. Por eso:

- ✅ **Correcto:** URL pública de la API (sin credenciales de BD).
- ❌ **Incorrecto:** `EXPO_PUBLIC_DATABASE_URL` — expondría Neon al binario móvil.

**`.env` del móvil:** contiene IP local de desarrollo; conviene añadirlo a `.gitignore` o usar `.env.example` como plantilla (como ya hace el repo con `.env.example` en la raíz).

### Valores según entorno de prueba

| Entorno | `EXPO_PUBLIC_API_URL` típica |
|---------|------------------------------|
| iOS Simulator | `http://localhost:3000/api` |
| Android Emulator | `http://10.0.2.2:3000/api` |
| Dispositivo físico (misma WiFi) | `http://<IP-de-tu-Mac>:3000/api` |

Tras cambiar `.env`, reiniciar Expo con caché limpia: `npx expo start -c`.

---

## Por qué el connection string nunca va en la app

| Riesgo | Consecuencia |
|--------|--------------|
| String en el repo (commit) | Filtración por forks, historial git, capturas |
| String en código TypeScript del móvil | Extracción del binario APK/IPA |
| Acceso directo a Neon | Lectura/escritura/borrado de **todos** los datos |

La API actúa como **único puente** autorizado hacia PostgreSQL. En una fase futura del producto se añadiría **autenticación** (token JWT, sesión) para que cada usuario solo acceda a sus notas.

---

## Checklist antes de exponer o desplegar endpoints

- [ ] Todas las consultas usan `query(text, params)` con `$1`, `$2`, …
- [ ] No hay concatenación de strings SQL con input de usuario
- [ ] Body y params validados con Zod antes de ejecutar SQL
- [ ] Nombres de columna en UPDATE dinámico provienen de un allowlist en código, no del cliente
- [ ] Errores de BD solo en logs del servidor; respuesta 500 genérica
- [ ] `DATABASE_URL` solo en `.env.local` del backend, fuera de git
- [ ] Ningún secreto bajo prefijo `EXPO_PUBLIC_`
- [ ] `.env.example` actualizado sin valores reales

---

## Enlaces

- Teoría backend (arquitectura, REST, JOINs): [`backend-teoria.md`](backend-teoria.md)
- Setup y lista de endpoints: [`../README.md`](../README.md) (sección Backend)
- Cliente SQL del repo: [`noteflow-api/lib/db.ts`](../noteflow-api/lib/db.ts)
