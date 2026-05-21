import type { ReactNode } from 'react';
import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';

type AnimatedCardWrapperProps = {
  children: ReactNode;
};

/** Envoltorio Reanimated para entradas/salidas al filtrar listas. */
export function AnimatedCardWrapper({ children }: AnimatedCardWrapperProps) {
  return (
    <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOutLeft.duration(180)}>
      {children}
    </Animated.View>
  );
}
