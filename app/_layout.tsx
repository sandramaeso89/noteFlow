/**
 * Layout raíz de la app (Expo Router).
 * Envuelve toda la navegación con tema Paper, safe area y carga inicial desde la API.
 */
import 'react-native-reanimated';

import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Appearance, useColorScheme, type ColorSchemeName } from 'react-native';
import { PaperProvider, useTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoreHydrationGate } from '../components/StoreHydrationGate';
import { getNoteFlowPaperTheme } from '../constants/theme';

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

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StoreHydrationGate>
          <RootNavigator />
        </StoreHydrationGate>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
