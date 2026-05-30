/**
 * Stack de navegación para la pestaña Archivadas (lista unificada de ítems archivados).
 * El header lo gestionan las pantallas hijas según la ruta activa.
 */
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function ArchivadasLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: { color: theme.colors.onSurface },
      }}
    />
  );
}
