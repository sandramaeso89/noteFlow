/**
 * Stack de navegación para la pestaña Checklists (lista + detalle por id).
 */
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function ChecklistsLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: { color: theme.colors.onSurface },
      }}
    >
      <Stack.Screen name="[id]" options={{ headerShown: true }} />
    </Stack>
  );
}
