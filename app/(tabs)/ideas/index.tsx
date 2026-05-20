import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { IdeaCard } from '../../../components/items/IdeaCard';
import { ListEmptyState } from '../../../components/list/ListEmptyState';
import { ListScreenHeader } from '../../../components/list/ListScreenHeader';
import { spacing } from '../../../constants/theme';
import { useNoteFlowColors } from '../../../hooks/useNoteFlowColors';
import { useNotesStore } from '../../../store/notesStore';

export default function IdeasListScreen() {
  const colors = useNoteFlowColors();
  const ideas = useNotesStore((s) => s.ideas);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlashList
        data={ideas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <ListScreenHeader
            title="Ideas"
            onAddPress={() => router.push({ pathname: '/nueva-note', params: { type: 'idea' } })}
          />
        }
        ListEmptyComponent={
          <ListEmptyState message="Captura una idea rápida con +." />
        }
        renderItem={({ item }) => (
          <IdeaCard
            idea={item}
            onPress={() => router.push(`/ideas/${item.id}`)}
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
