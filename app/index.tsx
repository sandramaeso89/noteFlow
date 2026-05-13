import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

import { spacing, typography } from '../constants/theme';

// Pantalla inicial: usa el tema Paper + tokens de espaciado/tipografía
export default function HomeScreen() {
  const theme = useTheme();

  return (
    <Surface style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
          NoteFlow
        </Text>
        <Text
          variant="bodyLarge"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.sm }}
        >
          Expo Router + React Native Paper
        </Text>
        <Text
          variant="bodyMedium"
          style={{
            color: theme.colors.onSurfaceVariant,
            marginTop: spacing.md,
            fontSize: typography.fontSize.sm,
          }}
        >
          Tema {theme.dark ? 'oscuro' : 'claro'} (sigue el sistema)
        </Text>
      </View>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
    </Surface>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
