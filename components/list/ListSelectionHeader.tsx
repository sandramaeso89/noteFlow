/**
 * Cabecera de listado en modo selección múltiple (cancelar + contador).
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';

type ListSelectionHeaderProps = {
  selectedCount: number;
  onCancel: () => void;
  /** Texto cuando aún no hay ítems marcados (p. ej. "Selecciona checklists"). */
  emptyHint?: string;
};

export function ListSelectionHeader({
  selectedCount,
  onCancel,
  emptyHint = 'Selecciona notas',
}: ListSelectionHeaderProps) {
  const colors = useNoteFlowColors();

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Cancelar selección"
      >
        <Text style={[styles.cancel, { color: colors.textSecondary }]}>Cancelar</Text>
      </Pressable>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {selectedCount === 0 ? emptyHint : `${selectedCount} seleccionadas`}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  cancel: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  spacer: {
    width: 72,
  },
});
