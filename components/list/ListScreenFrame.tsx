/**
 * Contenedor de pantallas de listado: respeta safe area (Android edge-to-edge).
 */
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ListScreenFrameProps = {
  children: ReactNode;
  backgroundColor: string;
};

export function ListScreenFrame({ children, backgroundColor }: ListScreenFrameProps) {
  return (
    <SafeAreaView
      style={[styles.frame, { backgroundColor }]}
      edges={['top', 'left', 'right']}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    width: '100%',
  },
});
