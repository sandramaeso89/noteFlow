/**
 * Store global de notas (Zustand). API REST si hay JWT; si no, AsyncStorage local.
 */
import { create } from 'zustand';

import {
  createChecklistWithItems,
  createNote,
  deleteNote as deleteNoteApi,
  ensureApiAuthToken,
  fetchNoteBuckets,
  ApiAuthError,
  setApiAuthToken,
  updateChecklistItem,
  updateNote as updateNoteApi,
} from '../lib/api';
import {
  createLocalId,
  loadLocalBuckets,
  saveLocalBuckets,
  type LocalNoteBuckets,
} from '../lib/localNotesRepository';
import type { ChecklistNote, IdeaNote, Note } from '../types';
import type { ChecklistFormValues, IdeaFormValues, NoteFormValues } from '../schemas/noteSchemas';
import { useAuthStore } from './authStore';

interface NotesStore {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
  isLoading: boolean;
  /** Error al cargar desde API (pantalla bloqueante en StoreHydrationGate). */
  loadError: string | null;
  /** Error de operaciones CRUD (no bloquea toda la app). */
  error: string | null;
  fetchNotes: () => Promise<void>;
  /** Recarga desde API sin pantalla de carga global (p. ej. al cambiar de pestaña). */
  refreshNotes: () => Promise<void>;
  addNote: (input: NoteFormValues) => Promise<boolean>;
  addChecklist: (input: ChecklistFormValues) => Promise<boolean>;
  addIdea: (input: IdeaFormValues & { tags: string[] }) => Promise<boolean>;
  archiveNote: (id: string) => Promise<void>;
  archiveNotes: (ids: string[]) => Promise<boolean>;
  archiveChecklist: (id: string) => Promise<void>;
  archiveChecklists: (ids: string[]) => Promise<boolean>;
  archiveIdea: (id: string) => Promise<void>;
  archiveIdeas: (ids: string[]) => Promise<boolean>;
  unarchiveNote: (id: string) => Promise<void>;
  unarchiveChecklist: (id: string) => Promise<void>;
  unarchiveIdea: (id: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  deleteChecklist: (id: string) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  toggleChecklistItem: (checklistId: string, itemId: string) => Promise<void>;
  /** Vacía el store al cerrar sesión (evita ver datos del usuario anterior). */
  resetForLogout: () => void;
  clearError: () => void;
}

function replaceInList<T extends { id: string }>(list: T[], updated: T): T[] {
  return list.map((item) => (item.id === updated.id ? updated : item));
}

function removeFromList<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter((item) => item.id !== id);
}

function getNotesUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

async function persistLocalFromState(buckets: LocalNoteBuckets): Promise<void> {
  const userId = getNotesUserId();
  if (!userId) return;
  await saveLocalBuckets(userId, buckets);
}

async function loadNotesForCurrentUser(): Promise<LocalNoteBuckets> {
  const userId = getNotesUserId();
  if (!userId) {
    return { notes: [], checklists: [], ideas: [] };
  }
  return loadLocalBuckets(userId);
}

