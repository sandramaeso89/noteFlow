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
  const result = params?.length
    ? await sql.query(text, params)
    : await sql.query(text);
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

## Enlaces

- [Neon — serverless driver](https://neon.tech/docs/serverless/serverless-driver)
- [Next.js — Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- Persistencia solo local (fase anterior): [`persistencia.md`](persistencia.md)
