/**
 * Listado de ideas activas (no archivadas) con búsqueda por título y etiquetas.
 */
import { FlashList } from '@shopify/flash-list';
import { Stack, router, useFocusEffect } from 'expo-router';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedCardWrapper } from '../../../components/items/AnimatedCardWrapper';
import { IdeaCard } from '../../../components/items/IdeaCard';
import { SwipeableCard } from '../../../components/items/SwipeableCard';
import { BulkArchiveBar } from '../../../components/list/BulkArchiveBar';
import { ListEmptyState } from '../../../components/list/ListEmptyState';
import { SwipeHintBanner } from '../../../components/list/SwipeHintBanner';
import { ListScreenFrame } from '../../../components/list/ListScreenFrame';
import { ListScreenHeader } from '../../../components/list/ListScreenHeader';
import { ListSelectionHeader } from '../../../components/list/ListSelectionHeader';
import { spacing } from '../../../constants/theme';
import { useNoteFlowColors } from '../../../hooks/useNoteFlowColors';
import { useNotesStore } from '../../../store/notesStore';
import { confirmBulkArchive } from '../../../utils/confirmActions';
import { filterIdeasBySearch, isActiveItem } from '../../../utils/filters';
import { hapticImpactLight } from '../../../utils/haptics';

export default function IdeasListScreen() {
  const colors = useNoteFlowColors();
  const ideas = useNotesStore((s) => s.ideas);
  const archiveIdeas = useNotesStore((s) => s.archiveIdeas);
  const deleteIdea = useNotesStore((s) => s.deleteIdea);
  const refreshNotes = useNotesStore((s) => s.refreshNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isArchiving, setIsArchiving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refreshNotes();
    }, [refreshNotes])
  );

  // Solo ideas visibles en esta pestaña; el filtro de búsqueda es adicional.
  const visibleIdeas = useMemo(() => {
    const active = ideas.filter(isActiveItem);
    return filterIdeasBySearch(active, searchQuery);
  }, [ideas, searchQuery]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds([]);
  }, []);

  const enterSelectionMode = useCallback((initialId?: string) => {
    setSelectionMode(true);
    setSelectedIds(initialId ? [initialId] : []);
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }, []);

  const handleBulkArchive = useCallback(() => {
    if (selectedIds.length === 0) return;

    confirmBulkArchive(selectedIds.length, 'idea', 'ideas', () => {
      void (async () => {
        setIsArchiving(true);
        const ok = await archiveIdeas(selectedIds);
        setIsArchiving(false);
        if (ok) exitSelectionMode();
      })();
    });
  }, [archiveIdeas, exitSelectionMode, selectedIds]);

  const listPaddingBottom = spacing.xxl + (selectionMode ? 88 : 0);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ListScreenFrame backgroundColor={colors.background}>
        <View style={styles.container}>
          <FlashList
            style={styles.list}
            data={visibleIdeas}
            keyExtractor={(item) => item.id}
            extraData={{ selectionMode, selectedIds }}
            contentContainerStyle={
              visibleIdeas.length === 0
                ? [styles.listContent, styles.listContentEmpty, { paddingBottom: listPaddingBottom }]
                : [styles.listContent, { paddingBottom: listPaddingBottom }]
            }
            ListHeaderComponent={
              selectionMode ? (
                <ListSelectionHeader
                  selectedCount={selectedIds.length}
                  onCancel={exitSelectionMode}
                  emptyHint="Selecciona ideas"
                />
              ) : (
                <Fragment>
                  <ListScreenHeader
                    title="Ideas"
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Buscar ideas…"
                    onAddPress={() => router.push({ pathname: '/nueva-note', params: { type: 'idea' } })}
                    onSelectPress={
                      visibleIdeas.length > 0 ? () => enterSelectionMode() : undefined
                    }
                  />
                  <SwipeHintBanner visible={visibleIdeas.length > 0} />
                </Fragment>
              )
            }
            ListEmptyComponent={
              <ListEmptyState
                icon="lightbulb-outline"
                message={
                  searchQuery.trim()
                    ? `Ningún resultado para «${searchQuery.trim()}».`
                    : 'Guarda ideas sueltas antes de que se pierdan.'
                }
                hint={
                  searchQuery.trim()
                    ? undefined
                    : 'Cuando tengas ideas, desliza una tarjeta a la izquierda para eliminarla definitivamente (no archiva).'
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
                <SwipeableCard
                  enabled={!selectionMode}
                  itemTitle={item.title}
                  onConfirmDelete={() => {
                    void deleteIdea(item.id);
                  }}
                >
                  <IdeaCard
                    idea={item}
                    selectionMode={selectionMode}
                    selected={selectedSet.has(item.id)}
                    onPress={
                      selectionMode
                        ? () => toggleSelection(item.id)
                        : () => router.push(`/ideas/${item.id}`)
                    }
                    onLongPress={
                      selectionMode
                        ? undefined
                        : () => {
                            void hapticImpactLight();
                            enterSelectionMode(item.id);
                          }
                    }
                  />
                </SwipeableCard>
              </AnimatedCardWrapper>
            )}
          />
          {selectionMode ? (
            <BulkArchiveBar
              selectedCount={selectedIds.length}
              onArchive={handleBulkArchive}
              isArchiving={isArchiving}
            />
          ) : null}
        </View>
      </ListScreenFrame>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
});
