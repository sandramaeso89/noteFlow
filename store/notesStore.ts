/**
 * Store global de notas (Zustand). Fuente de verdad: API REST (noteflow-api).
 */
import { create } from 'zustand';

import {
  createChecklistWithItems,
  createNote,
  deleteNote as deleteNoteApi,
  getNotes,
  splitAnyNotes,
  updateChecklistItem,
  updateNote as updateNoteApi,
} from '../lib/api';
import type { ChecklistNote, IdeaNote, Note } from '../types';
import type { ChecklistFormValues, IdeaFormValues, NoteFormValues } from '../schemas/noteSchemas';

interface NotesStore {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
  isLoading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
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
}

function replaceInList<T extends { id: string }>(list: T[], updated: T): T[] {
  return list.map((item) => (item.id === updated.id ? updated : item));
}

function removeFromList<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter((item) => item.id !== id);
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  checklists: [],
  ideas: [],
  isLoading: true,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const all = await getNotes();
      const { notes, checklists, ideas } = splitAnyNotes(all);
      set({ notes, checklists, ideas, isLoading: false, error: null });
    } catch {
      set({ isLoading: false, error: 'Error al cargar notas' });
    }
  },

  addNote: async (input) => {
    set({ error: null });
    try {
      const created = await createNote({
        title: input.title,
        type: 'note',
        content: input.content,
      });
      if (!('content' in created)) {
        set({ error: 'Error al crear nota' });
        return false;
      }
      set((state) => ({ notes: [created, ...state.notes] }));
      return true;
    } catch {
      set({ error: 'Error al crear nota' });
      return false;
    }
  },

  addChecklist: async (input) => {
    set({ error: null });
    try {
      const created = await createChecklistWithItems(input.title, input.items);
      set((state) => ({ checklists: [created, ...state.checklists] }));
      return true;
    } catch {
      set({ error: 'Error al crear checklist' });
      return false;
    }
  },

  addIdea: async (input) => {
    set({ error: null });
    try {
      const created = await createNote({
        title: input.title,
        type: 'idea',
        color: input.color,
        tags: input.tags,
      });
      if (!('tags' in created)) {
        set({ error: 'Error al crear idea' });
        return false;
      }
      set((state) => ({ ideas: [created, ...state.ideas] }));
      return true;
    } catch {
      set({ error: 'Error al crear idea' });
      return false;
    }
  },

  archiveNote: async (id) => {
    set({ error: null });
    try {
      const updated = await updateNoteApi(id, { is_archived: true });
      if (!('content' in updated)) return;
      set((state) => ({ notes: replaceInList(state.notes, updated) }));
    } catch {
      set({ error: 'Error al archivar nota' });
    }
  },

  archiveNotes: async (ids) => {
    if (ids.length === 0) return false;
    set({ error: null });

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const updated = await updateNoteApi(id, { is_archived: true });
          return 'content' in updated ? updated : null;
        } catch {
          return null;
        }
      })
    );

    const updatedNotes = results.filter((note): note is Note => note !== null);
    if (updatedNotes.length === 0) {
      set({ error: 'Error al archivar notas' });
      return false;
    }

    set((state) => {
      let notes = state.notes;
      for (const updated of updatedNotes) {
        notes = replaceInList(notes, updated);
      }
      return { notes };
    });

    if (updatedNotes.length < ids.length) {
      set({ error: 'No se pudieron archivar todas las notas' });
      return false;
    }

    return true;
  },

  archiveChecklist: async (id) => {
    set({ error: null });
    try {
      const updated = await updateNoteApi(id, { is_archived: true });
      if (!('items' in updated)) return;
      set((state) => ({ checklists: replaceInList(state.checklists, updated) }));
    } catch {
      set({ error: 'Error al archivar checklist' });
    }
  },

  archiveChecklists: async (ids) => {
    if (ids.length === 0) return false;
    set({ error: null });

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const updated = await updateNoteApi(id, { is_archived: true });
          return 'items' in updated ? updated : null;
        } catch {
          return null;
        }
      })
    );

    const updatedChecklists = results.filter(
      (item): item is ChecklistNote => item !== null
    );
    if (updatedChecklists.length === 0) {
      set({ error: 'Error al archivar checklists' });
      return false;
    }

    set((state) => {
      let checklists = state.checklists;
      for (const updated of updatedChecklists) {
        checklists = replaceInList(checklists, updated);
      }
      return { checklists };
    });

    if (updatedChecklists.length < ids.length) {
      set({ error: 'No se pudieron archivar todas las checklists' });
      return false;
    }

    return true;
  },

  archiveIdea: async (id) => {
    set({ error: null });
    try {
      const updated = await updateNoteApi(id, { is_archived: true });
      if (!('tags' in updated)) return;
      set((state) => ({ ideas: replaceInList(state.ideas, updated) }));
    } catch {
      set({ error: 'Error al archivar idea' });
    }
  },

  archiveIdeas: async (ids) => {
    if (ids.length === 0) return false;
    set({ error: null });

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const updated = await updateNoteApi(id, { is_archived: true });
          return 'tags' in updated ? updated : null;
        } catch {
          return null;
        }
      })
    );

    const updatedIdeas = results.filter((item): item is IdeaNote => item !== null);
    if (updatedIdeas.length === 0) {
      set({ error: 'Error al archivar ideas' });
      return false;
    }

    set((state) => {
      let ideas = state.ideas;
      for (const updated of updatedIdeas) {
        ideas = replaceInList(ideas, updated);
      }
      return { ideas };
    });

    if (updatedIdeas.length < ids.length) {
      set({ error: 'No se pudieron archivar todas las ideas' });
      return false;
    }

    return true;
  },

  unarchiveNote: async (id) => {
    set({ error: null });
    try {
      const updated = await updateNoteApi(id, { is_archived: false });
      if (!('content' in updated)) return;
      set((state) => ({ notes: replaceInList(state.notes, updated) }));
    } catch {
      set({ error: 'Error al restaurar nota' });
    }
  },

  unarchiveChecklist: async (id) => {
    set({ error: null });
    try {
      const updated = await updateNoteApi(id, { is_archived: false });
      if (!('items' in updated)) return;
      set((state) => ({ checklists: replaceInList(state.checklists, updated) }));
    } catch {
      set({ error: 'Error al restaurar checklist' });
    }
  },

  unarchiveIdea: async (id) => {
    set({ error: null });
    try {
      const updated = await updateNoteApi(id, { is_archived: false });
      if (!('tags' in updated)) return;
      set((state) => ({ ideas: replaceInList(state.ideas, updated) }));
    } catch {
      set({ error: 'Error al restaurar idea' });
    }
  },

  deleteNote: async (id) => {
    set({ error: null });
    try {
      await deleteNoteApi(id);
      set((state) => ({ notes: removeFromList(state.notes, id) }));
    } catch {
      set({ error: 'Error al eliminar nota' });
    }
  },

  deleteChecklist: async (id) => {
    set({ error: null });
    try {
      await deleteNoteApi(id);
      set((state) => ({ checklists: removeFromList(state.checklists, id) }));
    } catch {
      set({ error: 'Error al eliminar checklist' });
    }
  },

  deleteIdea: async (id) => {
    set({ error: null });
    try {
      await deleteNoteApi(id);
      set((state) => ({ ideas: removeFromList(state.ideas, id) }));
    } catch {
      set({ error: 'Error al eliminar idea' });
    }
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
      await updateChecklistItem(itemId, nextCompleted);
    } catch {
      set({ checklists: previousChecklists, error: 'Error al actualizar ítem' });
    }
  },
}));
