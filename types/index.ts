/**
 * Modelo de datos de NoteFlow.
 *
 * @see docs/modelo-datos.md — unión `AnyNote`, type guards y uso en runtime
 */

/** Campos comunes a nota de texto, checklist e idea. */
export interface BaseNote {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Nota de texto libre (pestaña Notas / reuniones). */
export interface Note extends BaseNote {
  content: string;
}

/** Ítem dentro de una checklist. */
export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

/** Lista de tareas con ítems marcables (pestaña Checklists). */
export interface ChecklistNote extends BaseNote {
  items: ChecklistItem[];
}

/** Captura rápida con etiquetas y color (pestaña Ideas). */
export interface IdeaNote extends BaseNote {
  tags: string[];
  color: string;
}

/**
 * Cualquier variante de nota. Permite funciones genéricas (`getTitle`, listados
 * mezclados, persistencia) sin duplicar firmas por tipo.
 */
export type AnyNote = Note | ChecklistNote | IdeaNote;

/** Comprueba en runtime si la nota es una checklist (`items` solo existe ahí). */
export function isChecklistNote(note: AnyNote): note is ChecklistNote {
  return 'items' in note;
}

/** Comprueba en runtime si la nota es de texto (`content` solo en `Note`). */
export function isNote(note: AnyNote): note is Note {
  return 'content' in note;
}

/** Comprueba en runtime si la nota es una idea (`tags` solo en `IdeaNote`). */
export function isIdeaNote(note: AnyNote): note is IdeaNote {
  return 'tags' in note;
}
