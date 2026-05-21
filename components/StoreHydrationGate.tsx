/**
 * Pantalla de carga mientras Zustand rehidrata notas desde AsyncStorage.
 * Evita mostrar listas vacías un instante antes de cargar datos persistidos.
 */
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { spacing } from '../constants/theme';
import { useNoteFlowColors } from '../hooks/useNoteFlowColors';
import { useNotesStore } from '../store/notesStore';

type StoreHydrationGateProps = {
  children: ReactNode;
};

/**
 * Bloquea la UI hasta que Zustand termine de leer AsyncStorage (rehidratación).
 */
export function StoreHydrationGate({ children }: StoreHydrationGateProps) {
  const colors = useNoteFlowColors();
  const hasHydrated = useNotesStore((s) => s._hasHydrated);
  const setHasHydrated = useNotesStore((s) => s.setHasHydrated);

  useEffect(() => {
    // Caso rápido: la rehidratación ya terminó antes de montar este componente.
    if (useNotesStore.persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }

    const unsub = useNotesStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    return unsub;
  }, [setHasHydrated]);

  if (!hasHydrated) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
        <Text style={[styles.label, { color: colors.textTertiary }]}>
          Cargando tus notas…
        </Text>
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
  },
  label: {
    fontSize: 14,
  },
});
