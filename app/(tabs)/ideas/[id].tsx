/**
 * Detalle de una idea: muestra color, etiquetas y acciones de archivo/restaurar/borrar.
 * El id llega por la ruta dinámica `[id].tsx` de Expo Router.
 */
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { DetailHeaderMenu } from '../../../components/detail/DetailHeaderMenu';
import { radius, spacing, typography } from '../../../constants/theme';
import { useNoteFlowColors } from '../../../hooks/useNoteFlowColors';
import { useNotesStore } from '../../../store/notesStore';
import { confirmArchive, confirmPermanentDelete } from '../../../utils/confirmActions';
import { formatNoteCardDate } from '../../../utils/formatDate';

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useNoteFlowColors();
  const idea = useNotesStore((s) => s.ideas.find((i) => i.id === id));
  const archiveIdea = useNotesStore((s) => s.archiveIdea);
  const unarchiveIdea = useNotesStore((s) => s.unarchiveIdea);
  const deleteIdea = useNotesStore((s) => s.deleteIdea);

  // Si el id no existe (borrado o enlace roto), mostramos estado vacío sin crashear.
  if (!idea) {
    return (
      <>
        <Stack.Screen options={{ title: 'Idea' }} />
        <View style={[styles.screen, { backgroundColor: colors.background }]}>
          <Text style={{ color: colors.textSecondary }}>No se encontró esta idea.</Text>
        </View>
      </>
    );
  }

  const current = idea;
  const isArchived = !!current.isArchived;

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            // Menú ⋯: archivar o restaurar según estado; borrado solo desde archivo.
            <DetailHeaderMenu
              isArchived={isArchived}
              onArchive={() =>
                confirmArchive(current.title, () => {
                  archiveIdea(current.id);
                  router.back();
                })
              }
              onRestore={() => {
                unarchiveIdea(current.id);
                router.back();
              }}
              onDeletePermanent={() =>
                confirmPermanentDelete(current.title, () => {
                  deleteIdea(current.id);
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
        <View style={[styles.colorBand, { backgroundColor: current.color }]} />
        <Text style={[styles.meta, { color: colors.textTertiary }]}>IDEA</Text>
        <Text style={[styles.date, { color: colors.textTertiary }]}>
          {formatNoteCardDate(current.updatedAt)}
        </Text>
        <Text style={[styles.headline, { color: colors.textPrimary }]}>
          {current.title}
        </Text>
        <View style={styles.tags}>
          {current.tags.map((tag) => (
            <View
              key={tag}
              style={[
                styles.tag,
                {
                  borderColor: colors.cardBorder,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                {tag.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  colorBand: {
    height: 6,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
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
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    borderWidth: 1.5,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  tagText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
});
