/**
 * Feedback háptico opcional (Expo Haptics). Silenciado en emulador/simulador.
 */
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';

async function safeHaptic(run: () => Promise<void>): Promise<void> {
  // isDevice es false en emuladores; evita "Call to function…" en Android.
  if (!Constants.isDevice) return;
  try {
    await run();
  } catch {
    // Sin hardware háptico
  }
}

/** Feedback al archivar o eliminar definitivamente. */
export async function hapticImpactLight(): Promise<void> {
  await safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Feedback al completar todos los ítems de una checklist. */
export async function hapticSuccess(): Promise<void> {
  await safeHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  );
}
