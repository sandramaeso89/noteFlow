/**
 * Banner dismissible: explica el gesto de swipe (eliminar definitivo, no archivar).
 */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';
import { dismissSwipeHint, isSwipeHintDismissed } from '../../utils/swipeHintStorage';

type SwipeHintBannerProps = {
  /** Solo mostrar si la lista tiene ítems visibles. */
  visible: boolean;
};

export function SwipeHintBanner({ visible }: SwipeHintBannerProps) {
  const colors = useNoteFlowColors();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShow(false);
      return;
    }
    void (async () => {
      const dismissed = await isSwipeHintDismissed();
      setShow(!dismissed);
    })();
  }, [visible]);

  if (!show) return null;

  const handleDismiss = () => {
    setShow(false);
    void dismissSwipeHint();
  };

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <MaterialCommunityIcons
        name="gesture-swipe-left"
        size={20}
        color={colors.textSecondary}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Desliza una tarjeta hacia la izquierda para{' '}
        <Text style={{ fontWeight: '700', color: colors.textPrimary }}>
          eliminarla definitivamente
        </Text>
        . No archiva: usa el menú ⋯ para archivar.
      </Text>
      <Pressable
        onPress={handleDismiss}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Cerrar consejo de deslizar"
      >
        <MaterialCommunityIcons name="close" size={20} color={colors.textTertiary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1.5,
  },
  icon: {
    marginTop: 1,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
