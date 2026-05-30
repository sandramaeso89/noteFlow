/**
 * Layout de pestañas inferiores (Notas, Checklists, Ideas, Archivo).
 * Cada tab es un grupo de rutas con su propio Stack interno para listado + detalle.
 */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs, router } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.onSurface,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 56 + Math.max(insets.bottom, 8),
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="notas"
        options={{
          title: 'Notas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="note-text-outline" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => {
            router.replace('/notas');
          },
        }}
      />
      <Tabs.Screen
        name="checklists"
        options={{
          title: 'Checklists',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="format-list-checks" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => {
            router.replace('/checklists');
          },
        }}
      />
      <Tabs.Screen
        name="ideas"
        options={{
          title: 'Ideas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="lightbulb-outline" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => {
            router.replace('/ideas');
          },
        }}
      />
      <Tabs.Screen
        name="archivadas"
        options={{
          title: 'Archivo',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="archive-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
