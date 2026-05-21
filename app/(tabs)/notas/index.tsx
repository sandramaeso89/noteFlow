import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedCardWrapper } from '../../../components/items/AnimatedCardWrapper';
import { NoteCard } from '../../../components/items/NoteCard';
import { ListEmptyState } from '../../../components/list/ListEmptyState';
import { ListScreenHeader } from '../../../components/list/ListScreenHeader';
import { spacing } from '../../../constants/theme';
import { useNoteFlowColors } from '../../../hooks/useNoteFlowColors';
import { useNotesStore } from '../../../store/notesStore';
import { filterNotesBySearch, isActiveItem } from '../../../utils/filters';

export default function NotasListScreen() {
  const colors = useNoteFlowColors();
  const notes = useNotesStore((s) => s.notes);
  const [searchQuery, setSearchQuery] = useState('');

  const visibleNotes = useMemo(() => {
    const active = notes.filter(isActiveItem);
    return filterNotesBySearch(active, searchQuery);
  }, [notes, searchQuery]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlashList
        data={visibleNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <ListScreenHeader
            title="Notas"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Buscar notas…"
            onAddPress={() => router.push({ pathname: '/nueva-note', params: { type: 'note' } })}
          />
        }
        ListEmptyComponent={
          <ListEmptyState
            icon="note-text-outline"
            message={
              searchQuery.trim()
                ? `Ningún resultado para «${searchQuery.trim()}». Prueba otro término.`
                : 'Nada en el radar. Captura lo esencial de tu próxima reunión.'
            }
            ctaLabel={searchQuery.trim() ? undefined : 'Crear nota'}
            onCtaPress={
              searchQuery.trim()
                ? undefined
                : () => router.push({ pathname: '/nueva-note', params: { type: 'note' } })
            }
          />
        }
        renderItem={({ item }) => (
          <AnimatedCardWrapper>
            <NoteCard
              note={item}
              onPress={() => router.push(`/notas/${item.id}`)}
            />
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
