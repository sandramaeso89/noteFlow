import { create } from 'zustand';

import type { ChecklistNote, IdeaNote, Note } from '../types';
import { seedChecklists, seedIdeas, seedNotes } from './seedData';

interface NotesStore {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
  addNote: (note: Note) => void;
  addChecklist: (checklist: ChecklistNote) => void;
  addIdea: (idea: IdeaNote) => void;
  deleteNote: (id: string) => void;
  toggleChecklistItem: (checklistId: string, itemId: string) => void;
}

export const useNotesStore = create<NotesStore>((set) => ({
  notes: seedNotes,
  checklists: seedChecklists,
  ideas: seedIdeas,
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
}));
