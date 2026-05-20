import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ChecklistCard } from '../../../components/items/ChecklistCard';
import { ListEmptyState } from '../../../components/list/ListEmptyState';
import { ListScreenHeader } from '../../../components/list/ListScreenHeader';
import { spacing } from '../../../constants/theme';
import { useNoteFlowColors } from '../../../hooks/useNoteFlowColors';
import { useNotesStore } from '../../../store/notesStore';

export default function ChecklistsListScreen() {
  const colors = useNoteFlowColors();
  const checklists = useNotesStore((s) => s.checklists);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlashList
        data={checklists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <ListScreenHeader
            title="Checklists"
            onAddPress={() =>
              router.push({ pathname: '/nueva-note', params: { type: 'checklist' } })
            }
          />
        }
        ListEmptyComponent={
          <ListEmptyState message="Sin listas todavía. Añade una checklist con +." />
        }
        renderItem={({ item }) => (
          <ChecklistCard
            checklist={item}
            onPress={() => router.push(`/checklists/${item.id}`)}
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
