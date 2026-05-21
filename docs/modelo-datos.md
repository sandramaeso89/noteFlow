# Modelo de datos (TypeScript)

Las interfaces viven en [`types/index.ts`](../types/index.ts). Resumen del dominio:

| Tipo | Interfaz | Campo distintivo |
|------|----------|------------------|
| Nota de texto | `Note` | `content: string` |
| Checklist | `ChecklistNote` | `items: ChecklistItem[]` |
| Idea | `IdeaNote` | `tags: string[]`, `color: string` |

Todas comparten `BaseNote`: `id`, `title`, `createdAt`, `updatedAt`, y opcionalmente **`isArchived?: boolean`** (soft-delete: oculta de listas activas, visible en pestaña Archivo).

## Unión `AnyNote`

```ts
type AnyNote = Note | ChecklistNote | IdeaNote;
```

Una función que recibe `AnyNote` puede tratar **cualquier** variante con la misma firma, por ejemplo:

```ts
function noteTitle(note: AnyNote): string {
  return note.title;
}
```

TypeScript solo garantiza los campos de **intersección** (`BaseNote`). Para acceder a `content`, `items` o `tags` hay que **acotar** el tipo antes (type guard, `switch`, etc.).

## Type guards en tiempo de ejecución

En compilación, `AnyNote` se resuelve; en **runtime** los objetos son JavaScript plano. Para ramificar con seguridad se usa el operador `in` sobre una propiedad que **solo** tenga un miembro de la unión:

| Expresión | `true` cuando la nota es |
|-----------|---------------------------|
| `'items' in note` | `ChecklistNote` |
| `'content' in note` | `Note` |
| `'tags' in note` | `IdeaNote` |

Ejemplo con las funciones exportadas en `types/index.ts`:

```ts
import { type AnyNote, isChecklistNote, isNote, isIdeaNote } from '../types';

function renderNoteBody(note: AnyNote) {
  if (isChecklistNote(note)) {
    // note: ChecklistNote
    return `${note.items.filter((i) => !i.isCompleted).length} pendientes`;
  }
  if (isNote(note)) {
    // note: Note
    return note.content;
  }
  if (isIdeaNote(note)) {
    // note: IdeaNote
    return note.tags.join(', ');
  }
}
```

Equivalente inline (sin helpers):

```ts
if ('items' in note) {
  // ChecklistNote
} else if ('content' in note) {
  // Note
} else if ('tags' in note) {
  // IdeaNote
}
```

### Por qué funciona

Cada variante define un campo **exclusivo** (`content`, `items`, `tags`). Si `'items' in note` es `true`, TypeScript infiere `ChecklistNote` dentro de ese bloque (*narrowing*).

### Buenas prácticas

- Ordenar comprobaciones de la variante **más específica** o usar `if / else if` para no asumir dos tipos a la vez.
- Al **crear** notas, incluir solo los campos de esa variante (no mezclar `content` e `items` en el mismo objeto).
- Al **persistir** (JSON), `Date` suele serializarse como string ISO; rehidratar a `Date` al cargar.

## Relación con el producto

En [`idea.md`](idea.md) el dominio habla de reuniones, acciones y referencias. En la UI del curso las pestañas son **Notas**, **Checklists** e **Ideas**, más **Archivo** para ítems con `isArchived: true`. El store mantiene tres arrays (`notes`, `checklists`, `ideas`); no hay un cuarto tipo, solo filtro por bandera.

## Store y persistencia

- Alta y edición vía `store/notesStore.ts` (Zustand).
- Solo los tres arrays se persisten en AsyncStorage; ver [`persistencia.md`](persistencia.md).
