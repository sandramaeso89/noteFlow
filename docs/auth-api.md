# Autenticación JWT en NoteFlow

La API protege todas las rutas de notas con **JWT** en la cabecera `Authorization: Bearer <token>`. La app móvil guarda el token en **expo-secure-store** (Keychain / Keystore).

**Configuración paso a paso (local):** [`setup-auth-local.md`](setup-auth-local.md) — incluye qué va en Neon (SQL) y qué en `.env.local` (secretos).

---

## Dónde configurar cada secreto

| Variable | Archivo / sitio |
|----------|-----------------|
| `DATABASE_URL` | `noteflow-api/.env.local` · Vercel → Environment Variables |
| `JWT_SECRET` | `noteflow-api/.env.local` · Vercel → Environment Variables |
| `EXPO_PUBLIC_API_URL` | `.env` en la raíz del proyecto Expo |

**No** pegues `JWT_SECRET=...` en el SQL Editor de Neon; no es SQL y verás `syntax error at or near "JWT_SECRET"`.

---

## Flujo

```text
App móvil                         API (noteflow-api)              Neon
   │                                      │                          │
   │  POST /auth/register o /login        │                          │
   │ ───────────────────────────────────► │  verifica email/password │
   │                                      │ ────────────────────────►│
   │  ◄── { token, user }                 │                          │
   │                                      │                          │
   │  SecureStore.setItem(token)        │                          │
   │                                      │                          │
   │  GET /notes + Bearer token           │                          │
   │ ───────────────────────────────────► │  verify JWT → userId     │
   │                                      │  SQL WHERE user_id = …   │
   │  ◄── notas del usuario               │                          │
```

---

## Endpoints de auth (públicos)

### POST `/api/auth/register`

**Body:**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "minimo8chars"
}
```

**Respuesta 201:**

```json
{
  "token": "eyJhbG...",
  "user": { "id": "uuid", "email": "usuario@ejemplo.com" }
}
```

**Errores:** 400 (validación), 409 (email duplicado), **500** (tabla `users` inexistente, `DATABASE_URL` o `JWT_SECRET` mal configurados en `.env.local` — ver [`setup-auth-local.md`](setup-auth-local.md)).

### POST `/api/auth/login`

**Body:** mismo formato que register (solo email + password).

**Respuesta 200:** mismo shape `{ token, user }`.

**Errores:** 400, 401 (credenciales incorrectas), 500.

---

## Endpoints protegidos

Todas las rutas bajo `/api/notes` y `/api/checklist-items` exigen:

```http
Authorization: Bearer eyJhbG...
```

Sin token o token inválido → **401** `{ "error": "No autenticado" }` o `{ "error": "Token inválido o expirado" }`.

Cada usuario solo ve y modifica **sus** notas (`notes.user_id`).

---

## Variables de entorno

| Variable | Dónde | Uso |
|----------|-------|-----|
| `JWT_SECRET` | `noteflow-api/.env.local` / Vercel | Firma y verificación del JWT (≥ 32 caracteres) |
| `DATABASE_URL` | Idem | PostgreSQL Neon |
| `EXPO_PUBLIC_API_URL` | `.env` app móvil | URL base de la API |

Generar secreto:

```bash
openssl rand -base64 32
```

---

## App móvil

| Archivo | Rol |
|---------|-----|
| `lib/authStorage.ts` | Lee/escribe token en SecureStore |
| `lib/authApi.ts` | POST register/login |
| `lib/api.ts` | Añade `Authorization` a cada petición |
| `store/authStore.ts` | Estado de sesión (Zustand) |
| `components/AuthGate.tsx` | Redirige a `/login` si no hay token |
| `app/login.tsx` | Pantalla de acceso |

**Por qué SecureStore y no AsyncStorage:** AsyncStorage guarda texto plano; el JWT daría acceso a la cuenta de otro usuario si extraen el almacenamiento. SecureStore usa el Keychain (iOS) o Keystore (Android) con cifrado.

---

## Migración SQL

Si ya tenías datos antes de auth, ejecuta en **Neon SQL Editor** (solo SQL):

[`sql/migrations/001_users_auth.sql`](../sql/migrations/001_users_auth.sql)

Las notas **sin `user_id`** no aparecerán tras activar auth; crea contenido nuevo tras registrarte o ejecuta el seed con `AUTH_TOKEN`.

---

## Enlaces

- Despliegue Vercel: [`vercel-deploy.md`](vercel-deploy.md)
- SQL injection y secretos: [`seguridad-api.md`](seguridad-api.md)
