import { Stack } from 'expo-router';

// Layout raíz: define la pila de navegación global de la app
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: 'NoteFlow',
      }}
    />
  );
}
