/**
 * Listado de notas de texto activas con búsqueda por título y contenido.
 */
import { FlashList } from '@shopify/flash-list';
import { Stack, router } from 'expo-router';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedCardWrapper } from '../../../components/items/AnimatedCardWrapper';
import { NoteCard } from '../../../components/items/NoteCard';
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
import { filterNotesBySearch, isActiveItem } from '../../../utils/filters';
import { hapticImpactLight } from '../../../utils/haptics';

export default function NotasListScreen() {
  const colors = useNoteFlowColors();
  const notes = useNotesStore((s) => s.notes);
  const archiveNotes = useNotesStore((s) => s.archiveNotes);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isArchiving, setIsArchiving] = useState(false);

  // Excluye archivadas y filtra por título o contenido de la nota.
  const visibleNotes = useMemo(() => {
    const active = notes.filter(isActiveItem);
    return filterNotesBySearch(active, searchQuery);
  }, [notes, searchQuery]);

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

    confirmBulkArchive(selectedIds.length, 'nota', 'notas', () => {
      void (async () => {
        setIsArchiving(true);
        const ok = await archiveNotes(selectedIds);
        setIsArchiving(false);
        if (ok) exitSelectionMode();
      })();
    });
  }, [archiveNotes, exitSelectionMode, selectedIds]);

  const listPaddingBottom =
    spacing.xxl + (selectionMode ? 88 : 0);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ListScreenFrame backgroundColor={colors.background}>
        <View style={styles.container}>
          <FlashList
            style={styles.list}
            data={visibleNotes}
            keyExtractor={(item) => item.id}
            extraData={{ selectionMode, selectedIds }}
            contentContainerStyle={
              visibleNotes.length === 0
                ? [styles.listContent, styles.listContentEmpty, { paddingBottom: listPaddingBottom }]
                : [styles.listContent, { paddingBottom: listPaddingBottom }]
            }
            ListHeaderComponent={
              selectionMode ? (
                <ListSelectionHeader
                  selectedCount={selectedIds.length}
                  onCancel={exitSelectionMode}
                />
              ) : (
                <Fragment>
                  <ListScreenHeader
                    title="Notas"
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Buscar notas…"
                    onAddPress={() =>
                      router.push({ pathname: '/nueva-note', params: { type: 'note' } })
                    }
                    onSelectPress={
                      visibleNotes.length > 0 ? () => enterSelectionMode() : undefined
                    }
                  />
                  <SwipeHintBanner visible={visibleNotes.length > 0} />
                </Fragment>
              )
            }
            ListEmptyComponent={
              <ListEmptyState
                icon="note-text-outline"
                message={
                  searchQuery.trim()
                    ? `Ningún resultado para «${searchQuery.trim()}». Prueba otro término.`
                    : 'Nada en el radar. Captura lo esencial de tu próxima reunión.'
                }
                hint={
                  searchQuery.trim()
                    ? undefined
                    : 'Cuando tengas notas, desliza una tarjeta a la izquierda para eliminarla definitivamente (no archiva).'
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
                <SwipeableCard
                  enabled={!selectionMode}
                  itemTitle={item.title}
                  onConfirmDelete={() => {
                    void deleteNote(item.id);
                  }}
                >
                  <NoteCard
                    note={item}
                    selectionMode={selectionMode}
                    selected={selectedSet.has(item.id)}
                    onPress={
                      selectionMode
                        ? () => toggleSelection(item.id)
                        : () => router.push(`/notas/${item.id}`)
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
