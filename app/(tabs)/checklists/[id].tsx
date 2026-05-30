/**
 * Detalle de checklist: marca ítems, muestra progreso y dispara haptic al completar todo.
 */
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChecklistItemRow } from '../../../components/detail/ChecklistItemRow';
import { DetailHeaderMenu } from '../../../components/detail/DetailHeaderMenu';
import { spacing, typography } from '../../../constants/theme';
import { useDetailRedirectIfMissing } from '../../../hooks/useDetailRedirectIfMissing';
import { useNoteFlowColors } from '../../../hooks/useNoteFlowColors';
import { useNotesStore } from '../../../store/notesStore';
import { confirmArchive, confirmPermanentDelete } from '../../../utils/confirmActions';
import { formatUpdatedLabel } from '../../../utils/formatDate';
import { hapticImpactLight, hapticSuccess } from '../../../utils/haptics';

export default function ChecklistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useNoteFlowColors();
  const checklist = useNotesStore((s) => s.checklists.find((c) => c.id === id));
  const toggleChecklistItem = useNotesStore((s) => s.toggleChecklistItem);
  const archiveChecklist = useNotesStore((s) => s.archiveChecklist);
  const unarchiveChecklist = useNotesStore((s) => s.unarchiveChecklist);
  const deleteChecklist = useNotesStore((s) => s.deleteChecklist);

  const ready = useDetailRedirectIfMissing(!!checklist, '/checklists');

  if (!ready || !checklist) {
    return (
      <>
        <Stack.Screen options={{ title: 'Checklist' }} />
        <View style={[styles.screen, styles.centered, { backgroundColor: colors.background }]}>
          <ActivityIndicator color={colors.textPrimary} />
        </View>
      </>
    );
  }

  const current = checklist;
  const isArchived = !!current.isArchived;
  const done = current.items.filter((i) => i.isCompleted).length;
  const total = current.items.length;
  const progress = total === 0 ? 0 : done / total;
  const allDone = total > 0 && done === total;

  // Tras toggle, leemos el store de nuevo para detectar si acaba de completarse al 100%.
  async function handleToggleItem(itemId: string) {
    const completedBefore = current.items.filter((i) => i.isCompleted).length;
    void hapticImpactLight();
    await toggleChecklistItem(current.id, itemId);
    const updated = useNotesStore.getState().checklists.find((c) => c.id === current.id);
    if (
      updated &&
      updated.items.length > 0 &&
      updated.items.every((i) => i.isCompleted) &&
      completedBefore < updated.items.length
    ) {
      void hapticSuccess();
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <DetailHeaderMenu
              isArchived={isArchived}
              onArchive={() =>
                confirmArchive(current.title, () => {
                  void archiveChecklist(current.id).then(() => router.back());
                })
              }
              onRestore={() => {
                void unarchiveChecklist(current.id).then(() => router.back());
              }}
              onDeletePermanent={() =>
                confirmPermanentDelete(current.title, () => {
                  void deleteChecklist(current.id).then(() => router.back());
                })
              }
            />
          ),
        }}
      />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.meta, { color: colors.textTertiary }]}>CHECKLIST</Text>
        <Text style={[styles.date, { color: colors.textTertiary }]}>
          {formatUpdatedLabel(current.updatedAt)}
        </Text>
        <Text style={[styles.headline, { color: colors.textPrimary }]}>
          {current.title}
        </Text>

        <View style={styles.progressRow}>
          <View style={[styles.track, { backgroundColor: colors.track }]}>
            <View
              style={[
                styles.fill,
                {
                  backgroundColor: allDone ? colors.accent : colors.fill,
                  width: `${Math.round(progress * 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.fraction, { color: colors.textSecondary }]}>
            {done} / {total}
          </Text>
        </View>

        <View style={styles.items}>
          {current.items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              text={item.text}
              isCompleted={item.isCompleted}
              onToggle={() => handleToggleItem(item.id)}
            />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg },
  centered: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  meta: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: spacing.xs,
  },
  date: { fontSize: 13, marginBottom: spacing.lg },
  headline: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 2 },
  fraction: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    minWidth: 44,
    textAlign: 'right',
  },
  items: { gap: spacing.sm },
});
