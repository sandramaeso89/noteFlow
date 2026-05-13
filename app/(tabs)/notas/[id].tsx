import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { spacing } from '../../../constants/theme';

export default function NotaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: `Nota` }} />
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onBackground }}>
          Detalle de nota
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.primary, marginTop: spacing.sm }}>
          id: {id}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.md }}>
          Aquí cargaremos el contenido desde el store cuando exista persistencia.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg },
});
