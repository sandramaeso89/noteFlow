# NoteFlow

App de **productividad** pensada para quienes viven de **reuniones**: capturar en segundos el resumen de cada cita, las **acciones** pendientes y **referencias** útiles, revisar lo pendiente con calma y archivar lo cerrado sin perder el contexto.

La definición de producto, usuario y alcance está en **[`docs/idea.md`](docs/idea.md)**.

---

## Arranque rápido (app móvil)

Sigue estos pasos cada vez que quieras abrir la app en tu Mac / emulador.

### Requisitos previos (solo la primera vez)

- **Node.js** (LTS)
- **Expo Go** en dispositivo o simulador iOS/Android
- Cuenta creada en la app (pantalla de login)

### Pasos

**1. Instalar dependencias** (solo la primera vez o tras `git pull`):

```bash
cd noteFlow
npm install
```

**2. Configurar la URL de la API** — archivo **`.env`** en la raíz del repo (no en `noteflow-api/`):

```bash
cp .env.example .env
```

Edita `.env`:

| Modo | `EXPO_PUBLIC_API_URL` |
|------|------------------------|
| **Producción (Vercel)** — recomendado | `https://note-flow-topaz.vercel.app/api` |
| iOS Simulator (API local) | `http://localhost:3000/api` |
| Android Emulator (API local) | `http://10.0.2.2:3000/api` |
| Dispositivo físico (API local, misma WiFi) | `http://<IP-de-tu-Mac>:3000/api` |

**3. Arrancar Expo:**

```bash
npx expo start -c
```

Escanea el QR con **Expo Go** o pulsa `i` (iOS) / `a` (Android) en la terminal.

**4. Iniciar sesión** en la pantalla de login (regístrate si es la primera vez).

**5. Usar la app:** pestañas **Notas · Checklists · Ideas · Archivo**. Icono de **cuenta** (cabecera) → email y **Cerrar sesión**.

### API local (opcional)

Solo si quieres desarrollar contra `localhost:3000` en lugar de Vercel:

```bash
# Terminal 1 — backend
cd noteflow-api
cp .env.example .env.local   # DATABASE_URL + JWT_SECRET (ver docs/setup-auth-local.md)
npm install
npm run dev

# Terminal 2 — app (con .env apuntando a localhost / 10.0.2.2)
npx expo start -c
```

Guía completa backend y Neon: [`docs/setup-auth-local.md`](docs/setup-auth-local.md).

### Enlaces del proyecto desplegado

| Recurso | URL |
|---------|-----|
| **Repositorio GitHub** | https://github.com/sandramaeso89/noteFlow |
| **API REST (Vercel)** | https://note-flow-topaz.vercel.app/api |
| **Documentación deploy** | [`docs/vercel-deploy.md`](docs/vercel-deploy.md) |

---

