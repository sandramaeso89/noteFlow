import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { radius, spacing } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';

type CardShellProps = {
  label: string;
  leftAccessory: ReactNode;
  title: string;
  onPress?: () => void;
  footer?: ReactNode;
  children?: ReactNode;
  style?: ViewStyle;
};

export function CardShell({
  label,
  leftAccessory,
  title,
  onPress,
  footer,
  children,
  style,
}: CardShellProps) {
  const colors = useNoteFlowColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        {leftAccessory}
        <Text style={[styles.label, { color: colors.textTertiary }]}>{label}</Text>
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
        {title}
      </Text>

      {children}

      {footer ? (
        <View style={styles.footer}>{footer}</View>
      ) : (
        <View style={styles.footer}>
          <View style={styles.footerSpacer} />
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={colors.textDisabled}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  footerSpacer: {
    flex: 1,
  },
});
