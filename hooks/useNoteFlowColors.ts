import { useColorScheme } from 'react-native';

import { getNoteFlowColors, type NoteFlowColors } from '../constants/theme';

export function useNoteFlowColors(): NoteFlowColors {
  const scheme = useColorScheme();
  return getNoteFlowColors(scheme ?? 'light');
}
