import type { ChecklistNote, IdeaNote, Note } from '../types';

export function isActiveItem<T extends { isArchived?: boolean }>(item: T): boolean {
  return !item.isArchived;
}

export function filterNotesBySearch(notes: Note[], query: string): Note[] {
  const q = query.trim().toLowerCase();
  if (!q) return notes;
  return notes.filter(
    (n) =>
      n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
  );
}

export function filterChecklistsBySearch(
  checklists: ChecklistNote[],
  query: string
): ChecklistNote[] {
  const q = query.trim().toLowerCase();
  if (!q) return checklists;
  return checklists.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.items.some((i) => i.text.toLowerCase().includes(q))
  );
}

export function filterIdeasBySearch(ideas: IdeaNote[], query: string): IdeaNote[] {
  const q = query.trim().toLowerCase();
  if (!q) return ideas;
  return ideas.filter(
    (i) =>
      i.title.toLowerCase().includes(q) ||
      i.tags.some((t) => t.toLowerCase().includes(q))
  );
}
