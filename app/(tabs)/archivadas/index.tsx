import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedCardWrapper } from '../../../components/items/AnimatedCardWrapper';
import { ChecklistCard } from '../../../components/items/ChecklistCard';
import { IdeaCard } from '../../../components/items/IdeaCard';
import { NoteCard } from '../../../components/items/NoteCard';
import { ListEmptyState } from '../../../components/list/ListEmptyState';
import { ListScreenHeader } from '../../../components/list/ListScreenHeader';
import { spacing } from '../../../constants/theme';
import { useNoteFlowColors } from '../../../hooks/useNoteFlowColors';
import { useNotesStore } from '../../../store/notesStore';
import type { ChecklistNote, IdeaNote, Note } from '../../../types';

type ArchivedRow =
  | { kind: 'note'; item: Note }
  | { kind: 'checklist'; item: ChecklistNote }
  | { kind: 'idea'; item: IdeaNote };

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
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlashList
        data={archivedRows}
        keyExtractor={(row) => `${row.kind}-${row.item.id}`}
        contentContainerStyle={styles.listContent}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
