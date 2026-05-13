import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { spacing } from '../../../constants/theme';

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Idea' }} />
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onBackground }}>
          Detalle de idea
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.primary, marginTop: spacing.sm }}>
          id: {id}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.md }}>
          Aquí se podrá expandir, etiquetar o mover a notas/checklists.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg },
});
