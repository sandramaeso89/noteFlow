/**
 * Layout raíz de la app (Expo Router).
 * Protege rutas con auth().onAuthStateChanged y envuelve tema Paper + carga de datos.
 */
import 'react-native-reanimated';

import auth from '@react-native-firebase/auth';
import { Stack, router, useSegments } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Appearance, StyleSheet, useColorScheme, View, type ColorSchemeName } from 'react-native';
import { PaperProvider, Text, useTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoreHydrationGate } from '../components/StoreHydrationGate';
import { getNoteFlowPaperTheme, spacing } from '../constants/theme';
import { useNoteFlowColors } from '../hooks/useNoteFlowColors';
import { resolveSessionUser } from '../lib/firebaseAuth';
import { useAuthStore } from '../store/authStore';
import { configureNotificationHandler } from '../utils/notifications';

const AUTH_ROUTES = new Set(['login', 'register']);

function isAuthRoute(segment: string | undefined): boolean {
  return segment !== undefined && AUTH_ROUTES.has(segment);
}

// Combina useColorScheme con Appearance nativo: en algunos dispositivos el hook
// tarda en reflejar cambios de tema del sistema; el listener mantiene coherencia.
function useResolvedColorScheme(): ColorSchemeName {
  const fromHook = useColorScheme();
  const [fromNative, setFromNative] = useState<ColorSchemeName>(() =>
    Appearance.getColorScheme()
  );

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setFromNative(colorScheme);
    });
    return () => sub.remove();
  }, []);

  return fromHook ?? fromNative ?? 'light';
}

/**
 * Escucha la sesión Firebase y redirige según autenticación (enunciado del tutor).
 */
function ProtectedRoutes({ children }: { children: ReactNode }) {
  const colors = useNoteFlowColors();
  const segments = useSegments();
  const isReady = useAuthStore((s) => s.isReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const syncSession = useAuthStore((s) => s.syncSession);

  // Comprueba sesión con Firebase Auth en cada cambio (login, logout, arranque en frío).
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      void resolveSessionUser(firebaseUser).then(syncSession);
    });

    return unsubscribe;
  }, [syncSession]);

  // Protege rutas: sin sesión → login; con sesión → tabs (no auth screens).
  useEffect(() => {
    if (!isReady) return;

    const currentRoute = segments[0];
    const onAuthScreen = isAuthRoute(currentRoute);

    if (!isAuthenticated && !onAuthScreen) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && onAuthScreen) {
      router.replace('/notas');
    }
  }, [isReady, isAuthenticated, segments]);

  if (!isReady) {
    return (
      <View style={[styles.authLoading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
        <Text style={{ color: colors.textTertiary }}>Comprobando sesión…</Text>
      </View>
    );
  }

  return children;
}

// Stack principal: index (redirect), tabs y modal de creación de contenido.
function RootNavigator() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: { color: theme.colors.onSurface },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Modal para crear nota/checklist/idea sin salir del contexto de tabs */}
      <Stack.Screen
        name="nueva-note"
        options={{
          presentation: 'modal',
          title: 'Nuevo contenido',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useResolvedColorScheme();
  const theme = getNoteFlowPaperTheme(colorScheme);

  useEffect(() => {
    configureNotificationHandler();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <ProtectedRoutes>
          <StoreHydrationGate>
            <RootNavigator />
          </StoreHydrationGate>
        </ProtectedRoutes>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  authLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
});
