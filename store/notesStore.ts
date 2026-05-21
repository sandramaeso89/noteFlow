/**
 * Store global de notas (Zustand) con persistencia en AsyncStorage.
 * Centraliza CRUD, archivo y toggle de ítems de checklist para toda la app.
 */
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

// Actualiza updatedAt al archivar, restaurar o marcar ítems (orden en listados).
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
      // Archivar: oculta de pestañas activas pero conserva en AsyncStorage y tab Archivo.
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
      // Restaurar: vuelve a aparecer en su pestaña original.
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
      // Borrado definitivo: solo desde ítems ya archivados (sin papelera intermedia).
      deleteNote: (id) =>
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
      deleteChecklist: (id) =>
        set((state) => ({
          checklists: state.checklists.filter((c) => c.id !== id),
        })),
      deleteIdea: (id) =>
        set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) })),
      // Invierte isCompleted del ítem y actualiza updatedAt de la checklist padre.
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
      // Solo persistimos datos de negocio; flags internos como _hasHydrated quedan en memoria.
      partialize: (state) => ({
        notes: state.notes,
        checklists: state.checklists,
        ideas: state.ideas,
      }),
      // Marca hidratación completa para que StoreHydrationGate libere la UI.
      onRehydrateStorage: () => (state, error) => {
        if (!error) state?.setHasHydrated(true);
      },
    }
  )
);
