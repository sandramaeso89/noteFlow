# noteflow-api

API REST del curso NoteFlow (Next.js App Router + Neon PostgreSQL).

La app móvil **no** se conecta a la base de datos; solo hablará con esta API por HTTP.

## Setup

```bash
npm install
cp .env.example .env.local
```

Edita `.env.local` y pega tu `DATABASE_URL` de [Neon](https://neon.tech). **No** subas `.env.local` a git.

```bash
npm run dev
```

Abre http://localhost:3000

## Estructura relevante

| Ruta | Rol |
|------|-----|
| `lib/db.ts` | Conexión Neon y helper `query()` |
| `app/api/` | Route Handlers REST (próximas fases del curso) |
| `.env.example` | Plantilla sin secretos |

Teoría (cliente-servidor, HTTP, códigos de estado): [`../docs/backend-teoria.md`](../docs/backend-teoria.md).
