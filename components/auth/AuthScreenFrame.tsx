/**
 * Layout compartido para pantallas de login y registro.
 */
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { spacing, typography } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';

type AuthScreenFrameProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthScreenFrame({ title, subtitle, children }: AuthScreenFrameProps) {
  const colors = useNoteFlowColors();

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={[styles.brand, { color: colors.textPrimary }]}>NoteFlow</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        {children}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    gap: spacing.md,
  },
  brand: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    textAlign: 'center',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
