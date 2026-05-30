/**
 * Cabecera reutilizable de pantallas de listado: título, botón + y campo de búsqueda.
 */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';

import { radius, spacing, typography } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';
import { UserMenuButton } from '../UserMenuButton';

type ListScreenHeaderProps = {
  title: string;
  onAddPress: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Activa modo selección múltiple (solo si hay ítems). */
  onSelectPress?: () => void;
};

export function ListScreenHeader({
  title,
  onAddPress,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Buscar…',
  onSelectPress,
}: ListScreenHeaderProps) {
  const colors = useNoteFlowColors();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        <View style={styles.actions}>
          <UserMenuButton />
          {onSelectPress ? (
            <Pressable
              onPress={onSelectPress}
              style={({ pressed }) => [
                styles.iconButton,
                {
                  borderColor: colors.borderStrong,
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Seleccionar notas"
            >
              <MaterialCommunityIcons
                name="checkbox-multiple-marked-outline"
                size={22}
                color={colors.textPrimary}
              />
            </Pressable>
          ) : null}
          <Pressable
            onPress={onAddPress}
            style={({ pressed }) => [
              styles.iconButton,
              {
                borderColor: colors.borderStrong,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Nuevo contenido"
          >
            <MaterialCommunityIcons name="plus" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>
      <TextInput
        mode="outlined"
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChangeText={onSearchChange}
        dense
        left={<TextInput.Icon icon="magnify" />}
        style={[styles.search, { backgroundColor: colors.surface }]}
        outlineColor={colors.border}
        activeOutlineColor={colors.textPrimary}
        textColor={colors.textPrimary}
        placeholderTextColor={colors.textDisabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.fontSize.display,
    fontWeight: '800',
    letterSpacing: -0.8,
    flex: 1,
    marginRight: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: radius.button,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    borderRadius: radius.card,
  },
});
