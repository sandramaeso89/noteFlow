# Pendiente del ejercicio (enunciado del tutor)

Checklist de lo que falta por hacer en NoteFlow. Texto basado en el enunciado del curso.  
**Dirección visual acordada:** [`diseno-ui.md`](diseno-ui.md) y [`design-reference-mockup.png`](design-reference-mockup.png).

---

## 1. Listas de alto rendimiento con FlashList

`FlatList` tiene un problema conocido con listas largas: el reciclaje de componentes no es eficiente y aparecen pantallas en blanco al hacer scroll rápido. **FlashList** de Shopify lo resuelve reciclando componentes de forma más agresiva.

```bash
npx expo install @shopify/flash-list
```

La propiedad **`estimatedItemSize`** le indica a FlashList cuánto espacio ocupará cada elemento antes de renderizarlo. Cuanto más preciso sea el valor, mejor será el rendimiento.

### Componentes de tarjeta

- [x] `components/items/NoteCard.tsx` — título, comienzo del contenido y fecha
- [x] `components/items/ChecklistCard.tsx` — título, tareas completadas y barra de progreso
- [x] `components/items/IdeaCard.tsx` — título, etiquetas como chips y color de fondo

### Pantallas

- [x] Usar **FlashList** en cada pantalla de pestaña (`notas`, `checklists`, `ideas`)

### Documentación

- [x] Añadir sección **«Rendimiento en listas»** (reciclaje de componentes) — en `docs/react-native-teoria.md`

---

## 2. Formularios y validación con Zod

El formulario en `app/nueva-note.tsx` debe adaptarse al tipo:

| Tipo | UI |
|------|-----|
| **Note** | Título y área de texto |
| **ChecklistNote** | Campo dinámico para añadir ítems |
| **IdeaNote** | Selector de color y campo para etiquetas |

```bash
npx expo install zod
```

- [x] `zod` instalado; schemas en `schemas/noteSchemas.ts`

### Schemas de validación (ejemplo del enunciado)

```ts
import { z } from 'zod';

const noteSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  content: z.string().min(1, 'El contenido no puede estar vacío'),
});
```

- [x] Schemas para nota, checklist e idea en `schemas/noteSchemas.ts`
- [x] Formulario adaptado por tipo en `app/nueva-note.tsx` (conectado al store)

### UX del formulario

- [x] `KeyboardAvoidingView` con `behavior='padding'` en iOS y `behavior='height'` en Android
- [x] Mostrar mensajes de error de Zod **debajo** de cada campo

---

## 3. Persistencia con AsyncStorage

AsyncStorage permite guardar datos en el dispositivo.

**Limitaciones:** no tiene cifrado, tiene límite de tamaño y los datos solo están en ese dispositivo.

```bash
npx expo install @react-native-async-storage/async-storage
```

### Integración en Zustand

```ts
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({ /* acciones */ }),
    {
      name: 'noteflow-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Tareas

- [ ] Envolver el store con middleware `persist`
- [ ] **Verificar:** crear notas → cerrar la app por completo → reabrir y comprobar que siguen ahí

### Documentación

- [ ] Explicar qué ocurre durante la **rehidratación** del store
- [ ] Describir cómo mostrarías un **indicador de carga** mientras se rehidrata

---

## 4. Pulido de UX y feedback táctil

```bash
npx expo install expo-haptics
```

Las vibraciones táctiles elevan la percepción de calidad.

- [ ] `Haptics.impactAsync(ImpactFeedbackStyle.Light)` al **eliminar** una nota
- [ ] `Haptics.notificationAsync(NotificationFeedbackType.Success)` al **completar todos** los ítems de un checklist

### Detalle y listas

- [x] Navegación al pulsar tarjeta → `[id].tsx` (ya enlazado desde listas; falta contenido rico en detalle)
- [ ] **Eliminar** con `Alert.alert` de confirmación
- [x] **Estado vacío** básico en cada pestaña cuando no hay contenido

### Auditoría en simulador

- [ ] Sin caídas de FPS con **50+ ítems** en cada lista
- [ ] Tema **oscuro y claro** correcto en todos los componentes

---

## 5. Extensión natural de la fase (opcional)

- [ ] **Búsqueda global:** input en la cabecera de cada pestaña que filtre en tiempo real
- [ ] **Animaciones:** envolver tarjetas con `Animated.View` de Reanimated — entrada `FadeInDown`, salida `FadeOutLeft`
- [ ] **Archivar** notas en lugar de eliminar definitivamente + pestaña de archivadas

---

## 6. Entregable

Repositorio en GitHub con el proyecto Expo funcional:

- [x] Librería UI configurada
- [x] Tres tipos de notas con **tarjetas visualmente distintas** (alineadas con [`diseno-ui.md`](diseno-ui.md))
- [x] **FlashList** en todas las listas
- [x] Formularios con validación **Zod**
- [x] Estado global con **Zustand**
- [ ] Persistencia con **AsyncStorage**
- [ ] `docs/react-native-teoria.md` **completo** (sección listas añadida; revisar resto del enunciado del curso)

---

## Ya hecho en el repo (referencia)

| Hecho | Dónde |
|-------|--------|
| Modelo TypeScript (`Note`, `ChecklistNote`, `IdeaNote`, `AnyNote`) | `types/index.ts`, `docs/modelo-datos.md` |
| Store Zustand (base, sin persist aún) + datos demo | `store/notesStore.ts`, `store/seedData.ts`, `docs/gestion-estado.md` |
| Tokens UI (grises + Paper) | `constants/theme.ts`, `hooks/useNoteFlowColors.ts`, `docs/diseno-ui.md` |
| Tarjetas + FlashList en pestañas | `components/items/`, `app/(tabs)/*/index.tsx` |
| Formularios Zod + alta en store | `app/nueva-note.tsx`, `schemas/noteSchemas.ts`, `components/forms/FieldError.tsx` |
| Expo Router (tabs, stacks, modal) | `app/`, `docs/expo-router-navegacion.md` |

---

*Actualiza las casillas `- [ ]` → `- [x]` conforme completes cada ítem.*
