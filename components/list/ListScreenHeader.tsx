import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';

type ListScreenHeaderProps = {
  title: string;
  onAddPress: () => void;
};

export function ListScreenHeader({ title, onAddPress }: ListScreenHeaderProps) {
  const colors = useNoteFlowColors();

  return (
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
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.display,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: radius.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
