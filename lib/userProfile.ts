/**
 * Perfil de usuario en Firestore (colección users).
 */
import firestore from '@react-native-firebase/firestore';

/** Actualiza avatarUrl del documento users/{uid}. */
export async function updateUserAvatarUrl(
  userId: string,
  avatarUrl: string
): Promise<void> {
  await firestore().collection('users').doc(userId).update({ avatarUrl });
}
