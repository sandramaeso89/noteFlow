/**
 * Stack de navegación para la pestaña Ideas (lista + detalle por id).
 */
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function IdeasLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: { color: theme.colors.onSurface },
      }}
    />
  );
}
