/**
 * Envoltorio Reanimated para entradas/salidas al filtrar listas.
 * Suaviza la aparición/desaparición de tarjetas al buscar o archivar.
 */
import type { ReactNode } from 'react';
import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';

type AnimatedCardWrapperProps = {
  children: ReactNode;
};

export function AnimatedCardWrapper({ children }: AnimatedCardWrapperProps) {
  return (
    // FadeInDown al aparecer; FadeOutLeft al filtrar o quitar de la lista.
    <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOutLeft.duration(180)}>
      {children}
    </Animated.View>
  );
}
