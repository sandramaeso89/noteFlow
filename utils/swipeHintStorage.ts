/**
 * Persistencia del banner de ayuda «desliza para eliminar» (solo primera vez).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const SWIPE_HINT_KEY = 'noteflow-swipe-hint-dismissed';

export async function isSwipeHintDismissed(): Promise<boolean> {
  const value = await AsyncStorage.getItem(SWIPE_HINT_KEY);
  return value === '1';
}

export async function dismissSwipeHint(): Promise<void> {
  await AsyncStorage.setItem(SWIPE_HINT_KEY, '1');
}
