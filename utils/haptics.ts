import * as Haptics from 'expo-haptics';

/** Feedback al archivar o eliminar definitivamente. */
export async function hapticImpactLight(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Simulador o dispositivo sin motor háptico
  }
}

/** Feedback al completar todos los ítems de una checklist. */
export async function hapticSuccess(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Sin hardware háptico
  }
}
