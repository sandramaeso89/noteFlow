/**
 * Redirige a login si no hay sesión; carga el token desde SecureStore al arrancar.
 */
import { router, useSegments } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { spacing } from '../constants/theme';
import { useNoteFlowColors } from '../hooks/useNoteFlowColors';
import { ApiAuthError } from '../lib/api';
import { clearAuthToken } from '../lib/authStorage';
import { useAuthStore } from '../store/authStore';

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const colors = useNoteFlowColors();
  const segments = useSegments();
  const isReady = useAuthStore((s) => s.isReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!isReady) return;

    const onLoginScreen = segments[0] === 'login';

    if (!isAuthenticated && !onLoginScreen) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && onLoginScreen) {
      router.replace('/notas');
    }
  }, [isReady, isAuthenticated, segments]);

  if (!isReady) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
        <Text style={{ color: colors.textTertiary }}>Iniciando sesión…</Text>
      </View>
    );
  }

  return children;
}

/** Llamar tras 401 en peticiones API para cerrar sesión de forma segura. */
export async function handleApiUnauthorized(): Promise<void> {
  await clearAuthToken();
  await useAuthStore.getState().logout();
  router.replace('/login');
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
});
