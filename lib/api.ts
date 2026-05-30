/**
 * Cliente HTTP tipado hacia noteflow-api.
 * En dispositivo físico usa EXPO_PUBLIC_API_URL con la IP de tu Mac (no localhost).
 */
import type {
  AnyNote,
  ChecklistItem,
  ChecklistNote,
  IdeaNote,
  Note,
} from '../types';
import { isChecklistNote, isIdeaNote, isNote } from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

/** Payload para crear una nota en la API (tipos alineados con el servidor). */
export type CreateNoteInput = {
  title: string;
  type: 'note' | 'checklist' | 'idea';
  content?: string;
  color?: string;
  tags?: string[];
};

/** Campos actualizables vía PATCH /notes/:id */
export type UpdateNoteInput = {
  title?: string;
  content?: string;
  color?: string;
  is_archived?: boolean;
};

type ApiChecklistItemRow = {
  id: string;
  note_id: string;
  text: string;
  is_completed: boolean;
};

/** Fila devuelta por GET /notes con JOIN (snake_case de PostgreSQL). */
export type ApiNoteRow = {
  id: string;
  title: string;
  content: string | null;
  type: 'note' | 'checklist' | 'idea';
  color: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  items: ApiChecklistItemRow[] | null;
  tags: string[] | null;
};

function parseDate(value: string): Date {
  return new Date(value);
}

function mapChecklistItem(row: ApiChecklistItemRow): ChecklistItem {
  return {
    id: row.id,
    text: row.text,
    isCompleted: row.is_completed,
  };
}

/** Convierte una fila de la API al modelo de la app móvil. */
export function mapApiRowToAnyNote(row: ApiNoteRow): AnyNote {
  const base = {
    id: row.id,
    title: row.title,
    createdAt: parseDate(row.created_at),
    updatedAt: parseDate(row.updated_at),
    isArchived: row.is_archived ?? false,
  };

  if (row.type === 'checklist') {
    return {
      ...base,
      items: (row.items ?? []).map(mapChecklistItem),
    } satisfies ChecklistNote;
  }

  if (row.type === 'idea') {
    return {
      ...base,
      tags: row.tags ?? [],
      color: row.color ?? '#F2F2F5',
    } satisfies IdeaNote;
  }

  return {
    ...base,
    content: row.content ?? '',
  } satisfies Note;
}

/** Separa el array unificado en los tres arrays que usa el store. */
export function splitAnyNotes(all: AnyNote[]): {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
} {
  const notes: Note[] = [];
  const checklists: ChecklistNote[] = [];
  const ideas: IdeaNote[] = [];

  for (const item of all) {
    if (isChecklistNote(item)) checklists.push(item);
    else if (isIdeaNote(item)) ideas.push(item);
    else if (isNote(item)) notes.push(item);
  }

  return { notes, checklists, ideas };
}

async function parseJson<T>(res: Response, fallbackMessage: string): Promise<T> {
  if (!res.ok) {
    throw new Error(fallbackMessage);
  }
  return res.json() as Promise<T>;
}

async function assertOk(res: Response, fallbackMessage: string): Promise<void> {
  if (!res.ok) {
    throw new Error(fallbackMessage);
  }
}

export async function getNotes(): Promise<AnyNote[]> {
  const res = await fetch(`${BASE_URL}/notes`);
  const rows = await parseJson<ApiNoteRow[]>(res, 'Error al cargar notas');
  return rows.map(mapApiRowToAnyNote);
}

export async function createNote(data: CreateNoteInput): Promise<AnyNote> {
  const res = await fetch(`${BASE_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const row = await parseJson<ApiNoteRow>(res, 'Error al crear nota');
  return mapApiRowToAnyNote(row);
}

export async function updateNote(id: string, data: UpdateNoteInput): Promise<AnyNote> {
  const res = await fetch(`${BASE_URL}/notes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const row = await parseJson<ApiNoteRow>(res, 'Error al actualizar nota');
  return mapApiRowToAnyNote(row);
}

export async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/notes/${id}`, { method: 'DELETE' });
  await assertOk(res, 'Error al eliminar nota');
}

export async function getChecklistItems(noteId: string): Promise<ChecklistItem[]> {
  const res = await fetch(`${BASE_URL}/notes/${noteId}/checklist-items`);
  const rows = await parseJson<ApiChecklistItemRow[]>(res, 'Error al cargar ítems');
  return rows.map(mapChecklistItem);
}

export async function createChecklistItem(
  noteId: string,
  text: string,
  isCompleted = false
): Promise<ChecklistItem> {
  const res = await fetch(`${BASE_URL}/notes/${noteId}/checklist-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, is_completed: isCompleted }),
  });
  const row = await parseJson<ApiChecklistItemRow>(res, 'Error al crear ítem');
  return mapChecklistItem(row);
}

export async function updateChecklistItem(
  itemId: string,
  isCompleted: boolean
): Promise<ChecklistItem> {
  const res = await fetch(`${BASE_URL}/checklist-items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_completed: isCompleted }),
  });
  const row = await parseJson<ApiChecklistItemRow>(res, 'Error al actualizar ítem');
  return mapChecklistItem(row);
}

export async function deleteChecklistItem(itemId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/checklist-items/${itemId}`, { method: 'DELETE' });
  await assertOk(res, 'Error al eliminar ítem');
}

/** Crea checklist en la API: nota padre + ítems anidados. */
export async function createChecklistWithItems(
  title: string,
  items: { text: string }[]
): Promise<ChecklistNote> {
  const parent = await createNote({ title, type: 'checklist' });
  if (!isChecklistNote(parent)) {
    throw new Error('Error al crear checklist');
  }

  const createdItems = await Promise.all(
    items.map((item) => createChecklistItem(parent.id, item.text))
  );

  return { ...parent, items: createdItems };
}
