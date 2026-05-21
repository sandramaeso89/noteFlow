import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ChecklistNote, IdeaNote, Note } from '../types';
import { storeDateReviver } from '../utils/storeSerialization';
import { seedChecklists, seedIdeas, seedNotes } from './seedData';

interface NotesStore {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
  /** true cuando AsyncStorage ya rehidrató el store (no se persiste). */
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addNote: (note: Note) => void;
  addChecklist: (checklist: ChecklistNote) => void;
  addIdea: (idea: IdeaNote) => void;
  deleteNote: (id: string) => void;
  toggleChecklistItem: (checklistId: string, itemId: string) => void;
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: seedNotes,
      checklists: seedChecklists,
      ideas: seedIdeas,
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
      addChecklist: (checklist) =>
        set((state) => ({ checklists: [...state.checklists, checklist] })),
      addIdea: (idea) => set((state) => ({ ideas: [...state.ideas, idea] })),
      deleteNote: (id) =>
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
      toggleChecklistItem: (checklistId, itemId) =>
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id !== checklistId
              ? c
              : {
                  ...c,
                  items: c.items.map((i) =>
                    i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i
                  ),
                }
          ),
        })),
    }),
    {
      name: 'noteflow-storage',
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: storeDateReviver,
      }),
      // Solo persistir datos; acciones y flag de hidratación quedan en memoria
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
