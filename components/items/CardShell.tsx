/**
 * Contenedor visual compartido por NoteCard, ChecklistCard e IdeaCard.
 * Centraliza borde, tipografía de etiqueta y área táctil de navegación.
 */
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
  onLongPress?: () => void;
  footer?: ReactNode;
  children?: ReactNode;
  style?: ViewStyle;
  /** Resalta la tarjeta en modo selección múltiple. */
  selected?: boolean;
  /** Barra de acento vertical (solo notas). */
  showAccentBar?: boolean;
};

export function CardShell({
  label,
  leftAccessory,
  title,
  onPress,
  onLongPress,
  footer,
  children,
  style,
  selected = false,
  showAccentBar = false,
}: CardShellProps) {
  const colors = useNoteFlowColors();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={!onPress && !onLongPress}
      style={({ pressed }) => [
        styles.outer,
        showAccentBar && styles.outerWithBar,
        {
          opacity: pressed ? 0.94 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {showAccentBar ? (
        <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />
      ) : null}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: selected ? colors.textPrimary : colors.cardBorder,
            borderWidth: selected ? 2 : 1.5,
          },
          style,
        ]}
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
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignSelf: 'stretch',
    marginBottom: spacing.md,
  },
  outerWithBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  accentBar: {
    width: 3,
    borderTopLeftRadius: radius.card,
    borderBottomLeftRadius: radius.card,
    marginRight: spacing.xs,
  },
  card: {
    flex: 1,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
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
