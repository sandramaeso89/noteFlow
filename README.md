# NoteFlow

## Arranque cada día

> **No uses Expo Go.** NoteFlow usa **módulos nativos** (Firebase, notificaciones, galería, GPS). Abre el icono **noteFlow** en el emulador o móvil, no el de Expo Go. Si en Metro pulsas `s`, vuelves a Go y fallará.

| Paso | Qué haces |
|------|-----------|
| **1** | Entrar en la carpeta del proyecto |
| **2** | Arrancar Metro (`--dev-client`) |
| **3** | Abrir la app (tecla `a`/`i` o icono **noteFlow**) |
| **4** | Login Firebase y usar la app |

**Paso 1.** Abre una terminal y entra en el proyecto:

```bash
cd noteFlow
```

**Paso 2.** Arranca Metro (bundler) en modo development build:

```bash
npx expo start --dev-client -c
```

**Paso 3.** Abre la app en el emulador o dispositivo:

- Pulsa **`a`** (Android) o **`i`** (iOS) en la terminal, **o**
- Toca el icono **noteFlow** (no Expo Go).

**Paso 4.** Inicia sesión con Firebase si te lo pide y usa la app (**Notas · Checklists · Ideas · Archivo**).

**Funciones nativas en la app (curso):**

| Función | Dónde probarla |
|---------|----------------|
| Recordatorio local | Nueva nota → interruptor **Recordatorio local** |
| Ubicación GPS | Nueva nota → **Usar mi ubicación** |
| Foto de perfil | Menú cuenta (cabecera) |
| Archivar / listas | Pestañas + detalle |

---

## Primera vez en este Mac (solo una vez)

> Tras instalar dependencias con **código nativo** (`expo-location`, `expo-notifications`, Firebase, etc.) o un emulador nuevo, vuelve a **compilar** antes del arranque diario:
>
> `npx expo run:android` o `npx expo run:ios` (sección 3 más abajo).

### Primera vez (setup en tu Mac)

**1. Dependencias**

```bash
cd noteFlow
npm install
```

**2. Variables de entorno** — archivo **`.env`** en la raíz (no commitear):

```bash
cp .env.example .env
```

| Modo | `EXPO_PUBLIC_API_URL` |
|------|------------------------|
| **Producción (Vercel)** — recomendado | `https://note-flow-topaz.vercel.app/api` |
| Android Emulator (API local) | `http://10.0.2.2:3000/api` |
| iOS Simulator (API local) | `http://localhost:3000/api` |
| Dispositivo físico (API local, misma WiFi) | `http://<IP-de-tu-Mac>:3000/api` |

**3. Compilar e instalar la app nativa** (solo la primera vez, tras borrar el emulador o cambiar plugins nativos; tarda ~10–15 min la primera vez):

```bash
# Android (emulador encendido o dispositivo por USB)
npx expo run:android

# iOS (Mac + Xcode)
npx expo run:ios
```

Si el build de Android falla por **caché corrupta** o archivos duplicados de macOS (`values 3.xml`, `ExpoModulesPackageList 2.java`, `Duplicate resources`):

```bash
# Borra copias fantasma "archivo 2.java" que macOS a veces crea en build/
find android node_modules -name '* 2.*' -delete 2>/dev/null
find android node_modules -path '*/build/*' -name '* 3.*' -delete 2>/dev/null

rm -rf android/app/build android/build android/.gradle android/app/.cxx
rm -rf node_modules/expo/android/build node_modules/react-native-screens/android/build

npx expo run:android --no-build-cache
```

> **Consejo:** no copies carpetas `build/` en Finder; si iCloud duplica archivos, ejecuta el `find … -delete` de arriba antes de compilar.

