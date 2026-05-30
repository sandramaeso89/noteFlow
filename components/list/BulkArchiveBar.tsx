/**
 * Barra inferior fija para archivar varios ítems seleccionados.
 */
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';

type BulkArchiveBarProps = {
  selectedCount: number;
  onArchive: () => void;
  isArchiving?: boolean;
};

export function BulkArchiveBar({
  selectedCount,
  onArchive,
  isArchiving = false,
}: BulkArchiveBarProps) {
  const colors = useNoteFlowColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, spacing.sm),
        },
      ]}
    >
      <Button
        mode="contained"
        onPress={onArchive}
        loading={isArchiving}
        disabled={selectedCount === 0 || isArchiving}
        buttonColor={colors.fill}
        style={styles.button}
      >
        {selectedCount === 0
          ? 'Archivar selección'
          : `Archivar (${selectedCount})`}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  button: {
    borderRadius: 8,
  },
});
