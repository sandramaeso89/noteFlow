/**
 * Listado de checklists activas con barra de progreso en tarjeta y búsqueda local.
 */
import { FlashList } from '@shopify/flash-list';
import { Stack, router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedCardWrapper } from '../../../components/items/AnimatedCardWrapper';
import { ChecklistCard } from '../../../components/items/ChecklistCard';
import { BulkArchiveBar } from '../../../components/list/BulkArchiveBar';
import { ListEmptyState } from '../../../components/list/ListEmptyState';
import { ListScreenFrame } from '../../../components/list/ListScreenFrame';
import { ListScreenHeader } from '../../../components/list/ListScreenHeader';
import { ListSelectionHeader } from '../../../components/list/ListSelectionHeader';
import { spacing } from '../../../constants/theme';
import { useNoteFlowColors } from '../../../hooks/useNoteFlowColors';
import { useNotesStore } from '../../../store/notesStore';
import { confirmBulkArchive } from '../../../utils/confirmActions';
import { filterChecklistsBySearch, isActiveItem } from '../../../utils/filters';
import { hapticImpactLight } from '../../../utils/haptics';

export default function ChecklistsListScreen() {
  const colors = useNoteFlowColors();
  const checklists = useNotesStore((s) => s.checklists);
  const archiveChecklists = useNotesStore((s) => s.archiveChecklists);
  const refreshNotes = useNotesStore((s) => s.refreshNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isArchiving, setIsArchiving] = useState(false);

  // Recarga al entrar en la pestaña por si los datos cambiaron en la API.
  useFocusEffect(
    useCallback(() => {
      void refreshNotes();
    }, [refreshNotes])
  );

  // Excluye archivadas y aplica búsqueda en título e ítems de cada checklist.
  const visibleChecklists = useMemo(() => {
    const active = checklists.filter(isActiveItem);
    return filterChecklistsBySearch(active, searchQuery);
  }, [checklists, searchQuery]);

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

    confirmBulkArchive(selectedIds.length, 'checklist', 'checklists', () => {
      void (async () => {
        setIsArchiving(true);
        const ok = await archiveChecklists(selectedIds);
        setIsArchiving(false);
        if (ok) exitSelectionMode();
      })();
    });
  }, [archiveChecklists, exitSelectionMode, selectedIds]);

  const listPaddingBottom = spacing.xxl + (selectionMode ? 88 : 0);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ListScreenFrame backgroundColor={colors.background}>
        <View style={styles.container}>
          <FlashList
            style={styles.list}
            data={visibleChecklists}
            keyExtractor={(item) => item.id}
            extraData={{ selectionMode, selectedIds }}
            contentContainerStyle={
              visibleChecklists.length === 0
                ? [styles.listContent, styles.listContentEmpty, { paddingBottom: listPaddingBottom }]
                : [styles.listContent, { paddingBottom: listPaddingBottom }]
            }
            ListHeaderComponent={
              selectionMode ? (
                <ListSelectionHeader
                  selectedCount={selectedIds.length}
                  onCancel={exitSelectionMode}
                  emptyHint="Selecciona checklists"
                />
              ) : (
                <ListScreenHeader
                  title="Checklists"
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchPlaceholder="Buscar checklists…"
                  onAddPress={() =>
                    router.push({ pathname: '/nueva-note', params: { type: 'checklist' } })
                  }
                  onSelectPress={
                    visibleChecklists.length > 0 ? () => enterSelectionMode() : undefined
                  }
                />
              )
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
                  selectionMode={selectionMode}
                  selected={selectedSet.has(item.id)}
                  onPress={
                    selectionMode
                      ? () => toggleSelection(item.id)
                      : () => router.push(`/checklists/${item.id}`)
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