/** IDs locales (createLocalId) vs UUID de Neon. */
function isLocalId(id: string): boolean {
  return !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function archiveLocalNote(state: LocalNoteBuckets, id: string, archived: boolean): LocalNoteBuckets | null {
  const note = state.notes.find((n) => n.id === id);
  if (!note) return null;
  const updated = { ...note, isArchived: archived, updatedAt: new Date() };
  return { ...state, notes: replaceInList(state.notes, updated) };
}

function archiveLocalChecklist(
  state: LocalNoteBuckets,
  id: string,
  archived: boolean
): LocalNoteBuckets | null {
  const checklist = state.checklists.find((c) => c.id === id);
  if (!checklist) return null;
  const updated = { ...checklist, isArchived: archived, updatedAt: new Date() };
  return { ...state, checklists: replaceInList(state.checklists, updated) };
}

function archiveLocalIdea(state: LocalNoteBuckets, id: string, archived: boolean): LocalNoteBuckets | null {
  const idea = state.ideas.find((i) => i.id === id);
  if (!idea) return null;
  const updated = { ...idea, isArchived: archived, updatedAt: new Date() };
  return { ...state, ideas: replaceInList(state.ideas, updated) };
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  checklists: [],
  ideas: [],
  isLoading: true,
  loadError: null,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, loadError: null, error: null });

    const hasToken = await ensureApiAuthToken();
    if (!hasToken) {
      const local = await loadNotesForCurrentUser();
      set({ ...local, isLoading: false, loadError: null, error: null });
      return;
    }

    try {
      const { notes, checklists, ideas } = await fetchNoteBuckets();
      set({ notes, checklists, ideas, isLoading: false, loadError: null, error: null });
    } catch (error) {
      if (error instanceof ApiAuthError) {
        const local = await loadNotesForCurrentUser();
        set({ ...local, isLoading: false, loadError: null, error: null });
        return;
      }
      const local = await loadNotesForCurrentUser();
      if (local.notes.length + local.checklists.length + local.ideas.length > 0) {
        set({ ...local, isLoading: false, loadError: null, error: null });
        return;
      }
      const message =
        error instanceof Error ? error.message : 'Error al cargar notas';
      set({ isLoading: false, loadError: message, error: null });
    }
  },

  refreshNotes: async () => {
    const hasToken = await ensureApiAuthToken();
    if (!hasToken) {
      const local = await loadNotesForCurrentUser();
      set({ ...local, loadError: null, error: null });
      return;
    }

    try {
      const { notes, checklists, ideas } = await fetchNoteBuckets();
      set({ notes, checklists, ideas, loadError: null, error: null });
    } catch (error) {
      if (error instanceof ApiAuthError) {
        setApiAuthToken(null);
        const local = await loadNotesForCurrentUser();
        set({ ...local, loadError: null, error: null });
        return;
      }
      const local = await loadNotesForCurrentUser();
      if (local.notes.length + local.checklists.length + local.ideas.length > 0) {
        set({ ...local, loadError: null, error: null });
      }
    }
  },

  addNote: async (input) => {
    set({ error: null });
    const userId = getNotesUserId();
    if (!userId) {
      set({ error: 'Debes iniciar sesión para crear notas' });
      return false;
    }

    const hasToken = await ensureApiAuthToken();
    if (hasToken) {
      try {
        const created = await createNote({
          title: input.title,
          type: 'note',
          content: input.content,
        });
        if ('content' in created) {
          set((state) => ({ notes: [created, ...state.notes] }));
          return true;
        }
      } catch (error) {
        if (error instanceof ApiAuthError) {
          setApiAuthToken(null);
        }
      }
    }

    const now = new Date();
    const created: Note = {
      id: createLocalId('note'),
      title: input.title.trim(),
      content: input.content.trim(),
      createdAt: now,
      updatedAt: now,
      isArchived: false,
    };

    set((state) => {
      const notes = [created, ...state.notes];
      void persistLocalFromState({
        notes,
        checklists: state.checklists,
        ideas: state.ideas,
      });
      return { notes };
    });
    return true;
  },

  addChecklist: async (input) => {
    set({ error: null });
    const userId = getNotesUserId();
    if (!userId) {
      set({ error: 'Debes iniciar sesión para crear checklists' });
      return false;
    }

    const hasToken = await ensureApiAuthToken();
    if (hasToken) {
      try {
        const created = await createChecklistWithItems(input.title, input.items);
        set((state) => ({ checklists: [created, ...state.checklists] }));
        return true;
      } catch (error) {
        if (error instanceof ApiAuthError) {
          setApiAuthToken(null);
        }
      }
    }

    const now = new Date();
    const created: ChecklistNote = {
      id: createLocalId('checklist'),
      title: input.title.trim(),
      createdAt: now,
      updatedAt: now,
      isArchived: false,
      items: input.items.map((item) => ({
        id: createLocalId('item'),
        text: item.text.trim(),
        isCompleted: false,
      })),
    };

    set((state) => {
      const checklists = [created, ...state.checklists];
      void persistLocalFromState({
        notes: state.notes,
        checklists,
        ideas: state.ideas,
      });
      return { checklists };
    });
    return true;
  },

  addIdea: async (input) => {
    set({ error: null });
    const userId = getNotesUserId();
    if (!userId) {
      set({ error: 'Debes iniciar sesión para crear ideas' });
      return false;
    }

    const hasToken = await ensureApiAuthToken();
    if (hasToken) {
      try {
        const created = await createNote({
          title: input.title,
          type: 'idea',
          color: input.color,
          tags: input.tags,
        });
        if ('tags' in created) {
          set((state) => ({ ideas: [created, ...state.ideas] }));
          return true;
        }
      } catch (error) {
        if (error instanceof ApiAuthError) {
          setApiAuthToken(null);
        }
      }
    }

    const now = new Date();
    const created: IdeaNote = {
      id: createLocalId('idea'),
      title: input.title.trim(),
      tags: input.tags,
      color: input.color,
      createdAt: now,
      updatedAt: now,
      isArchived: false,
    };

    set((state) => {
      const ideas = [created, ...state.ideas];
      void persistLocalFromState({
        notes: state.notes,
        checklists: state.checklists,
        ideas,
      });
      return { ideas };
    });
    return true;
  },

  archiveNote: async (id) => {
    set({ error: null });

    const hasToken = await ensureApiAuthToken();
    if (hasToken && !isLocalId(id)) {
      try {
        const updated = await updateNoteApi(id, { is_archived: true });
        if ('content' in updated) {
          set((state) => ({ notes: replaceInList(state.notes, updated) }));
          return;
        }
      } catch (error) {
        if (error instanceof ApiAuthError) setApiAuthToken(null);
      }
    }

    set((state) => {
      const buckets = archiveLocalNote(
        { notes: state.notes, checklists: state.checklists, ideas: state.ideas },
        id,
        true
      );
      if (!buckets) return state;
      void persistLocalFromState(buckets);
      return buckets;
    });
  },

  archiveNotes: async (ids) => {
    if (ids.length === 0) return false;
    set({ error: null });

    let successCount = 0;
    const hasToken = await ensureApiAuthToken();

    for (const id of ids) {
      if (hasToken && !isLocalId(id)) {
        try {
          const updated = await updateNoteApi(id, { is_archived: true });
          if ('content' in updated) {
            set((state) => ({ notes: replaceInList(state.notes, updated) }));
            successCount += 1;
            continue;
          }
        } catch (error) {
          if (error instanceof ApiAuthError) setApiAuthToken(null);
        }
      }

      const state = get();
      const buckets = archiveLocalNote(
        { notes: state.notes, checklists: state.checklists, ideas: state.ideas },
        id,
        true
      );
      if (buckets) {
        set(buckets);
        void persistLocalFromState(buckets);
        successCount += 1;
      }
    }

    if (successCount === 0) {
      set({ error: 'Error al archivar notas' });
      return false;
    }
    if (successCount < ids.length) {
      set({ error: 'No se pudieron archivar todas las notas' });
      return false;
    }
    return true;
  },

  archiveChecklist: async (id) => {
    set({ error: null });

    const hasToken = await ensureApiAuthToken();
    if (hasToken && !isLocalId(id)) {
      try {
        const updated = await updateNoteApi(id, { is_archived: true });
        if ('items' in updated) {
          set((state) => ({ checklists: replaceInList(state.checklists, updated) }));
          return;
        }
      } catch (error) {
        if (error instanceof ApiAuthError) setApiAuthToken(null);
      }
    }

    set((state) => {
      const buckets = archiveLocalChecklist(
        { notes: state.notes, checklists: state.checklists, ideas: state.ideas },
        id,
        true
      );
      if (!buckets) return state;
      void persistLocalFromState(buckets);
      return buckets;
    });
  },

  archiveChecklists: async (ids) => {
    if (ids.length === 0) return false;
    set({ error: null });

    let successCount = 0;
    const hasToken = await ensureApiAuthToken();

    for (const id of ids) {
      if (hasToken && !isLocalId(id)) {
        try {
          const updated = await updateNoteApi(id, { is_archived: true });
          if ('items' in updated) {
            set((state) => ({ checklists: replaceInList(state.checklists, updated) }));
            successCount += 1;
            continue;
          }
        } catch (error) {
          if (error instanceof ApiAuthError) setApiAuthToken(null);
        }
      }

      const state = get();
      const buckets = archiveLocalChecklist(
        { notes: state.notes, checklists: state.checklists, ideas: state.ideas },
        id,
        true
      );
      if (buckets) {
        set(buckets);
        void persistLocalFromState(buckets);
        successCount += 1;
      }
    }

    if (successCount === 0) {
      set({ error: 'Error al archivar checklists' });
      return false;
    }
    if (successCount < ids.length) {
      set({ error: 'No se pudieron archivar todas las checklists' });
      return false;
    }
    return true;
  },

  archiveIdea: async (id) => {
    set({ error: null });

    const hasToken = await ensureApiAuthToken();
    if (hasToken && !isLocalId(id)) {
      try {
        const updated = await updateNoteApi(id, { is_archived: true });
        if ('tags' in updated) {
          set((state) => ({ ideas: replaceInList(state.ideas, updated) }));
          return;
        }
      } catch (error) {
        if (error instanceof ApiAuthError) setApiAuthToken(null);
      }
    }

    set((state) => {
      const buckets = archiveLocalIdea(
        { notes: state.notes, checklists: state.checklists, ideas: state.ideas },
        id,
        true
      );
      if (!buckets) return state;
      void persistLocalFromState(buckets);
      return buckets;
    });
  },

  archiveIdeas: async (ids) => {
    if (ids.length === 0) return false;
    set({ error: null });

    let successCount = 0;
    const hasToken = await ensureApiAuthToken();

    for (const id of ids) {
      if (hasToken && !isLocalId(id)) {
        try {
          const updated = await updateNoteApi(id, { is_archived: true });
          if ('tags' in updated) {
            set((state) => ({ ideas: replaceInList(state.ideas, updated) }));
            successCount += 1;
            continue;
          }
        } catch (error) {
          if (error instanceof ApiAuthError) setApiAuthToken(null);
        }
      }

      const state = get();
      const buckets = archiveLocalIdea(
        { notes: state.notes, checklists: state.checklists, ideas: state.ideas },
        id,
        true
      );
      if (buckets) {
        set(buckets);
        void persistLocalFromState(buckets);
        successCount += 1;
      }
    }

    if (successCount === 0) {
      set({ error: 'Error al archivar ideas' });
      return false;
    }
    if (successCount < ids.length) {
      set({ error: 'No se pudieron archivar todas las ideas' });
      return false;
    }
    return true;
  },

  unarchiveNote: async (id) => {
    set({ error: null });

    const hasToken = await ensureApiAuthToken();
    if (hasToken && !isLocalId(id)) {
      try {
        const updated = await updateNoteApi(id, { is_archived: false });
        if ('content' in updated) {
          set((state) => ({ notes: replaceInList(state.notes, updated) }));
          return;
        }
      } catch (error) {
        if (error instanceof ApiAuthError) setApiAuthToken(null);
      }
    }

    set((state) => {
      const buckets = archiveLocalNote(
        { notes: state.notes, checklists: state.checklists, ideas: state.ideas },
        id,
        false
      );
      if (!buckets) return state;
      void persistLocalFromState(buckets);
      return buckets;
    });
  },

  unarchiveChecklist: async (id) => {
    set({ error: null });

    const hasToken = await ensureApiAuthToken();
    if (hasToken && !isLocalId(id)) {
      try {
        const updated = await updateNoteApi(id, { is_archived: false });
        if ('items' in updated) {
          set((state) => ({ checklists: replaceInList(state.checklists, updated) }));
          return;
        }
      } catch (error) {
        if (error instanceof ApiAuthError) setApiAuthToken(null);
      }
    }

    set((state) => {
      const buckets = archiveLocalChecklist(
        { notes: state.notes, checklists: state.checklists, ideas: state.ideas },
        id,
        false
      );
      if (!buckets) return state;
      void persistLocalFromState(buckets);
      return buckets;
    });
  },

  unarchiveIdea: async (id) => {
    set({ error: null });

    const hasToken = await ensureApiAuthToken();
    if (hasToken && !isLocalId(id)) {
      try {
        const updated = await updateNoteApi(id, { is_archived: false });
        if ('tags' in updated) {
          set((state) => ({ ideas: replaceInList(state.ideas, updated) }));
          return;
        }
      } catch (error) {
        if (error instanceof ApiAuthError) setApiAuthToken(null);
      }
    }

    set((state) => {
      const buckets = archiveLocalIdea(
        { notes: state.notes, checklists: state.checklists, ideas: state.ideas },
        id,
        false
      );
      if (!buckets) return state;
      void persistLocalFromState(buckets);
      return buckets;
    });
  },

  deleteNote: async (id) => {
    set({ error: null });

    const hasToken = await ensureApiAuthToken();
    if (hasToken && !isLocalId(id)) {
      try {
        await deleteNoteApi(id);
        set((state) => ({ notes: removeFromList(state.notes, id) }));
        return;
      } catch (error) {
        if (error instanceof ApiAuthError) setApiAuthToken(null);
      }
    }

    set((state) => {
      const notes = removeFromList(state.notes, id);
      void persistLocalFromState({
        notes,
        checklists: state.checklists,
        ideas: state.ideas,
      });
      return { notes };
    });
  },

  deleteChecklist: async (id) => {
    set({ error: null });

    const hasToken = await ensureApiAuthToken();
    if (hasToken && !isLocalId(id)) {
      try {
        await deleteNoteApi(id);
        set((state) => ({ checklists: removeFromList(state.checklists, id) }));
        return;
      } catch (error) {
        if (error instanceof ApiAuthError) setApiAuthToken(null);
      }
    }

    set((state) => {
      const checklists = removeFromList(state.checklists, id);
      void persistLocalFromState({
        notes: state.notes,
        checklists,
        ideas: state.ideas,
      });
      return { checklists };
    });
  },

  deleteIdea: async (id) => {
    set({ error: null });

    const hasToken = await ensureApiAuthToken();
    if (hasToken && !isLocalId(id)) {
      try {
        await deleteNoteApi(id);
        set((state) => ({ ideas: removeFromList(state.ideas, id) }));
        return;
      } catch (error) {
        if (error instanceof ApiAuthError) setApiAuthToken(null);
      }
    }

    set((state) => {
      const ideas = removeFromList(state.ideas, id);
      void persistLocalFromState({
        notes: state.notes,
        checklists: state.checklists,
        ideas,
      });
      return { ideas };
    });
  },

  toggleChecklistItem: async (checklistId, itemId) => {
    const checklist = get().checklists.find((c) => c.id === checklistId);
    const item = checklist?.items.find((i) => i.id === itemId);
    if (!item) return;

    const nextCompleted = !item.isCompleted;
    const previousChecklists = get().checklists;

    // Optimista: la UI responde al instante; la API confirma en segundo plano.
    set((state) => ({
      error: null,
      checklists: state.checklists.map((c) =>
        c.id !== checklistId
          ? c
          : {
              ...c,
              updatedAt: new Date(),
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, isCompleted: nextCompleted } : i
              ),
            }
      ),
    }));

    try {
      if (!(await ensureApiAuthToken()) || isLocalId(checklistId) || isLocalId(itemId)) {
        throw new Error('local');
      }
      await updateChecklistItem(itemId, nextCompleted);
      const state = get();
      void persistLocalFromState({
        notes: state.notes,
        checklists: state.checklists,
        ideas: state.ideas,
      });
    } catch (error) {
      if (error instanceof ApiAuthError) {
        setApiAuthToken(null);
      }
      const state = get();
      void persistLocalFromState({
        notes: state.notes,
        checklists: state.checklists,
        ideas: state.ideas,
      });
      if (error instanceof Error && error.message !== 'local') {
        set({ checklists: previousChecklists, error: 'Error al actualizar ítem' });
      }
    }
  },

  resetForLogout: () => {
    set({
      notes: [],
      checklists: [],
      ideas: [],
      isLoading: false,
      loadError: null,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
