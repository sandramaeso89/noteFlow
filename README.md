# NoteFlow

App de **productividad** pensada para quienes viven de **reuniones**: capturar en segundos el resumen de cada cita, las **acciones** pendientes y **referencias** útiles, revisar lo pendiente con calma y archivar lo cerrado sin perder el contexto.

La definición de producto, usuario y alcance está en **[`docs/idea.md`](docs/idea.md)**.

## Tablero Trello (gestión del trabajo)

| Recurso | Enlace |
|---------|--------|
| **Tablero NoteFlow** | [Abrir tablero en Trello](https://trello.com/invite/b/6a048a0373bbe62e3367a880/ATTI8b855197a3a2f6feced08fd4beb61fa60725B2BD/noteflow) |
| **Cómo se usa el tablero** | [`docs/project-management.md`](docs/project-management.md) — columnas, flujo y tarjetas con subtareas |

Columnas del tablero: **Backlog**, **Todo**, **In Progress**, **Review**, **Done**.

## Estado del proyecto

**Entregable del curso (Expo funcional):** completado en este repositorio.

| Requisito | Estado | Dónde |
|-----------|--------|--------|
| Librería UI (React Native Paper + tokens) | Hecho | `app/_layout.tsx`, `constants/theme.ts` |
| Tres tipos con tarjetas distintas | Hecho | `NoteCard`, `ChecklistCard`, `IdeaCard` |
| FlashList en todas las listas | Hecho | 4 pestañas (`notas`, `checklists`, `ideas`, `archivadas`) |
| Formularios + Zod | Hecho | `app/nueva-note.tsx`, `schemas/noteSchemas.ts` |
| Zustand | Hecho | `store/notesStore.ts` |
| AsyncStorage + persist | Hecho | `docs/persistencia.md`, `StoreHydrationGate` |
| Documentación de teoría RN | Hecho | `docs/react-native-teoria.md` |

**Navegación:** pestañas **Notas · Checklists · Ideas · Archivo**; detalle `[id]` por sección; modal **`/nueva-note`**. Ver [`docs/expo-router-navegacion.md`](docs/expo-router-navegacion.md).

**UI:** tokens minimalistas + grises ([`docs/diseno-ui.md`](docs/diseno-ui.md)); tarjetas con borde `cardBorder` (1,5px); cabecera de lista **sin panel** (título + búsqueda + **+** sobre el fondo).

**UX:** menú ⋮ en detalle (archivar / restaurar / eliminar definitivo), búsqueda, estados vacíos con CTA, haptics, animaciones Reanimated en listas.

**Pendiente solo manual (tutor):** auditoría FPS y tema claro/oscuro en simulador — [`docs/pendiente-ejercicio.md`](docs/pendiente-ejercicio.md).

## Arranque local

```bash
npm install
npm start
```

Equivalente: `npx expo start`. Tras instalar dependencias nuevas o si Metro falla con Reanimated:

```bash
npx expo start -c
```

Luego escanea el QR con **Expo Go** o abre simulador (`i` / `a` en la CLI).

## Stack implementado

- **React Native** + **Expo SDK 54** — [`docs/react-native-fundamentals.md`](docs/react-native-fundamentals.md), [`docs/react-native-teoria.md`](docs/react-native-teoria.md)
- **Expo Router** — [`docs/expo-router-navegacion.md`](docs/expo-router-navegacion.md)
- **React Native Paper** (MD3) + tokens en `constants/theme.ts`
- **FlashList** — `@shopify/flash-list`
- **Zustand** + **persist** → AsyncStorage (`noteflow-storage`)
- **Zod** — validación en alta
- **expo-haptics**, **react-native-reanimated**, **react-native-worklets** (peer de Reanimated 4)

**Expo Go** vs **Development Build:** [`docs/expo-go-vs-development-build.md`](docs/expo-go-vs-development-build.md).

## Estructura del código (resumen)

```text
app/
  _layout.tsx          # PaperProvider, StoreHydrationGate, Stack raíz
  nueva-note.tsx       # Modal alta (Zod + store)
  (tabs)/
    notas|checklists|ideas|archivadas/
      index.tsx        # FlashList + ListScreenHeader
      [id].tsx         # Detalle + DetailHeaderMenu
components/
  items/               # Tarjetas y AnimatedCardWrapper
  list/                # Cabecera, vacíos
  detail/              # Menú detalle, filas checklist
  forms/               # FieldError
store/notesStore.ts    # Zustand + persist
schemas/noteSchemas.ts
types/index.ts
utils/                 # haptics, confirmActions, filters, …
```

## Documentación

| Archivo | Contenido |
|---------|-----------|
| `docs/idea.md` | Problema, usuario, funcionalidades |
| `docs/diseno-ui.md` | Mockup, tokens, tarjetas NOTA / CHECKLIST / IDEA |
| `docs/pendiente-ejercicio.md` | Checklist del curso (casi todo `[x]`) |
| `docs/modelo-datos.md` | Tipos, `AnyNote`, type guards, `isArchived` |
| `docs/gestion-estado.md` | useState / Context / Zustand en NoteFlow |
| `docs/persistencia.md` | AsyncStorage, rehidratación, gate de carga |
| `docs/react-native-teoria.md` | Metro, RN vs nativo, Paper, FlashList, mapa entregable |
| `docs/react-native-fundamentals.md` | Hilos JS/UI y rendimiento |
| `docs/expo-router-navegacion.md` | Tabs, stacks, modal, Archivo |
| `docs/expo-go-vs-development-build.md` | Expo Go vs EAS Development Build |
| `docs/project-management.md` | Trello |
| `docs/ai-setup.md` | Herramientas de IA en el proyecto |
| `.cursorrules` | Reglas para asistentes en Cursor |
| `.cursor/skills/noteflow/SKILL.md` | Skill de mentoría del repo |

Habilita la skill **`noteflow`** en Cursor para sesiones alineadas con este proyecto.

## Requisitos

- **Node.js** (LTS recomendado)
- **Expo Go** en dispositivo o simulador iOS/Android para desarrollo
- macOS / Windows / Linux según tu entorno de curso

## Licencia

Por definir.
