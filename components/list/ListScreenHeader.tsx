import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';

import { radius, spacing, typography } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';

type ListScreenHeaderProps = {
  title: string;
  onAddPress: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
};

export function ListScreenHeader({
  title,
  onAddPress,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Buscar…',
}: ListScreenHeaderProps) {
  const colors = useNoteFlowColors();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        <Pressable
          onPress={onAddPress}
          style={({ pressed }) => [
            styles.addButton,
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
  addButton: {
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
