/**
 * Mensaje de error de validación bajo un campo de formulario (Zod → UI).
 */
import { StyleSheet, Text } from 'react-native';

import { spacing } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';

type FieldErrorProps = {
  message?: string;
};

export function FieldError({ message }: FieldErrorProps) {
  const colors = useNoteFlowColors();
  if (!message) return null;

  return (
    <Text style={[styles.error, { color: colors.error }]} accessibilityRole="alert">
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  error: {
    fontSize: 12,
    marginTop: spacing.xxs,
    marginLeft: spacing.xs,
  },
});
