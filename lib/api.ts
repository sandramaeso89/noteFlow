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
const REQUEST_TIMEOUT_MS = 12_000;

/** Token JWT en memoria (cargado desde SecureStore al arrancar). */
let authToken: string | null = null;

export function setApiAuthToken(token: string | null): void {
  authToken = token;
}

export function getApiAuthToken(): string | null {
  return authToken;
}

/** Recupera el JWT de SecureStore si aún no está en memoria. */
export async function ensureApiAuthToken(): Promise<boolean> {
  if (authToken) return true;

  const { getAuthToken } = await import('./authStorage');
  const stored = await getAuthToken();
  if (!stored) return false;

  authToken = stored;
  return true;
}

export class ApiAuthError extends Error {
  constructor(message = 'Sesión expirada') {
    super(message);
    this.name = 'ApiAuthError';
  }
}

/** fetch con tope de tiempo y cabecera Authorization si hay token. */
async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  await ensureApiAuthToken();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });

    if (res.status === 401) {
      authToken = null;
      throw new ApiAuthError();
    }

    return res;
  } catch (error) {
    if (error instanceof ApiAuthError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        'La API no responde. Arranca noteflow-api (npm run dev) y revisa EXPO_PUBLIC_API_URL en .env.'
      );
    }
    throw new Error(
      'No se pudo conectar con la API. Comprueba la red y que noteflow-api esté en marcha.'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

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

  const noteType = row.type?.trim().toLowerCase();

  if (noteType === 'checklist') {
    const rawItems = Array.isArray(row.items) ? row.items : [];
    return {
      ...base,
      items: rawItems.map(mapChecklistItem),
    } satisfies ChecklistNote;
  }

  if (noteType === 'idea') {
    const rawTags = Array.isArray(row.tags)
      ? row.tags.filter((tag): tag is string => typeof tag === 'string')
      : [];
    return {
      ...base,
      tags: rawTags,
      color: row.color ?? '#F2F2F5',
    } satisfies IdeaNote;
  }

  return {
    ...base,
    content: row.content ?? '',
  } satisfies Note;
}

/** Separa filas de la API por columna `type` (más fiable que type guards estructurales). */
export function splitApiRows(rows: ApiNoteRow[]): {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
} {
  const notes: Note[] = [];
  const checklists: ChecklistNote[] = [];
  const ideas: IdeaNote[] = [];

  for (const row of rows) {
    const noteType = row.type?.trim().toLowerCase();
    if (noteType === 'checklist') {
      checklists.push(mapApiRowToAnyNote(row) as ChecklistNote);
    } else if (noteType === 'idea') {
      ideas.push(mapApiRowToAnyNote(row) as IdeaNote);
    } else if (noteType === 'note') {
      notes.push(mapApiRowToAnyNote(row) as Note);
    }
  }

  return { notes, checklists, ideas };
}

/** Separa un array ya mapeado (p. ej. tras POST) usando type guards. */
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
    let detail = fallbackMessage;
    try {
      const body = (await res.json()) as { error?: string };
      if (typeof body.error === 'string') detail = body.error;
    } catch {
      // respuesta no JSON
    }
    if (res.status === 401) {
      authToken = null;
      throw new ApiAuthError();
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

async function assertOk(res: Response, fallbackMessage: string): Promise<void> {
  if (!res.ok) {
    throw new Error(fallbackMessage);
  }
}

async function fetchApiNoteRows(): Promise<ApiNoteRow[]> {
  const res = await apiFetch('/notes');
  return parseJson<ApiNoteRow[]>(res, 'Error al cargar notas');
}

/** Carga y reparte en los tres arrays que usa el store. */
export async function fetchNoteBuckets(): Promise<{
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
}> {
  const rows = await fetchApiNoteRows();
  return splitApiRows(rows);
}

export async function getNotes(): Promise<AnyNote[]> {
  const rows = await fetchApiNoteRows();
  return rows.map(mapApiRowToAnyNote);
}

export async function createNote(data: CreateNoteInput): Promise<AnyNote> {
  const res = await apiFetch('/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const row = await parseJson<ApiNoteRow>(res, 'Error al crear nota');
  return mapApiRowToAnyNote(row);
}

export async function updateNote(id: string, data: UpdateNoteInput): Promise<AnyNote> {
  const res = await apiFetch(`/notes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const row = await parseJson<ApiNoteRow>(res, 'Error al actualizar nota');
  return mapApiRowToAnyNote(row);
}

export async function deleteNote(id: string): Promise<void> {
  const res = await apiFetch(`/notes/${id}`, { method: 'DELETE' });
  await assertOk(res, 'Error al eliminar nota');
}

export async function getChecklistItems(noteId: string): Promise<ChecklistItem[]> {
  const res = await apiFetch(`/notes/${noteId}/checklist-items`);
  const rows = await parseJson<ApiChecklistItemRow[]>(res, 'Error al cargar ítems');
  return rows.map(mapChecklistItem);
}

export async function createChecklistItem(
  noteId: string,
  text: string,
  isCompleted = false
): Promise<ChecklistItem> {
  const res = await apiFetch(`/notes/${noteId}/checklist-items`, {
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
  const res = await apiFetch(`/checklist-items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_completed: isCompleted }),
  });
  const row = await parseJson<ApiChecklistItemRow>(res, 'Error al actualizar ítem');
  return mapChecklistItem(row);
}

export async function deleteChecklistItem(itemId: string): Promise<void> {
  const res = await apiFetch(`/checklist-items/${itemId}`, { method: 'DELETE' });
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
