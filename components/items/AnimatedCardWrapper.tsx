/**
 * Envoltorio Reanimated para entradas/salidas al filtrar listas.
 * Suaviza la aparición/desaparición de tarjetas al buscar o archivar.
 */
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';

import { spacing } from '../../constants/theme';

type AnimatedCardWrapperProps = {
  children: ReactNode;
};

export function AnimatedCardWrapper({ children }: AnimatedCardWrapperProps) {
  return (
    // FadeInDown al aparecer; FadeOutLeft al filtrar o quitar de la lista.
    <Animated.View
      style={styles.wrap}
      entering={FadeInDown.duration(220)}
      exiting={FadeOutLeft.duration(180)}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignSelf: 'stretch',
    // Separación entre filas (antes en CardShell; fuera del swipe para no asomar el rojo).
    marginBottom: spacing.md,
  },
});
