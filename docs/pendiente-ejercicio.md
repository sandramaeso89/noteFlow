# Pendiente del ejercicio (enunciado del tutor)

Checklist de NoteFlow frente al enunciado del curso.  
**Dirección visual:** [`diseno-ui.md`](diseno-ui.md) y [`design-reference-mockup.png`](design-reference-mockup.png).

**Estado global:** entregable técnico **completo** en código y documentación. Solo queda verificación **manual** en simulador (abajo).

---

## 1. Listas de alto rendimiento con FlashList

```bash
npx expo install @shopify/flash-list
```

En **FlashList 2.x** (Expo SDK 54) no hace falta `estimatedItemSize` en tipos; ver [`react-native-teoria.md`](react-native-teoria.md) (*Rendimiento en listas*).

### Componentes de tarjeta

- [x] `components/items/NoteCard.tsx` — barra acento, preview, fecha
- [x] `components/items/ChecklistCard.tsx` — barra de progreso, fracción tabular
- [x] `components/items/IdeaCard.tsx` — tags rectangulares, tinte por `color`

### Pantallas

- [x] **FlashList** en `notas`, `checklists`, `ideas` y **`archivadas`**

### Documentación

- [x] Sección **«Rendimiento en listas»** en `docs/react-native-teoria.md`

---

## 2. Formularios y validación con Zod

```bash
npx expo install zod
```

| Tipo | UI |
|------|-----|
| **Note** | Título y área de texto |
| **ChecklistNote** | Ítems dinámicos |
| **IdeaNote** | Color y etiquetas |

- [x] `schemas/noteSchemas.ts` (nota, checklist, idea)
- [x] `app/nueva-note.tsx` conectado al store
- [x] `KeyboardAvoidingView` iOS/Android
- [x] Errores Zod debajo de cada campo (`FieldError`)

---

## 3. Persistencia con AsyncStorage

```bash
npx expo install @react-native-async-storage/async-storage
```

- [x] Middleware `persist` en `store/notesStore.ts` (`noteflow-storage`)
- [x] Reviver de fechas (`utils/storeSerialization.ts`)
- [x] `StoreHydrationGate` en `app/_layout.tsx`
- [x] Documentación en [`persistencia.md`](persistencia.md)

**Verificación manual recomendada:** crear nota → cerrar app por completo → reabrir → debe seguir ahí.

---

## 4. Pulido de UX y feedback táctil

```bash
npx expo install expo-haptics
```

- [x] `utils/haptics.ts`
- [x] Haptic al archivar / eliminar definitivo (`confirmActions.ts`)
- [x] Haptic al marcar ítem de checklist; éxito al completar todos
- [x] Detalle `[id].tsx` × 3 con menú **⋮** (`DetailHeaderMenu`)
- [x] `ChecklistItemRow` en detalle de checklist
- [x] Estados vacíos con icono y CTA en Notas / Checklists / Ideas
- [x] Token `cardBorder` (1,5px) en **tarjetas** y vacíos; cabecera de lista **sin** panel tarjeta
- [x] `ENABLE_STRESS_SEED` en `store/seedData.ts` (auditoría scroll)

### Auditoría en simulador (manual)

- [ ] FPS con seed de estrés y scroll rápido
- [ ] Tema claro/oscuro en listas, detalle, archivo y búsqueda

---

## 5. Extensión natural (opcional — hecho)

- [x] Búsqueda (`ListScreenHeader` + `utils/filters.ts`)
- [x] Reanimated (`AnimatedCardWrapper`)
- [x] Archivar + pestaña **Archivo** (`archivadas/`, `isArchived`)

---

## 6. Entregable

Repositorio en GitHub con el proyecto Expo funcional:

- [x] Librería UI configurada
- [x] Tres tipos de notas con **tarjetas visualmente distintas**
- [x] **FlashList** en todas las listas
- [x] Formularios con validación **Zod**
- [x] Estado global con **Zustand**
- [x] Persistencia con **AsyncStorage**
- [x] `docs/react-native-teoria.md` **completo**

---

## Referencia rápida en el repo

| Área | Dónde |
|------|--------|
| Tipos | `types/index.ts`, `docs/modelo-datos.md` |
| Store + persist | `store/notesStore.ts`, `docs/persistencia.md` |
| UI / tokens | `constants/theme.ts`, `docs/diseno-ui.md` |
| Tarjetas + listas | `components/items/`, `app/(tabs)/*/index.tsx` |
| Formularios | `app/nueva-note.tsx`, `schemas/noteSchemas.ts` |
| UX detalle / archivo | `components/detail/`, `utils/haptics.ts`, `archivadas/` |
| Navegación | `app/`, `docs/expo-router-navegacion.md` |

---

## 8. Backend API (nueva fase del curso)

Proyecto: [`noteflow-api/`](../noteflow-api/). Teoría: [`backend-teoria.md`](backend-teoria.md).

```bash
npx create-next-app@latest noteflow-api --typescript --app --no-tailwind --no-src-dir
cd noteflow-api && npm install @neondatabase/serverless zod
```

- [x] Proyecto Next.js `noteflow-api` creado
- [x] `@neondatabase/serverless` y `zod` instalados
- [x] `.env.local` (local) + `.env.example` (plantilla); secretos fuera de git
- [x] `lib/db.ts` con helper `query()`
- [x] `docs/backend-teoria.md` (cliente-servidor, REST, HTTP, códigos)
- [ ] Rutas `app/api/...` (CRUD notas / checklists / ideas)
- [ ] Conectar app móvil a la API (sustituir o complementar AsyncStorage)

---

*Última revisión: móvil entregable cerrado; backend iniciado; casillas `[ ]` = API, pruebas manuales o sync móvil.*
