# Expo Router en NoteFlow: Tabs, Stack y modal

Cómo está montada la **navegación** y por qué se combinan Stack raíz, Tabs, Stacks por pestaña y una ruta modal.

## Resumen visual

```text
Stack (raíz, `app/_layout.tsx`)
├── index          → Redirect a `/notas`
├── (tabs)         → barra inferior: Notas | Checklists | Ideas | Archivo
│   ├── notas      → Stack: lista + `/notas/[id]`
│   ├── checklists → Stack: lista + `/checklists/[id]`
│   ├── ideas      → Stack: lista + `/ideas/[id]`
│   └── archivadas → Stack: lista mezclada + mismos detalles por tipo
└── nueva-note     → modal (`presentation: 'modal'`)
```

Los grupos `(tabs)` **no** aparecen en la URL: rutas públicas `/notas`, `/checklists`, `/ideas`, `/archivadas`.

## Stack (raíz)

Envuelve la app. Oculta cabecera en `index` y `(tabs)`; cabeceras en stacks internos y en el modal. `StoreHydrationGate` y `PaperProvider` viven aquí.

Rutas fuera de tabs: modal de alta y futuras pantallas globales (ajustes, etc.).

## Tabs (cuatro pestañas)

`app/(tabs)/_layout.tsx`:

| Pestaña | Ruta base | Contenido |
|---------|-----------|-----------|
| Notas | `/notas` | Lista `Note` activas |
| Checklists | `/checklists` | Lista `ChecklistNote` activas |
| Ideas | `/ideas` | Lista `IdeaNote` activas |
| Archivo | `/archivadas` | Mezcla archivadas (las tres colecciones) |

Iconos: `MaterialCommunityIcons`, coherente con Paper.

## Stack (dentro de cada pestaña)

Cada sección tiene `_layout.tsx` con Stack: **lista** (`index.tsx`) → **detalle** (`[id].tsx`).

Desde archivo, al pulsar una tarjeta se navega al detalle de su tipo (`/notas/[id]`, etc.).

## Modal `nueva-note`

`app/nueva-note.tsx` — presentación modal desde el Stack raíz.

- Abierto con `router.push({ pathname: '/nueva-note', params: { type: 'note' | 'checklist' | 'idea' } })`.
- Formulario por tipo, validación **Zod**, guardado en **Zustand** (y persistencia automática).

## Detalle y acciones

Pantallas `[id].tsx`:

- Datos desde `useNotesStore`.
- Menú **⋮** (`components/detail/DetailHeaderMenu.tsx`): archivar (activas), restaurar + eliminar definitivo (archivadas).
- Checklist: `ChecklistItemRow` + toggle en store.

## Archivos clave

| Ruta | Rol |
|------|-----|
| `app/_layout.tsx` | Stack raíz, Paper, hidratación, `nueva-note` |
| `app/index.tsx` | Redirect → `/notas` |
| `app/(tabs)/_layout.tsx` | Cuatro tabs |
| `app/(tabs)/*/index.tsx` | FlashList + `ListScreenHeader` |
| `app/(tabs)/*/[id].tsx` | Detalle |
| `app/(tabs)/archivadas/index.tsx` | Lista unificada archivadas |
| `app/nueva-note.tsx` | Modal alta |

## Enlaces

- [Expo Router — introduction](https://docs.expo.dev/router/introduction/)
- [Layout routes](https://docs.expo.dev/router/basics/layout/)
