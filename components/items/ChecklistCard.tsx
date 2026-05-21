/**
 * Tarjeta de checklist en listados: progreso visual (barra + fracción completada).
 */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';
import type { ChecklistNote } from '../../types';
import { formatUpdatedLabel } from '../../utils/formatDate';
import { CardShell } from './CardShell';

type ChecklistCardProps = {
  checklist: ChecklistNote;
  onPress?: () => void;
};

export function ChecklistCard({ checklist, onPress }: ChecklistCardProps) {
  const colors = useNoteFlowColors();
  const total = checklist.items.length;
  const done = checklist.items.filter((i) => i.isCompleted).length;
  const progress = total === 0 ? 0 : done / total;
  // Cambia icono y color de barra cuando todos los ítems están marcados.
  const allDone = total > 0 && done === total;

  return (
    <CardShell
      label="CHECKLIST"
      leftAccessory={
        <MaterialCommunityIcons
          name={allDone ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
          size={20}
          color={colors.textTertiary}
        />
      }
      title={checklist.title}
      onPress={onPress}
      footer={
        <>
          <Text style={[styles.meta, { color: colors.textTertiary }]}>
            {formatUpdatedLabel(checklist.updatedAt)}
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={colors.textDisabled}
          />
        </>
      }
    >
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
    </CardShell>
  );
}

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  track: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  fraction: {
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  meta: {
    fontSize: 12,
    flex: 1,
  },
});
