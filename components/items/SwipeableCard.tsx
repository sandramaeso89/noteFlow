/**
 * Deslizar a la izquierda para eliminar (Gesture Handler + Reanimated en UI thread).
 */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { radius, spacing } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';
import { confirmPermanentDelete } from '../../utils/confirmActions';
import { hapticImpactLight } from '../../utils/haptics';

const SWIPE_THRESHOLD = -80;
const SWIPE_OPEN = -80;
const SWIPE_DISMISS = -360;

type SwipeableCardProps = {
  children: ReactNode;
  itemTitle: string;
  onConfirmDelete: () => void;
  /** Desactivar durante selección múltiple o listas sin gesto. */
  enabled?: boolean;
};

export function SwipeableCard({
  children,
  itemTitle,
  onConfirmDelete,
  enabled = true,
}: SwipeableCardProps) {
  const colors = useNoteFlowColors();
  const translateX = useSharedValue(0);
  const hapticTriggered = useSharedValue(false);

  const showDeleteConfirm = useCallback(() => {
    confirmPermanentDelete(
      itemTitle,
      () => {
        translateX.value = withTiming(
          SWIPE_DISMISS,
          { duration: 220 },
          (finished) => {
            if (finished) {
              runOnJS(onConfirmDelete)();
            }
          }
        );
      },
      () => {
        translateX.value = withSpring(0);
      }
    );
  }, [itemTitle, onConfirmDelete]);

  const triggerThresholdHaptic = useCallback(() => {
    void hapticImpactLight();
  }, []);

  const pan = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX([-12, 12])
    .failOffsetY([-12, 12])
    .onBegin(() => {
      hapticTriggered.value = false;
    })
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = event.translationX;
        if (event.translationX <= SWIPE_THRESHOLD && !hapticTriggered.value) {
          hapticTriggered.value = true;
          runOnJS(triggerThresholdHaptic)();
        }
      }
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withSpring(SWIPE_OPEN);
        runOnJS(showDeleteConfirm)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.action, { backgroundColor: colors.fill }]}>
        <MaterialCommunityIcons name="delete-outline" size={22} color={colors.onFill} />
        <Text style={[styles.actionLabel, { color: colors.onFill }]}>Eliminar</Text>
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: colors.background },
            animatedStyle,
          ]}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: radius.card,
  },
  action: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: spacing.lg,
    gap: spacing.xs,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    borderRadius: radius.card,
    overflow: 'hidden',
  },
});
