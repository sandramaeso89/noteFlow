/**
 * Menú de cuenta: foto de perfil, cambiar avatar y cerrar sesión.
 */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet } from 'react-native';
import { Menu } from 'react-native-paper';

import { radius } from '../constants/theme';
import { useNoteFlowColors } from '../hooks/useNoteFlowColors';
import { useAuthStore } from '../store/authStore';
import { useNotesStore } from '../store/notesStore';

export function UserMenuButton() {
  const colors = useNoteFlowColors();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const changeProfilePhoto = useAuthStore((s) => s.changeProfilePhoto);
  const resetNotes = useNotesStore((s) => s.resetForLogout);
  const [visible, setVisible] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

  const handleLogout = () => {
    setVisible(false);
    void (async () => {
      await logout();
      resetNotes();
      router.replace('/login');
    })();
  };

  const handleChangePhoto = () => {
    setVisible(false);
    void (async () => {
      setIsUpdatingPhoto(true);
      const ok = await changeProfilePhoto();
      setIsUpdatingPhoto(false);
      if (ok) {
        Alert.alert('Foto actualizada', 'Tu foto de perfil se ha guardado.');
      }
    })();
  };

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Pressable
          onPress={() => setVisible(true)}
          disabled={isUpdatingPhoto}
          style={({ pressed }) => [
            styles.iconButton,
            {
              borderColor: colors.borderStrong,
              backgroundColor: colors.surface,
              opacity: pressed || isUpdatingPhoto ? 0.85 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Cuenta de usuario"
        >
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={24}
              color={colors.textPrimary}
            />
          )}
        </Pressable>
      }
    >
      <Menu.Item
        leadingIcon="email-outline"
        title={user?.name ?? user?.email ?? 'Mi cuenta'}
        disabled
      />
      <Menu.Item
        leadingIcon="camera-outline"
        onPress={handleChangePhoto}
        title="Cambiar foto de perfil"
        disabled={isUpdatingPhoto}
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
    overflow: 'hidden',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.button,
  },
});
