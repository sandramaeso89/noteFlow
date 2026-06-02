/**
 * Placeholder cuando FlashList no tiene datos: icono, mensaje y CTA opcional.
 */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { spacing } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';

type ListEmptyStateProps = {
  message: string;
  /** Consejo secundario (p. ej. gesto de swipe cuando haya ítems). */
  hint?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  ctaLabel?: string;
  onCtaPress?: () => void;
};

export function ListEmptyState({
  message,
  hint,
  icon = 'note-text-outline',
  ctaLabel,
  onCtaPress,
}: ListEmptyStateProps) {
  const colors = useNoteFlowColors();

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: colors.surfaceMuted, borderColor: colors.cardBorder },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={40} color={colors.textTertiary} />
      </View>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {hint ? (
        <Text style={[styles.hint, { color: colors.textTertiary }]}>{hint}</Text>
      ) : null}
      {ctaLabel && onCtaPress ? (
        <Button
          mode="contained"
          onPress={onCtaPress}
          buttonColor={colors.fill}
          textColor={colors.surface}
          style={styles.cta}
        >
          {ctaLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 300,
  },
  cta: {
    marginTop: spacing.sm,
    borderRadius: 8,
  },
});
