import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ChecklistNote, IdeaNote, Note } from '../types';
import { storeDateReviver } from '../utils/storeSerialization';
import {
  getInitialChecklists,
  getInitialIdeas,
  getInitialNotes,
} from './seedData';

interface NotesStore {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addNote: (note: Note) => void;
  addChecklist: (checklist: ChecklistNote) => void;
  addIdea: (idea: IdeaNote) => void;
  archiveNote: (id: string) => void;
  archiveChecklist: (id: string) => void;
  archiveIdea: (id: string) => void;
  unarchiveNote: (id: string) => void;
  unarchiveChecklist: (id: string) => void;
  unarchiveIdea: (id: string) => void;
  deleteNote: (id: string) => void;
  deleteChecklist: (id: string) => void;
  deleteIdea: (id: string) => void;
  toggleChecklistItem: (checklistId: string, itemId: string) => void;
}

function touch<T extends { updatedAt: Date }>(item: T): T {
  return { ...item, updatedAt: new Date() };
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: getInitialNotes(),
      checklists: getInitialChecklists(),
      ideas: getInitialIdeas(),
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
      addChecklist: (checklist) =>
        set((state) => ({ checklists: [...state.checklists, checklist] })),
      addIdea: (idea) => set((state) => ({ ideas: [...state.ideas, idea] })),
      archiveNote: (id) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? touch({ ...n, isArchived: true }) : n
          ),
        })),
      archiveChecklist: (id) =>
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === id ? touch({ ...c, isArchived: true }) : c
          ),
        })),
      archiveIdea: (id) =>
        set((state) => ({
          ideas: state.ideas.map((i) =>
            i.id === id ? touch({ ...i, isArchived: true }) : i
          ),
        })),
      unarchiveNote: (id) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? touch({ ...n, isArchived: false }) : n
          ),
        })),
      unarchiveChecklist: (id) =>
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === id ? touch({ ...c, isArchived: false }) : c
          ),
        })),
      unarchiveIdea: (id) =>
        set((state) => ({
          ideas: state.ideas.map((i) =>
            i.id === id ? touch({ ...i, isArchived: false }) : i
          ),
        })),
      deleteNote: (id) =>
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
      deleteChecklist: (id) =>
        set((state) => ({
          checklists: state.checklists.filter((c) => c.id !== id),
        })),
      deleteIdea: (id) =>
        set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) })),
      toggleChecklistItem: (checklistId, itemId) =>
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id !== checklistId
              ? c
              : touch({
                  ...c,
                  items: c.items.map((i) =>
                    i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i
                  ),
                })
          ),
        })),
    }),
    {
      name: 'noteflow-storage',
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: storeDateReviver,
      }),
      partialize: (state) => ({
        notes: state.notes,
        checklists: state.checklists,
        ideas: state.ideas,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error) state?.setHasHydrated(true);
      },
    }
  )
);
