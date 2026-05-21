# Gestión de estado

NoteFlow centraliza notas, checklists e ideas en un **store global** con [Zustand](https://github.com/pmndrs/zustand) (`store/notesStore.ts`). Esta sección compara tres enfoques habituales en React y cuándo usar cada uno en este proyecto.

## Resumen comparativo

| Criterio | `useState` | Context API | Zustand |
|----------|------------|-------------|---------|
| **Alcance** | Un componente (o hijos vía props) | Árbol bajo un `Provider` | Global, fuera del árbol de React |
| **Boilerplate** | Mínimo | Medio (context + provider + hooks) | Bajo (`create` + hook) |
| **Providers anidados** | No | Sí, uno por contexto | No |
| **Re-renders** | Solo el componente que actualiza estado | Suele re-renderizar **todo** el subárbol que consume el contexto al cambiar el valor | Solo componentes que **suscriben** al slice que cambió |
| **Datos compartidos entre pestañas** | Incómodo (prop drilling) | Posible | Natural |
| **Ideal en NoteFlow** | Formularios locales, UI temporal | Tema/accesibilidad global pequeña | Listas, CRUD, checklists |

## `useState`

Estado **local**: un input, un modal abierto/cerrado, texto mientras escribes antes de guardar.

**Ventajas:** simple, sin dependencias, fácil de razonar en una pantalla.

**Límites:** si la lista de notas vive en la pestaña Notas y el detalle en otra ruta, pasar datos con props se vuelve frágil. Duplicar estado en varias pantallas desincroniza la UI.

**En NoteFlow:** `nueva-note.tsx` puede seguir usando `useState` para título y cuerpo **hasta** pulsar Guardar; entonces llama `addNote` del store.

## Context API

Un valor (tema, idioma, usuario) se inyecta con `<Provider>` y se lee con `useContext`.

**Ventajas:** viene con React; encaja para pocos valores que cambian poco.

**Límites:** cada actualización del contexto suele re-renderizar **todos** los consumidores, salvo que partas contextos o memorices a mano. Varios dominios (notas + checklists + ideas) implican varios providers anidados.

**En NoteFlow:** el tema visual ya va con **React Native Paper** (`PaperProvider` en `app/_layout.tsx`), no hace falta un Context propio para las listas de datos.

## Zustand

Store fuera del árbol de componentes. Los componentes se suscriben con `useNotesStore(selector)` y solo se actualizan cuando cambia lo que seleccionan.

**Ventajas:**

- Sin providers extra para datos de negocio.
- API pequeña: `create`, `set`, hooks.
- TypeScript directo sobre `NotesStore`.
- Misma fuente de verdad para Notas, Checklists e Ideas y para persistencia futura (middleware).

**Ejemplo (lectura):**

```ts
const notes = useNotesStore((s) => s.notes);
const addNote = useNotesStore((s) => s.addNote);
```

**Store actual** (`store/notesStore.ts`):

- Arrays: `notes`, `checklists`, `ideas`.
- Alta: `addNote`, `addChecklist`, `addIdea`.
- Archivar / restaurar: `archive*` / `unarchive*` por tipo.
- Borrado definitivo: `delete*` (desde Archivo o menú en ítem archivado).
- Checklist: `toggleChecklistItem` (actualiza `updatedAt` del padre).

**Persistencia:** middleware `persist` + AsyncStorage (`noteflow-storage`) — ver [`persistencia.md`](persistencia.md).

**Hidratación:** `_hasHydrated` + `StoreHydrationGate` bloquean la UI hasta leer disco.

Posibles ampliaciones futuras: edición inline en detalle, sincronización en nube.

## Por qué Zustand en NoteFlow

1. **Tres colecciones** compartidas entre pestañas y rutas de detalle.
2. **Modal de creación** y listas deben ver los mismos datos sin prop drilling.
3. **Rendimiento** cuando crezca el número de ítems (selectores + listas virtualizadas).
4. **Persistencia** encaja como capa sobre el mismo store.

## Enlaces

- [Zustand — documentación](https://docs.pmnd.rs/zustand/getting-started/introduction)
- Modelo de tipos: [`modelo-datos.md`](modelo-datos.md)
- Store: [`store/notesStore.ts`](../store/notesStore.ts)
