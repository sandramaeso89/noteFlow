/**
 * Fila de ítem marcable dentro del detalle de una checklist.
 * Toda la fila es táctil, no solo el checkbox de Paper.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Checkbox } from 'react-native-paper';

import { radius, spacing } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';

type ChecklistItemRowProps = {
  text: string;
  isCompleted: boolean;
  onToggle: () => void;
};

export function ChecklistItemRow({ text, isCompleted, onToggle }: ChecklistItemRowProps) {
  const colors = useNoteFlowColors();

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.row,
        {
          borderColor: colors.cardBorder,
          backgroundColor: colors.surface,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <Checkbox
        status={isCompleted ? 'checked' : 'unchecked'}
        onPress={onToggle}
        color={colors.fill}
      />
      <Text
        style={[
          styles.text,
          {
            color: isCompleted ? colors.textDisabled : colors.textPrimary,
            textDecorationLine: isCompleted ? 'line-through' : 'none',
          },
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
});
