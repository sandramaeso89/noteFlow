import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getNoteFlowPaperTheme } from '../constants/theme';

// Layout raíz: proveedor de área segura, tema Paper (claro/oscuro) y pila de navegación
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = getNoteFlowPaperTheme(colorScheme);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Stack
          screenOptions={{
            headerShown: true,
            title: 'NoteFlow',
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTintColor: theme.colors.onSurface,
          }}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
