/**
 * Listado de checklists activas con barra de progreso en tarjeta y búsqueda local.
 */
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedCardWrapper } from '../../../components/items/AnimatedCardWrapper';
import { ChecklistCard } from '../../../components/items/ChecklistCard';
import { ListEmptyState } from '../../../components/list/ListEmptyState';
import { ListScreenHeader } from '../../../components/list/ListScreenHeader';
import { spacing } from '../../../constants/theme';
import { useNoteFlowColors } from '../../../hooks/useNoteFlowColors';
import { useNotesStore } from '../../../store/notesStore';
import { filterChecklistsBySearch, isActiveItem } from '../../../utils/filters';

export default function ChecklistsListScreen() {
  const colors = useNoteFlowColors();
  const checklists = useNotesStore((s) => s.checklists);
  const [searchQuery, setSearchQuery] = useState('');

  // Excluye archivadas y aplica búsqueda en título e ítems de cada checklist.
  const visibleChecklists = useMemo(() => {
    const active = checklists.filter(isActiveItem);
    return filterChecklistsBySearch(active, searchQuery);
  }, [checklists, searchQuery]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlashList
        data={visibleChecklists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <ListScreenHeader
            title="Checklists"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Buscar checklists…"
            onAddPress={() =>
              router.push({ pathname: '/nueva-note', params: { type: 'checklist' } })
            }
          />
        }
        ListEmptyComponent={
          <ListEmptyState
            icon="format-list-checks"
            message={
              searchQuery.trim()
                ? `Ningún resultado para «${searchQuery.trim()}».`
                : 'Organiza tareas post-reunión en una checklist.'
            }
            ctaLabel={searchQuery.trim() ? undefined : 'Crear checklist'}
            onCtaPress={
              searchQuery.trim()
                ? undefined
                : () => router.push({ pathname: '/nueva-note', params: { type: 'checklist' } })
            }
          />
        }
        renderItem={({ item }) => (
          <AnimatedCardWrapper>
            <ChecklistCard
              checklist={item}
              onPress={() => router.push(`/checklists/${item.id}`)}
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
