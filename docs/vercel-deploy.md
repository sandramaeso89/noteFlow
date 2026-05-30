# Despliegue de noteflow-api en Vercel

Guía paso a paso para publicar la API en producción y conectarla con la app móvil.

> **Antes de Vercel:** configura auth en local siguiendo [`setup-auth-local.md`](setup-auth-local.md).  
> **Importante:** `DATABASE_URL` y `JWT_SECRET` van en el **panel de Vercel** o en `.env.local`, **nunca** en el SQL Editor de Neon.

---

## 1. Preparar Neon

1. Crea o usa tu proyecto en [neon.tech](https://neon.tech).
2. Abre **SQL Editor** y ejecuta **solo SQL** (no pegues `JWT_SECRET` ni `DATABASE_URL` aquí):
   - [`sql/schema.sql`](../sql/schema.sql) — instalación nueva.
   - **O** [`sql/migrations/001_users_auth.sql`](../sql/migrations/001_users_auth.sql) — si ya tenías tablas sin usuarios.
3. En el panel de Neon, copia el **connection string** → lo usarás como `DATABASE_URL` en Vercel (paso 3).

---

## 2. Conectar el repositorio en Vercel

1. Entra en [vercel.com](https://vercel.com) → **Add New Project**.
2. Importa el repo **noteFlow** de GitHub.
3. En **Root Directory**, elige **`noteflow-api`** (no la raíz del monorepo).
4. Framework: **Next.js** (detectado automáticamente).
5. **Build Command:** `npm run build` (por defecto).
6. **Output Directory:** `.next` (por defecto).

---

## 3. Variables de entorno en Vercel

En **Project → Settings → Environment Variables** (no en Neon SQL Editor), añade:

| Variable | Valor | Entornos |
|----------|-------|----------|
| `DATABASE_URL` | Connection string copiado del panel de Neon | Production, Preview, Development |
| `JWT_SECRET` | Salida de `openssl rand -base64 32` (≥ 32 caracteres) | Production, Preview, Development |

Ejemplo correcto en Vercel: nombre `JWT_SECRET`, valor `k7x9mP2...` (cadena aleatoria).

Ejemplo **incorrecto** en Neon SQL Editor: `JWT_SECRET=k7x9mP2...` → error de sintaxis SQL.

No subas estos valores al repositorio git.

---

## 4. Desplegar

1. Pulsa **Deploy** (o haz push a `main` si Vercel está conectado al repo).
2. Espera a que el build termine en verde.
3. Anota la URL de producción, p. ej. `https://noteflow-api-xxx.vercel.app`.

---

## 5. Verificar endpoints en producción

Sustituye `BASE` por tu URL (sin `/api` al final):

```bash
BASE=https://tu-proyecto.vercel.app

# Registro
curl -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"tu@email.com","password":"minimo8chars"}'

# Login (guarda el token de la respuesta)
curl -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"tu@email.com","password":"minimo8chars"}'

# Notas (requiere token)
curl "$BASE/api/notes" \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

Respuestas esperadas:

- Register → **201** con `{ token, user }`
- Login → **200** con `{ token, user }`
- GET /notes sin token → **401**
- GET /notes con token válido → **200** (array, puede estar vacío)

---

## 6. Conectar la app móvil

En el `.env` de la raíz del proyecto Expo:

```env
EXPO_PUBLIC_API_URL=https://tu-proyecto.vercel.app/api
```

Reinicia Expo con caché limpia:

```bash
npx expo start -c
```

Regístrate o entra desde la pantalla de login de la app.

---

## 7. Datos demo en producción (opcional)

Tras registrarte y obtener un token:

```bash
AUTH_TOKEN=eyJ... node scripts/seedDemoApi.mjs
```

Los scripts de seed envían `Authorization: Bearer` si existe `AUTH_TOKEN`.

---

## Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| `syntax error at or near "JWT_SECRET"` en Neon | No pegues secretos en SQL Editor; usa Vercel o `.env.local` |
| Build falla en Vercel | Revisa logs; suele faltar `JWT_SECRET` o error TypeScript |
| 500 en `/api/auth/register` | `DATABASE_URL` incorrecto, tabla `users` inexistente o `JWT_SECRET` ausente |
| 500 en `/api/notes` | Migración SQL no ejecutada en Neon |
| 401 en la app | Token expirado (7 días); vuelve a iniciar sesión |
| App no conecta | `EXPO_PUBLIC_API_URL` con `/api` al final; redeploy tras cambiar env en Vercel |

---

## Enlaces

- [Documentación Vercel — Next.js](https://vercel.com/docs/frameworks/nextjs)
- Auth y JWT: [`auth-api.md`](auth-api.md)
- Seguridad: [`seguridad-api.md`](seguridad-api.md)
