import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedCardWrapper } from '../../../components/items/AnimatedCardWrapper';
import { IdeaCard } from '../../../components/items/IdeaCard';
import { ListEmptyState } from '../../../components/list/ListEmptyState';
import { ListScreenHeader } from '../../../components/list/ListScreenHeader';
import { spacing } from '../../../constants/theme';
import { useNoteFlowColors } from '../../../hooks/useNoteFlowColors';
import { useNotesStore } from '../../../store/notesStore';
import { filterIdeasBySearch, isActiveItem } from '../../../utils/filters';

export default function IdeasListScreen() {
  const colors = useNoteFlowColors();
  const ideas = useNotesStore((s) => s.ideas);
  const [searchQuery, setSearchQuery] = useState('');

  const visibleIdeas = useMemo(() => {
    const active = ideas.filter(isActiveItem);
    return filterIdeasBySearch(active, searchQuery);
  }, [ideas, searchQuery]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlashList
        data={visibleIdeas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <ListScreenHeader
            title="Ideas"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Buscar ideas…"
            onAddPress={() => router.push({ pathname: '/nueva-note', params: { type: 'idea' } })}
          />
        }
        ListEmptyComponent={
          <ListEmptyState
            icon="lightbulb-outline"
            message={
              searchQuery.trim()
                ? `Ningún resultado para «${searchQuery.trim()}».`
                : 'Guarda ideas sueltas antes de que se pierdan.'
            }
            ctaLabel={searchQuery.trim() ? undefined : 'Capturar idea'}
            onCtaPress={
              searchQuery.trim()
                ? undefined
                : () => router.push({ pathname: '/nueva-note', params: { type: 'idea' } })
            }
          />
        }
        renderItem={({ item }) => (
          <AnimatedCardWrapper>
            <IdeaCard
              idea={item}
              onPress={() => router.push(`/ideas/${item.id}`)}
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
