/**
 * Hook que expone tokens de color NoteFlow según el tema claro/oscuro del sistema.
 * Preferir esto frente a leer theme.ts directamente en componentes de UI.
 */
import { useColorScheme } from 'react-native';

import { getNoteFlowColors, type NoteFlowColors } from '../constants/theme';

export function useNoteFlowColors(): NoteFlowColors {
  const scheme = useColorScheme();
  return getNoteFlowColors(scheme ?? 'light');
}
