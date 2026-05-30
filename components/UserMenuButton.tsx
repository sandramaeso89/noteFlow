/**
 * Menú de cuenta: muestra el email y permite cerrar sesión.
 * Preparado para sustituir el proveedor de auth (p. ej. Firebase) más adelante.
 */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Menu } from 'react-native-paper';

import { radius } from '../constants/theme';
import { useNoteFlowColors } from '../hooks/useNoteFlowColors';
import { useAuthStore } from '../store/authStore';
import { useNotesStore } from '../store/notesStore';

export function UserMenuButton() {
  const colors = useNoteFlowColors();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const resetNotes = useNotesStore((s) => s.resetForLogout);
  const [visible, setVisible] = useState(false);

  const handleLogout = () => {
    setVisible(false);
    void (async () => {
      await logout();
      resetNotes();
      router.replace('/login');
    })();
  };

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Pressable
          onPress={() => setVisible(true)}
          style={({ pressed }) => [
            styles.iconButton,
            {
              borderColor: colors.borderStrong,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Cuenta de usuario"
        >
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={24}
            color={colors.textPrimary}
          />
        </Pressable>
      }
    >
      <Menu.Item
        leadingIcon="email-outline"
        title={user?.email ?? 'Mi cuenta'}
        disabled
      />
      <Menu.Item leadingIcon="logout" onPress={handleLogout} title="Cerrar sesión" />
    </Menu>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: radius.button,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
