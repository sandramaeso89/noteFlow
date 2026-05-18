import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ListEmptyState } from '../../../components/list/ListEmptyState';
import { ListScreenHeader } from '../../../components/list/ListScreenHeader';
import { NoteCard } from '../../../components/items/NoteCard';
import { spacing } from '../../../constants/theme';
import { useNoteFlowColors } from '../../../hooks/useNoteFlowColors';
import { useNotesStore } from '../../../store/notesStore';

export default function NotasListScreen() {
  const colors = useNoteFlowColors();
  const notes = useNotesStore((s) => s.notes);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlashList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <ListScreenHeader
            title="Notas"
            onAddPress={() => router.push('/nueva-note')}
          />
        }
        ListEmptyComponent={
          <ListEmptyState message="Nada en el radar. Crea tu primera nota con +." />
        }
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            onPress={() => router.push(`/notas/${item.id}`)}
          />
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
