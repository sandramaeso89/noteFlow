import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import type { ColorSchemeName } from 'react-native';

/**
 * Escala de espaciados base (múltiplos de 4) para layout y ritmo vertical.
 * Usar estos valores en StyleSheet en lugar de números mágicos sueltos.
 */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

/**
 * Escala tipográfica (tamaños en dp). Paper usa su propia escala MD3;
 * estos tokens sirven para Text fuera de Paper o para afinar manualmente.
 */
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 32,
  },
  lineHeight: {
    tight: 20,
    normal: 22,
    relaxed: 26,
  },
} as const;

/** Paleta NoteFlow: productividad, tono sobrio, acento violeta */
const paletteLight = {
  primary: '#5B458C',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E8DDFF',
  onPrimaryContainer: '#1E1147',
  secondary: '#625B71',
  onSecondary: '#FFFFFF',
  background: '#F7F5FB',
  surface: '#FFFFFF',
  onSurface: '#1C1B1F',
  onSurfaceVariant: '#49454E',
  outline: '#79747E',
  error: '#B3261E',
};

const paletteDark = {
  primary: '#D0BCFF',
  onPrimary: '#381E72',
  primaryContainer: '#4F378B',
  onPrimaryContainer: '#E8DDFF',
  secondary: '#CCC2DC',
  onSecondary: '#332D41',
  background: '#121218',
  surface: '#1C1B20',
  onSurface: '#E6E1E5',
  onSurfaceVariant: '#CAC4D0',
  outline: '#938F99',
  error: '#F2B8B5',
};

/**
 * Devuelve el tema MD3 de React Native Paper fusionado con los tokens NoteFlow.
 * Pasa el esquema resuelto (`'light' | 'dark'`); si llega `null`, se trata como claro.
 */
export function getNoteFlowPaperTheme(
  colorScheme: ColorSchemeName
): MD3Theme {
  const isDark = colorScheme === 'dark';
  const base = isDark ? MD3DarkTheme : MD3LightTheme;
  const p = isDark ? paletteDark : paletteLight;

  return {
    ...base,
    dark: isDark,
    colors: {
      ...base.colors,
      primary: p.primary,
      onPrimary: p.onPrimary,
      primaryContainer: p.primaryContainer,
      onPrimaryContainer: p.onPrimaryContainer,
      secondary: p.secondary,
      onSecondary: p.onSecondary,
      background: p.background,
      surface: p.surface,
      onSurface: p.onSurface,
      onSurfaceVariant: p.onSurfaceVariant,
      outline: p.outline,
      error: p.error,
    },
  };
}
