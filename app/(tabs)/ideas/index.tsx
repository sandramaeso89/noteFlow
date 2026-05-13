import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { FAB, List, Text, useTheme } from 'react-native-paper';

import { spacing } from '../../../constants/theme';

const MOCK_IDS = ['idea-a', 'idea-b'];

export default function IdeasListScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
          Ideas
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.xs }}>
          Captura rápida sin estructura fija.
        </Text>
        {MOCK_IDS.map((id) => (
          <List.Item
            key={id}
            title={`Idea ${id}`}
            description="Toca para abrir detalle"
            left={(props) => <List.Icon {...props} icon="lightbulb-outline" />}
            onPress={() => router.push(`/ideas/${id}`)}
          />
        ))}
      </ScrollView>
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/nueva-note')}
        accessibilityLabel="Nuevo contenido"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 88 },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg },
});
