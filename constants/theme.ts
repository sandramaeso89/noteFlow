import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import type { ColorSchemeName } from 'react-native';

/**
 * Escala de espaciados base (múltiplos de 4) para layout y ritmo vertical.
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

export const radius = {
  card: 14,
  pill: 6,
  button: 24,
} as const;

/**
 * Alturas orientativas para `estimatedItemSize` en FlashList (ver docs/diseno-ui.md).
 */
export const listEstimatedItemSize = {
  note: 152,
  checklist: 176,
  idea: 168,
} as const;

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

/** Tokens de color NoteFlow (mockup minimalista + grises). Ver docs/diseno-ui.md */
export type NoteFlowColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  /** Borde de tarjetas en listas (más visible que `border`). */
  cardBorder: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  track: string;
  fill: string;
  accent: string;
  error: string;
};

const colorsLight: NoteFlowColors = {
  background: '#F2F2F5',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F7F9',
  border: '#E4E4E8',
  cardBorder: '#9E9EA8',
  borderStrong: '#6E6E76',
  textPrimary: '#141414',
  textSecondary: '#5C5C63',
  textTertiary: '#8A8A92',
  textDisabled: '#B0B0B8',
  track: '#E0E0E6',
  fill: '#1A1A1E',
  accent: '#5B458C',
  error: '#B3261E',
};

const colorsDark: NoteFlowColors = {
  background: '#141416',
  surface: '#1C1C1E',
  surfaceMuted: '#252528',
  border: '#2E2E32',
  cardBorder: '#5C5C66',
  borderStrong: '#8A8A92',
  textPrimary: '#F2F2F5',
  textSecondary: '#A8A8B0',
  textTertiary: '#8A8A92',
  textDisabled: '#6B6B72',
  track: '#3D3D42',
  fill: '#E8E8EC',
  accent: '#B8A4E8',
  error: '#F2B8B5',
};

export function getNoteFlowColors(
  colorScheme: ColorSchemeName
): NoteFlowColors {
  return colorScheme === 'dark' ? colorsDark : colorsLight;
}

const paletteLight = {
  primary: colorsLight.accent,
  onPrimary: '#FFFFFF',
  primaryContainer: '#E8DDFF',
  onPrimaryContainer: '#1E1147',
  secondary: '#625B71',
  onSecondary: '#FFFFFF',
  background: colorsLight.background,
  surface: colorsLight.surface,
  onSurface: colorsLight.textPrimary,
  onSurfaceVariant: colorsLight.textTertiary,
  outline: colorsLight.borderStrong,
  error: colorsLight.error,
};

const paletteDark = {
  primary: colorsDark.accent,
  onPrimary: '#1E1147',
  primaryContainer: '#4F378B',
  onPrimaryContainer: '#E8DDFF',
  secondary: '#CCC2DC',
  onSecondary: '#332D41',
  background: colorsDark.background,
  surface: colorsDark.surface,
  onSurface: colorsDark.textPrimary,
  onSurfaceVariant: colorsDark.textTertiary,
  outline: colorsDark.borderStrong,
  error: colorsDark.error,
};

/**
 * Tema MD3 de React Native Paper fusionado con tokens NoteFlow.
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
