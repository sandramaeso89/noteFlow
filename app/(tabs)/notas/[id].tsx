import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { DetailHeaderMenu } from '../../../components/detail/DetailHeaderMenu';
import { spacing, typography } from '../../../constants/theme';
import { useNoteFlowColors } from '../../../hooks/useNoteFlowColors';
import { useNotesStore } from '../../../store/notesStore';
import { confirmArchive, confirmPermanentDelete } from '../../../utils/confirmActions';
import { formatNoteCardDate } from '../../../utils/formatDate';

export default function NotaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useNoteFlowColors();
  const note = useNotesStore((s) => s.notes.find((n) => n.id === id));
  const archiveNote = useNotesStore((s) => s.archiveNote);
  const unarchiveNote = useNotesStore((s) => s.unarchiveNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);

  if (!note) {
    return (
      <>
        <Stack.Screen options={{ title: 'Nota' }} />
        <View style={[styles.screen, { backgroundColor: colors.background }]}>
          <Text style={{ color: colors.textSecondary }}>No se encontró esta nota.</Text>
        </View>
      </>
    );
  }

  const current = note;
  const isArchived = !!current.isArchived;

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
                  archiveNote(current.id);
                  router.back();
                })
              }
              onRestore={() => {
                unarchiveNote(current.id);
                router.back();
              }}
              onDeletePermanent={() =>
                confirmPermanentDelete(current.title, () => {
                  deleteNote(current.id);
                  router.back();
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
        <Text style={[styles.meta, { color: colors.textTertiary }]}>NOTA</Text>
        <Text style={[styles.date, { color: colors.textTertiary }]}>
          {formatNoteCardDate(current.updatedAt)}
        </Text>
        <Text style={[styles.headline, { color: colors.textPrimary }]}>
          {current.title}
        </Text>
        <View
          style={[
            styles.bodyCard,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
          ]}
        >
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {current.content}
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg },
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
    marginBottom: spacing.lg,
  },
  bodyCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: spacing.lg,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
  },
});
