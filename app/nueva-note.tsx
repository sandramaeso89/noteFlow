import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';

import { spacing } from '../constants/theme';

// Modal raíz: crear nota/checklist/idea (placeholder hasta conectar store)
export default function NuevaNoteScreen() {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  function handleClose() {
    router.back();
  }

  function handleSave() {
    // Persistencia en fases posteriores (Zustand + almacenamiento local)
    handleClose();
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nuevo contenido',
          headerLeft: () => (
            <Button mode="text" onPress={handleClose} compact>
              Cancelar
            </Button>
          ),
        }}
      />
      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Placeholder: aquí irá el tipo (nota / checklist / idea) y la persistencia.
        </Text>
        <TextInput
          mode="outlined"
          label="Título"
          value={title}
          onChangeText={setTitle}
          style={styles.field}
        />
        <TextInput
          mode="outlined"
          label="Detalle (opcional)"
          value={body}
          onChangeText={setBody}
          multiline
          numberOfLines={4}
          style={styles.field}
        />
        <View style={styles.actions}>
          <Button mode="outlined" onPress={handleClose}>
            Cerrar
          </Button>
          <Button mode="contained" onPress={handleSave} disabled={!title.trim()}>
            Guardar
          </Button>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  field: { marginTop: spacing.sm },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
