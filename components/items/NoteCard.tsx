/**
 * Tarjeta de nota de texto en listados: punto de acento violeta y preview truncado.
 */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';
import type { Note } from '../../types';
import { formatNoteCardDate } from '../../utils/formatDate';
import { truncate } from '../../utils/text';
import { CardShell } from './CardShell';

type NoteCardProps = {
  note: Note;
  onPress?: () => void;
};

export function NoteCard({ note, onPress }: NoteCardProps) {
  const colors = useNoteFlowColors();

  return (
    <CardShell
      label="NOTA"
      showAccentBar
      leftAccessory={
        <View style={[styles.dot, { backgroundColor: colors.accent }]} />
      }
      title={note.title}
      onPress={onPress}
      footer={
        <>
          <Text style={[styles.meta, { color: colors.textTertiary }]}>
            {formatNoteCardDate(note.updatedAt)}
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={colors.textDisabled}
          />
        </>
      }
    >
      <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={1}>
        {truncate(note.content, 64)}
      </Text>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xxs,
  },
  meta: {
    fontSize: 12,
    flex: 1,
  },
});