| Recurso | Enlace |
|---------|--------|
| **Tablero NoteFlow** | [Abrir tablero en Trello](https://trello.com/invite/b/6a048a0373bbe62e3367a880/ATTI8b855197a3a2f6feced08fd4beb61fa60725B2BD/noteflow) |
| **Cómo se usa el tablero** | [`docs/project-management.md`](docs/project-management.md) — columnas, flujo y tarjetas con subtareas |

Columnas del tablero: **Backlog**, **Todo**, **In Progress**, **Review**, **Done**.

---

## Estado del proyecto

| Requisito | Estado | Dónde |
|-----------|--------|--------|
| Librería UI (React Native Paper + tokens) | Hecho | `app/_layout.tsx`, `constants/theme.ts` |
| Tres tipos con tarjetas distintas | Hecho | `NoteCard`, `ChecklistCard`, `IdeaCard` |
| FlashList en todas las listas | Hecho | 4 pestañas (`notas`, `checklists`, `ideas`, `archivadas`) |
| Formularios + Zod | Hecho | `app/nueva-note.tsx`, `schemas/noteSchemas.ts` |
| Zustand + API REST | Hecho | `store/notesStore.ts`, `lib/api.ts` |
| API Next.js + Neon PostgreSQL | Hecho | [`noteflow-api/`](noteflow-api/) |
| Auth JWT + SecureStore + menú usuario | Hecho | `app/login.tsx`, `components/UserMenuButton.tsx` |
| Selección múltiva y archivar en bloque | Hecho | `app/(tabs)/*/index.tsx` |
| API desplegada en Vercel + Neon | Hecho | https://note-flow-topaz.vercel.app/api |
| Documentación backend, auth y Vercel | Hecho | `docs/setup-auth-local.md`, `docs/auth-api.md`, `docs/vercel-deploy.md` |
| Firebase (Auth + Firestore) — fase curso | En progreso | [`docs/setup-firebase.md`](docs/setup-firebase.md) |

**Navegación:** pestañas **Notas · Checklists · Ideas · Archivo**; detalle `[id]` por sección; modal **`/nueva-note`**. Ver [`docs/expo-router-navegacion.md`](docs/expo-router-navegacion.md).

**Pendiente solo manual (tutor):** auditoría FPS y tema claro/oscuro en simulador — [`docs/pendiente-ejercicio.md`](docs/pendiente-ejercicio.md).

**Nueva fase (Firebase):** proyecto **noteFlow** creado en la consola; paquetes `@react-native-firebase/*` instalados. Siguiente: terminar Firestore y Auth en la consola, registrar app móvil y Development Build — guía paso a paso en [`docs/setup-firebase.md`](docs/setup-firebase.md).

---

## App móvil — detalle técnico

### Stack móvil

- **React Native** + **Expo SDK 54** — [`docs/react-native-fundamentals.md`](docs/react-native-fundamentals.md), [`docs/react-native-teoria.md`](docs/react-native-teoria.md)
- **Expo Router** — [`docs/expo-router-navegacion.md`](docs/expo-router-navegacion.md)
- **React Native Paper** (MD3) + tokens en `constants/theme.ts`
- **FlashList** — `@shopify/flash-list`
- **Zustand** — estado global; fuente de verdad vía `lib/api.ts`
- **expo-secure-store** — token JWT cifrado (no AsyncStorage)
- **Zod** — validación en formularios
- **expo-haptics**, **react-native-reanimated**

**Expo Go** vs **Development Build:** [`docs/expo-go-vs-development-build.md`](docs/expo-go-vs-development-build.md).

### Estructura del código (app)

```text
app/
  _layout.tsx          # PaperProvider, StoreHydrationGate, Stack raíz
  nueva-note.tsx       # Modal alta (Zod + store)
  (tabs)/
    notas|checklists|ideas|archivadas/
      index.tsx        # FlashList + selección múltiva
      [id].tsx         # Detalle + DetailHeaderMenu
components/
  items/               # Tarjetas y AnimatedCardWrapper
  list/                # Cabecera, vacíos, BulkArchiveBar
  UserMenuButton.tsx   # Cuenta + cerrar sesión
lib/api.ts             # Cliente HTTP + Bearer JWT
lib/authApi.ts         # Register / login
lib/authStorage.ts     # Token en SecureStore
store/authStore.ts     # Sesión
store/notesStore.ts    # Zustand async (fetch, CRUD, archivar)
app/login.tsx          # Pantalla de acceso
components/AuthGate.tsx
schemas/noteSchemas.ts
types/index.ts
scripts/seedDemoApi.mjs  # Datos demo vía API
```

---

## Backend (`noteflow-api`)

API **REST** en **Next.js 16** con persistencia en **Neon PostgreSQL**. La app móvil consume estos endpoints; **nunca** accede a la base de datos directamente.

| Documento | Contenido |
|-----------|-----------|
| [`docs/backend-teoria.md`](docs/backend-teoria.md) | Arquitectura cliente-servidor, REST, SQL, JOINs, códigos HTTP |
| [`docs/seguridad-api.md`](docs/seguridad-api.md) | SQL injection, consultas parametrizadas, variables de entorno |
| [`docs/auth-api.md`](docs/auth-api.md) | JWT, register/login, SecureStore en la app |
| [`docs/setup-auth-local.md`](docs/setup-auth-local.md) | **Guía local auth:** qué va en Neon (SQL) vs `.env.local` (secretos) |
| [`docs/vercel-deploy.md`](docs/vercel-deploy.md) | Despliegue en Vercel paso a paso |
| [`sql/schema.sql`](sql/schema.sql) | DDL: `users`, `notes`, `checklist_items`, `note_tags` |
| [`sql/migrations/001_users_auth.sql`](sql/migrations/001_users_auth.sql) | Migración si ya tenías tablas sin auth |

### Descripción

- **Tabla `users`** con email y `password_hash` (bcrypt).
- **Cada nota** tiene `user_id` FK; solo el dueño accede vía JWT.
- **`GET /api/notes`** devuelve cada nota con arrays agregados `items` y `tags` (consulta con LEFT JOIN — ver `lib/noteQueries.ts`).
- **Auth:** `POST /api/auth/register`, `POST /api/auth/login` (públicos); resto de rutas con `Authorization: Bearer <token>`.
- Validación de entrada con **Zod**; SQL siempre **parametrizado** (`$1`, `$2`, …).

### Setup paso a paso (backend)

Guía detallada con capturas de errores habituales: **[`docs/setup-auth-local.md`](docs/setup-auth-local.md)**.

1. **Crear proyecto Neon** en [neon.tech](https://neon.tech) y copiar el **connection string**.

2. **SQL en Neon** (consola web → SQL Editor) — **solo sentencias SQL**, no variables de entorno:

   - Nuevo: [`sql/schema.sql`](sql/schema.sql)
   - Ya tenías tablas: [`sql/migrations/001_users_auth.sql`](sql/migrations/001_users_auth.sql)

3. **Variables en Mac** — archivo `noteflow-api/.env.local` (no Neon):

   ```bash
   cd noteflow-api
   cp .env.example .env.local
   ```

   ```env
   DATABASE_URL=postgresql://...connection_string_de_neon...
   JWT_SECRET=resultado_de_openssl_rand_base64_32
   ```

   Generar secreto: `openssl rand -base64 32`

4. **Instalar y arrancar:**

   ```bash
   npm install
   npm run dev
   ```

5. **Probar registro:**

   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"prueba@noteflow.dev","password":"12345678"}'
   ```

   Esperado: **201** con `{ "token", "user" }`. Si **500**, revisa pasos 2–3 y reinicia la API.

6. **App móvil:** regístrate en la pantalla de login (`npx expo start -c`). Ver sección [App móvil](#app-móvil--arranque-local).

7. **(Opcional) Datos demo** — tras login, con token:

   ```bash
   AUTH_TOKEN=eyJ... node scripts/seedDemoApi.mjs
   ```

### Despliegue en Vercel

Sigue [`docs/vercel-deploy.md`](docs/vercel-deploy.md): conecta el repo con **Root Directory** = `noteflow-api`, añade `DATABASE_URL` y `JWT_SECRET` en el panel de Vercel, y verifica los endpoints en la URL de producción.

### Variables de entorno

### Backend (`noteflow-api`)

| Variable | Archivo | Secreta | Descripción |
|----------|---------|---------|-------------|
| `DATABASE_URL` | `.env.local` | **Sí** | Connection string de Neon (copiar del panel Neon, no del SQL Editor) |
| `JWT_SECRET` | `.env.local` | **Sí** | Firma JWT (`openssl rand -base64 32`). **No** pegar en Neon SQL Editor |

### App móvil (raíz Expo)

| Variable | Archivo | Secreta | Descripción |
|----------|---------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | `.env` | No | URL base API, p. ej. `http://10.0.2.2:3000/api` o `https://xxx.vercel.app/api` |

### Scripts seed

| Variable | Dónde | Descripción |
|----------|-------|-------------|
| `AUTH_TOKEN` | terminal | JWT tras login para `node scripts/seedDemoApi.mjs` |

- **No commitear** `.env.local` ni `.env` con valores reales.
- Plantillas: `noteflow-api/.env.example` y `.env.example` (raíz).
- **Guía completa (Neon vs secretos):** [`docs/setup-auth-local.md`](docs/setup-auth-local.md)

### Endpoints

Base URL en desarrollo: `http://localhost:3000/api`

#### Autenticación (públicos)

| Método | Ruta | Body (JSON) | Respuesta exitosa |
|--------|------|-------------|-------------------|
| **POST** | `/auth/register` | `{ "email", "password" }` (password ≥ 8) | **201** `{ token, user }` |
| **POST** | `/auth/login` | `{ "email", "password" }` | **200** `{ token, user }` |

#### Notas (requieren `Authorization: Bearer <token>`)

| Método | Ruta | Body (JSON) | Respuesta exitosa | Errores |
|--------|------|-------------|-------------------|---------|
| **GET** | `/notes` | — | **200** — Array de notas con `items` y `tags` agregados | **500** |
| **POST** | `/notes` | Ver abajo | **201** — Nota creada (mismo shape que GET) | **400**, **500** |
| **GET** | `/notes/{id}` | — | **200** — Una nota | **400**, **404**, **500** |
| **PATCH** | `/notes/{id}` | Ver abajo | **200** — Nota actualizada | **400**, **404**, **500** |
| **DELETE** | `/notes/{id}` | — | **204** — Sin body; cascade borra ítems y tags | **400**, **404**, **500** |

**POST `/notes` — body:**

```json
{
  "title": "string (min. 3 caracteres)",
  "type": "note | checklist | idea",
  "content": "string (opcional)",
  "color": "string hex (opcional, ideas)",
  "tags": ["string", "..."] 
}
```

`tags` es opcional; se insertan filas en `note_tags` tras crear la nota.

**PATCH `/notes/{id}` — body** (al menos un campo):

```json
{
  "title": "string (opcional, min. 3)",
  "type": "note | checklist | idea (opcional)",
  "content": "string (opcional)",
  "color": "string (opcional)",
  "is_archived": true
}
```

**Shape de respuesta de nota** (GET/POST/PATCH):

```json
{
  "id": "uuid",
  "title": "string",
  "content": "string | null",
  "type": "note | checklist | idea",
  "color": "string | null",
  "is_archived": false,
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601",
  "items": [{ "id": "uuid", "note_id": "uuid", "text": "string", "is_completed": false }] | null,
  "tags": ["string"] | null
}
```

#### Ítems de checklist

| Método | Ruta | Body (JSON) | Respuesta exitosa | Errores |
|--------|------|-------------|-------------------|---------|
| **GET** | `/notes/{id}/checklist-items` | — | **200** — Array de ítems | **400**, **404**, **500** |
| **POST** | `/notes/{id}/checklist-items` | Ver abajo | **201** — Ítem creado | **400**, **404**, **500** |
| **PATCH** | `/checklist-items/{itemId}` | Ver abajo | **200** — Ítem actualizado | **400**, **404**, **500** |
| **DELETE** | `/checklist-items/{itemId}` | — | **204** — Sin body | **400**, **404**, **500** |

**POST `/notes/{id}/checklist-items` — body:**

```json
{
  "text": "string (1–255 caracteres)",
  "is_completed": false
}
```

`is_completed` es opcional (default `false`).

**PATCH `/checklist-items/{itemId}` — body:**

```json
{
  "is_completed": true
}
```

**Shape de respuesta de ítem** (GET array / POST / PATCH):

```json
{
  "id": "uuid",
  "note_id": "uuid",
  "text": "string",
  "is_completed": false
}
```

### Ejemplos curl

```bash
# Listar notas
curl http://localhost:3000/api/notes

# Crear nota de texto
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Daily equipo","type":"note","content":"Resumen breve"}'

# Crear idea con tags
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Widget próxima reunión","type":"idea","color":"#E4E8ED","tags":["PRODUCTO","V2"]}'

# Archivar
curl -X PATCH http://localhost:3000/api/notes/{uuid} \
  -H "Content-Type: application/json" \
  -d '{"is_archived":true}'

# Añadir ítem a checklist (noteId = uuid de nota type checklist)
curl -X POST http://localhost:3000/api/notes/{noteId}/checklist-items \
  -H "Content-Type: application/json" \
  -d '{"text":"Enviar acta"}'

# Marcar ítem completado
curl -X PATCH http://localhost:3000/api/checklist-items/{itemId} \
  -H "Content-Type: application/json" \
  -d '{"is_completed":true}'
```

### Estructura del código (API)

```text
noteflow-api/
  app/api/
    notes/route.ts
    notes/[id]/route.ts
    notes/[id]/checklist-items/route.ts
    checklist-items/[itemId]/route.ts
  lib/db.ts              # query() parametrizada → Neon
  lib/noteQueries.ts     # SQL con LEFT JOIN + json_agg
```

---

## Documentación

| Archivo | Contenido |
|---------|-----------|
| `docs/idea.md` | Problema, usuario, funcionalidades |
| `docs/diseno-ui.md` | Mockup, tokens, tarjetas NOTA / CHECKLIST / IDEA |
| `docs/backend-teoria.md` | Arquitectura, REST, SQL, JOINs, HTTP |
| `docs/seguridad-api.md` | SQL injection, secretos, variables de entorno |
| `docs/setup-auth-local.md` | Setup local auth: Neon (SQL) vs `.env.local` (JWT) |
| `docs/setup-firebase.md` | Firebase: consola, paquetes RN, Firestore, Auth, dev build |
| `docs/flujo-assets-aws.md` | Diagrama upload S3 + render remoto con caché/placeholder |
| `docs/auth-api.md` | JWT, register/login, SecureStore |
| `docs/vercel-deploy.md` | Despliegue Vercel |
| `docs/modelo-datos.md` | Tipos, `AnyNote`, type guards, `isArchived` |
| `docs/gestion-estado.md` | useState / Context / Zustand en NoteFlow |
| `docs/persistencia.md` | Historial AsyncStorage (fase anterior del curso) |
| `docs/pendiente-ejercicio.md` | Checklist del curso |
| `docs/react-native-teoria.md` | Metro, RN vs nativo, Paper, FlashList |
| `docs/react-native-fundamentals.md` | Hilos JS/UI y rendimiento |
| `docs/expo-router-navegacion.md` | Tabs, stacks, modal, Archivo |
| `docs/expo-go-vs-development-build.md` | Expo Go vs EAS Development Build |
| `docs/project-management.md` | Trello |
| `docs/ai-setup.md` | Herramientas de IA en el proyecto |
| `.cursorrules` | Reglas para asistentes en Cursor |
| `.cursor/skills/noteflow/SKILL.md` | Skill de mentoría del repo |

Habilita la skill **`noteflow`** en Cursor para sesiones alineadas con este proyecto.

## Licencia

Por definir.
