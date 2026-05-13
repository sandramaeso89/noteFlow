import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// Pantalla inicial (ruta /) mientras crecemos el resto de flujos NoteFlow
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NoteFlow</Text>
      <Text style={styles.subtitle}>Expo Router configurado</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
  },
});