| Cuándo | Qué hacer |
|--------|-----------|
| **Cada día** | Pasos 1–4 de [Arranque cada día](#arranque-cada-día) |
| **Primera vez / emulador nuevo / plugin nativo nuevo** | `npx expo run:android` o `npx expo run:ios` (ver abajo) |
| **Build Android falla (caché / `* 2.java`)** | Bloque `find … -delete` + `rm -rf` de arriba y `npx expo run:android --no-build-cache` |
| **GPS: «Current location is unavailable»** | Emulador: ⋮ → **Location** → marcar punto. Ver [`docs/geolocalizacion.md`](docs/geolocalizacion.md) |
| **Error en `SwipeableCard` / gesture-handler** | Tras instalar el paquete: `npx expo run:android` (rebuild dev client). Ver [`docs/gestos-swipe.md`](docs/gestos-swipe.md) |

**Migración Neon (ubicación GPS en API)** — ejecuta una vez en el [SQL Editor de Neon](https://console.neon.tech):

```sql
-- Archivo completo: sql/migrations/002_notes_location.sql
ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;
```

Sin esto, las notas **con ubicación** fallan contra la API en Vercel; el modo local en el móvil sigue funcionando.

Más contexto: [`docs/expo-go-vs-development-build.md`](docs/expo-go-vs-development-build.md) · Firebase: [`docs/setup-firebase.md`](docs/setup-firebase.md) · Notificaciones: [`docs/notificaciones-locales.md`](docs/notificaciones-locales.md) · GPS: [`docs/geolocalizacion.md`](docs/geolocalizacion.md) · Gestos: [`docs/gestos-swipe.md`](docs/gestos-swipe.md).

---

App de **productividad** pensada para quienes viven de **reuniones**: capturar en segundos el resumen de cada cita, las **acciones** pendientes y **referencias** útiles, revisar lo pendiente con calma y archivar lo cerrado sin perder el contexto.

La definición de producto, usuario y alcance está en **[`docs/idea.md`](docs/idea.md)**.

---

### API local (opcional)

Solo si quieres desarrollar contra `localhost:3000` en lugar de Vercel:

```bash
# Terminal 1 — backend
cd noteflow-api
cp .env.example .env.local   # DATABASE_URL + JWT_SECRET (ver docs/setup-auth-local.md)
npm install
npm run dev

# Terminal 2 — app (con .env apuntando a localhost / 10.0.2.2)
npx expo start --dev-client -c
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
| Firebase (Auth + perfil `users` en Firestore) | Hecho | `lib/firebaseAuth.ts`, `lib/userProfile.ts` |
| Notas en Firestore | Pendiente | Aun no implementado (flujo actual: API REST + fallback local) |
| Notificaciones locales + permisos (Ajustes) | Hecho | `utils/notifications.ts`, `docs/notificaciones-locales.md` |
| Geolocalización (GPS + lat/lon en API) | Hecho | `utils/location.ts`, `docs/geolocalizacion.md` |
| Swipe para eliminar (Gesture Handler + Reanimated) | Hecho | `components/items/SwipeableCard.tsx`, `docs/gestos-swipe.md` |
| Animaciones de entrada en listas | Hecho | `components/items/AnimatedCardWrapper.tsx` |

**Navegación:** pestañas **Notas · Checklists · Ideas · Archivo**; detalle `[id]` por sección; modal **`/nueva-note`**. Ver [`docs/expo-router-navegacion.md`](docs/expo-router-navegacion.md).

**Pendiente solo manual (tutor):** auditoría FPS y tema claro/oscuro en simulador — [`docs/pendiente-ejercicio.md`](docs/pendiente-ejercicio.md).

**Flujo real (junio 2026):**
- **Auth principal:** Firebase email/contraseña.
- **Perfil:** colección `users` en Firestore (`name`, `email`, `createdAt`, `avatarUrl`).
- **Notas:** API REST (`noteflow-api` + Neon) cuando hay JWT; si no hay JWT o falla API, fallback local por usuario con AsyncStorage.
- **Sync Firebase → API:** tras login/register se intenta obtener sesión JWT para usar endpoints `/notes`.
- **Ubicación:** opcional al crear nota; se guarda `latitude` / `longitude` en Neon (y nombre de calle en el dispositivo para mostrar).

---

## App móvil — detalle técnico

### Stack móvil

- **React Native** + **Expo SDK 54** — [`docs/react-native-fundamentals.md`](docs/react-native-fundamentals.md), [`docs/react-native-teoria.md`](docs/react-native-teoria.md)
- **Expo Router** — [`docs/expo-router-navegacion.md`](docs/expo-router-navegacion.md)
- **React Native Paper** (MD3) + tokens en `constants/theme.ts`
- **FlashList** — `@shopify/flash-list`
- **Zustand** — estado global con estrategia híbrida: API REST y fallback local
- **expo-secure-store** — token JWT cifrado (no AsyncStorage)
- **Zod** — validación en formularios
- **expo-haptics**, **react-native-reanimated** (entradas en listas + layout)
- **react-native-gesture-handler** — swipe para eliminar en listas ([`docs/gestos-swipe.md`](docs/gestos-swipe.md))
- **expo-notifications** — recordatorios locales al crear nota
- **expo-location** — GPS y geocodificación inversa (`latitude` / `longitude` en API)

**Expo Go** vs **Development Build:** [`docs/expo-go-vs-development-build.md`](docs/expo-go-vs-development-build.md).

### Estructura del código (app)

```text
app/
  _layout.tsx          # GestureHandlerRootView, PaperProvider, StoreHydrationGate
  nueva-note.tsx       # Modal alta (Zod + store)
  (tabs)/
    notas|checklists|ideas|archivadas/
      index.tsx        # FlashList + selección múltiva
      [id].tsx         # Detalle + DetailHeaderMenu
components/
  items/               # Tarjetas, AnimatedCardWrapper, SwipeableCard
  list/                # Cabecera, vacíos, BulkArchiveBar
  UserMenuButton.tsx   # Cuenta + cerrar sesión
lib/api.ts             # Cliente HTTP + Bearer JWT (+ ensureApiAuthToken)
lib/authApi.ts         # Register / login
lib/authStorage.ts     # Token en SecureStore
lib/localNotesRepository.ts # Persistencia local por usuario (AsyncStorage)
lib/syncApiAuth.ts     # Bridge Firebase Auth -> JWT API
utils/location.ts      # GPS + dirección (expo-location)
utils/notifications.ts # Recordatorios locales
utils/permissions.ts   # Permisos + Abrir Ajustes
store/authStore.ts     # Sesión
store/notesStore.ts    # Zustand async (API + fallback local)
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
| [`sql/migrations/002_notes_location.sql`](sql/migrations/002_notes_location.sql) | Columnas `latitude` / `longitude` en `notes` |

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

6. **App móvil:** development build + `npx expo start --dev-client -c`. Ver [Arranque cada día](#arranque-cada-día).

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
| `docs/persistencia.md` | Persistencia real actual: fallback local por usuario y carga inicial |
| `docs/notificaciones-locales.md` | Permisos nativos, recordatorios locales, rebuild dev client |
| `docs/geolocalizacion.md` | expo-location, migración SQL, mostrar ubicación |
| `docs/gestos-swipe.md` | Pan + Reanimated, swipe-to-delete en listas |
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
