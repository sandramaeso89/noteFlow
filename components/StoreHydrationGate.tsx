/**
 * Pantalla de carga inicial mientras el store obtiene datos de la API.
 * Evita mostrar listas vacías antes del primer fetchNotes().
 */
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { spacing } from '../constants/theme';
import { useNoteFlowColors } from '../hooks/useNoteFlowColors';
import { handleApiUnauthorized } from '../components/AuthGate';
import { useAuthStore } from '../store/authStore';
import { useNotesStore } from '../store/notesStore';

type StoreHydrationGateProps = {
  children: ReactNode;
};

export function StoreHydrationGate({ children }: StoreHydrationGateProps) {
  const colors = useNoteFlowColors();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useNotesStore((s) => s.isLoading);
  const error = useNotesStore((s) => s.error);
  const fetchNotes = useNotesStore((s) => s.fetchNotes);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchNotes();
    }
  }, [fetchNotes, isAuthenticated]);

  useEffect(() => {
    if (error === 'Sesión expirada') {
      void handleApiUnauthorized();
    }
  }, [error]);

  if (!isAuthenticated) {
    return children;
  }

  if (isLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
        <Text style={[styles.label, { color: colors.textTertiary }]}>
          Cargando tus notas…
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <Text style={[styles.error, { color: colors.textSecondary }]}>{error}</Text>
        <Button mode="contained" onPress={() => void fetchNotes()} buttonColor={colors.fill}>
          Reintentar
        </Button>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  label: {
    fontSize: 14,
  },
  error: {
    fontSize: 15,
    textAlign: 'center',
  },
});
