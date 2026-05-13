import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Appearance, useColorScheme, type ColorSchemeName } from 'react-native';
import { PaperProvider, useTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getNoteFlowPaperTheme } from '../constants/theme';

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
        <RootNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
