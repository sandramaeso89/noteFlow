import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';

type ListEmptyStateProps = {
  message: string;
};

export function ListEmptyState({ message }: ListEmptyStateProps) {
  const colors = useNoteFlowColors();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.text, { color: colors.textTertiary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
