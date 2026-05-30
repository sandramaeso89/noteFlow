/**
 * Listado de contenido archivado (notas, checklists e ideas mezcladas).
 * Ordena por fecha de actualización y permite búsqueda transversal por tipo.
 */
import { FlashList } from '@shopify/flash-list';
import { Stack, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { AnimatedCardWrapper } from '../../../components/items/AnimatedCardWrapper';
import { ChecklistCard } from '../../../components/items/ChecklistCard';
import { IdeaCard } from '../../../components/items/IdeaCard';
import { NoteCard } from '../../../components/items/NoteCard';
import { ListEmptyState } from '../../../components/list/ListEmptyState';
import { ListScreenFrame } from '../../../components/list/ListScreenFrame';
import { ListScreenHeader } from '../../../components/list/ListScreenHeader';
import { spacing } from '../../../constants/theme';
import { useNoteFlowColors } from '../../../hooks/useNoteFlowColors';
import { useNotesStore } from '../../../store/notesStore';
import type { ChecklistNote, IdeaNote, Note } from '../../../types';

// Discriminated union: permite renderizar la tarjeta correcta según el tipo archivado.
type ArchivedRow =
  | { kind: 'note'; item: Note }
  | { kind: 'checklist'; item: ChecklistNote }
  | { kind: 'idea'; item: IdeaNote };

// Búsqueda local: campos distintos según si es nota, checklist o idea.
function matchesSearch(row: ArchivedRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (row.kind === 'note') {
    return (
      row.item.title.toLowerCase().includes(q) ||
      row.item.content.toLowerCase().includes(q)
    );
  }
  if (row.kind === 'checklist') {
    return (
      row.item.title.toLowerCase().includes(q) ||
      row.item.items.some((i) => i.text.toLowerCase().includes(q))
    );
  }
  return (
    row.item.title.toLowerCase().includes(q) ||
    row.item.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export default function ArchivadasListScreen() {
  const colors = useNoteFlowColors();
  const notes = useNotesStore((s) => s.notes);
  const checklists = useNotesStore((s) => s.checklists);
  const ideas = useNotesStore((s) => s.ideas);
  const [searchQuery, setSearchQuery] = useState('');

  // Mezcla los tres arrays, ordena por updatedAt y aplica filtro de búsqueda.
  const archivedRows = useMemo(() => {
    const rows: ArchivedRow[] = [
      ...notes.filter((n) => n.isArchived).map((item) => ({ kind: 'note' as const, item })),
      ...checklists
        .filter((c) => c.isArchived)
        .map((item) => ({ kind: 'checklist' as const, item })),
      ...ideas.filter((i) => i.isArchived).map((item) => ({ kind: 'idea' as const, item })),
    ];
    rows.sort((a, b) => b.item.updatedAt.getTime() - a.item.updatedAt.getTime());
    return rows.filter((row) => matchesSearch(row, searchQuery));
  }, [notes, checklists, ideas, searchQuery]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ListScreenFrame backgroundColor={colors.background}>
      <FlashList
        style={styles.list}
        data={archivedRows}
        keyExtractor={(row) => `${row.kind}-${row.item.id}`}
        contentContainerStyle={
          archivedRows.length === 0
            ? [styles.listContent, styles.listContentEmpty]
            : styles.listContent
        }
        ListHeaderComponent={
          <ListScreenHeader
            title="Archivadas"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Buscar archivadas…"
            onAddPress={() => router.push('/nueva-note')}
          />
        }
        ListEmptyComponent={
          <ListEmptyState
            icon="archive-outline"
            message="No hay contenido archivado. Usa el menú ⋯ en el detalle de un ítem."
          />
        }
        renderItem={({ item: row }) => (
          <AnimatedCardWrapper>
            {row.kind === 'note' ? (
              <NoteCard
                note={row.item}
                onPress={() => router.push(`/notas/${row.item.id}`)}
              />
            ) : null}
            {row.kind === 'checklist' ? (
              <ChecklistCard
                checklist={row.item}
                onPress={() => router.push(`/checklists/${row.item.id}`)}
              />
            ) : null}
            {row.kind === 'idea' ? (
              <IdeaCard
                idea={row.item}
                onPress={() => router.push(`/ideas/${row.item.id}`)}
              />
            ) : null}
          </AnimatedCardWrapper>
        )}
      />
      </ListScreenFrame>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
});
