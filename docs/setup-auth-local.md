# Configuración local: auth + API + app

Guía rápida para evitar errores habituales (p. ej. pegar `JWT_SECRET` en el SQL Editor de Neon).

---

## Dónde va cada cosa (no mezclar)

| Qué | Dónde **sí** | Dónde **no** |
|-----|--------------|--------------|
| Crear tablas `users`, `notes`, … | **Neon → SQL Editor** (solo sentencias SQL) | `.env.local`, Vercel, la app |
| `DATABASE_URL` | `noteflow-api/.env.local` y panel **Vercel** | SQL Editor de Neon |
| `JWT_SECRET` | `noteflow-api/.env.local` y panel **Vercel** | SQL Editor de Neon ❌ |
| `EXPO_PUBLIC_API_URL` | `.env` en la **raíz** del proyecto Expo | `noteflow-api/.env.local` |
| Token JWT tras login | **expo-secure-store** (automático en la app) | AsyncStorage, Neon, git |

Si pegas `JWT_SECRET=...` en Neon verás:

```text
ERROR: syntax error at or near "JWT_SECRET"
```

Eso es normal: Neon no entiende variables de entorno, solo SQL.

---

## Paso 1 — SQL en Neon (consola web)

1. Abre [console.neon.tech](https://console.neon.tech) → tu proyecto → **SQL Editor**.
2. Pega y ejecuta **solo** el contenido de uno de estos archivos:

**Proyecto nuevo** (sin tablas):

- [`sql/schema.sql`](../sql/schema.sql)

**Ya tenías tablas `notes` sin usuarios:**

- [`sql/migrations/001_users_auth.sql`](../sql/migrations/001_users_auth.sql)

3. Comprueba en **Tables** que existen `users` y que `notes` tiene columna `user_id`.

4. En el panel de Neon, copia el **connection string** (será tu `DATABASE_URL`).

---

## Paso 2 — Variables en tu Mac (`noteflow-api/.env.local`)

```bash
cd noteflow-api
cp .env.example .env.local
```

Edita **`noteflow-api/.env.local`** (archivo de texto en el repo, no en Neon):

```env
DATABASE_URL=postgresql://usuario:contraseña@ep-xxx.neon.tech/neondb?sslmode=require
JWT_SECRET=PegaAquiElResultadoDeOpensslNoEstaLineaLiteral
```

Genera un `JWT_SECRET` real en Terminal:

```bash
openssl rand -base64 32
```

Copia la salida y sustituye el valor de `JWT_SECRET`. Mínimo **32 caracteres**.

Reinicia la API cada vez que cambies `.env.local`:

```bash
npm run dev
```

Debe mostrar `✓ Ready` en `http://0.0.0.0:3000`.

---

## Paso 3 — Probar registro (Terminal)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"prueba@noteflow.dev","password":"12345678"}'
```

| Respuesta | Significado |
|-----------|-------------|
| **201** + `token` y `user` | Todo correcto |
| **409** | Ese email ya existe (prueba login) |
| **500** `Error interno` | Revisa: tabla `users` en Neon, `DATABASE_URL`, `JWT_SECRET` en `.env.local`, API reiniciada |

`GET /api/notes` **sin** token ahora devuelve **401** (esperado). Con token:

```bash
curl http://localhost:3000/api/notes \
  -H "Authorization: Bearer TU_TOKEN"
```

---

## Paso 4 — App móvil (Expo)

En la **raíz** del repo (no en `noteflow-api`):

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
```

(Ajusta IP según emulador/dispositivo; ver README.)

```bash
npx expo start -c
```

1. Pantalla **NoteFlow** → Crear cuenta o Entrar.
2. Tras login verás Notas / Checklists / Ideas.

Las notas creadas **antes** de auth (sin `user_id`) **no aparecen**; son de otra “época” de la base de datos. Crea notas nuevas o usa el seed con token.

---

## Paso 5 — Datos demo (opcional)

Tras registrarte, copia el `token` de la respuesta curl o de la app (dev tools) y:

```bash
AUTH_TOKEN=eyJhbGciOi... node scripts/seedDemoApi.mjs
```

---

## Errores frecuentes

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `syntax error at or near "JWT_SECRET"` en Neon | Variable en SQL Editor | Mover `JWT_SECRET` a `.env.local` |
| App: **Error interno** al registrarse | API sin `JWT_SECRET` o sin tabla `users` | Pasos 1 y 2 |
| App: **Error al cargar notas** tras login | API parada o URL mal en `.env` | `npm run dev` + `EXPO_PUBLIC_API_URL` |
| Listas vacías tras login | Notas viejas sin `user_id` | Crear contenido nuevo o seed con `AUTH_TOKEN` |
| **401** en notas | Sin token o token caducado (7 días) | Volver a iniciar sesión |

---

## Siguiente paso: producción

[`vercel-deploy.md`](vercel-deploy.md) — Vercel + mismas variables (`DATABASE_URL`, `JWT_SECRET`).

Teoría JWT y endpoints: [`auth-api.md`](auth-api.md).
