/**
 * Autenticación Firebase (email/contraseña) y perfil de usuario en Firestore.
 */
import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export type FirebaseAuthUser = {
  id: string;
  email: string;
  name?: string | null;
};

export class FirebaseAuthError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'FirebaseAuthError';
    this.code = code;
  }
}

/** Traduce códigos de Firebase Auth a mensajes en español para la UI. */
function mapFirebaseError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: string }).code)
      : 'unknown';

  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/invalid-email': 'Email no válido',
    'auth/weak-password': 'La contraseña debe tener al menos 8 caracteres',
    'auth/user-not-found': 'No existe una cuenta con este email',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-credential': 'Email o contraseña incorrectos',
    'auth/too-many-requests': 'Demasiados intentos. Prueba más tarde',
  };

  return messages[code] ?? 'Error de autenticación. Inténtalo de nuevo';
}

function getErrorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: string }).code);
  }
  return 'unknown';
}

/** Lee nombre del perfil en Firestore si existe. */
async function fetchUserProfile(userId: string): Promise<FirebaseAuthUser | null> {
  const snapshot = await firestore().collection('users').doc(userId).get();
  if (!snapshot.exists) return null;

  const data = snapshot.data();
  const firebaseUser = auth().currentUser;
  if (!firebaseUser) return null;

  return {
    id: userId,
    email: firebaseUser.email ?? (typeof data?.email === 'string' ? data.email : ''),
    name: typeof data?.name === 'string' ? data.name : null,
  };
}

/**
 * Registro: crea usuario en Auth y documento en users/{uid} (enunciado del tutor).
 */
export async function registerWithProfile(
  email: string,
  password: string,
  name: string
): Promise<FirebaseAuthUser> {
  const trimmedEmail = email.trim();
  const trimmedName = name.trim();

  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      trimmedEmail,
      password
    );
    const userId = userCredential.user.uid;

    await firestore().collection('users').doc(userId).set({
      name: trimmedName,
      email: trimmedEmail,
      createdAt: firestore.FieldValue.serverTimestamp(),
      avatarUrl: null,
    });

    return {
      id: userId,
      email: trimmedEmail,
      name: trimmedName,
    };
  } catch (error) {
    throw new FirebaseAuthError(mapFirebaseError(error), getErrorCode(error));
  }
}

/** Inicio de sesión con email y contraseña. */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<FirebaseAuthUser> {
  const trimmedEmail = email.trim();

  try {
    const userCredential = await auth().signInWithEmailAndPassword(trimmedEmail, password);
    const profile = await fetchUserProfile(userCredential.user.uid);

    return (
      profile ?? {
        id: userCredential.user.uid,
        email: userCredential.user.email ?? trimmedEmail,
        name: null,
      }
    );
  } catch (error) {
    throw new FirebaseAuthError(mapFirebaseError(error), getErrorCode(error));
  }
}

/** Cierra la sesión de Firebase Auth. */
export async function logoutFirebase(): Promise<void> {
  await auth().signOut();
}

/** Resuelve usuario de app a partir del usuario de Firebase Auth (incluye perfil Firestore). */
export async function resolveSessionUser(
  firebaseUser: FirebaseAuthTypes.User | null
): Promise<FirebaseAuthUser | null> {
  if (!firebaseUser) return null;

  try {
    const profile = await fetchUserProfile(firebaseUser.uid);
    return (
      profile ?? {
        id: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        name: null,
      }
    );
  } catch {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      name: null,
    };
  }
}

/** Escucha cambios de sesión (arranque en frío y login/logout). */
export function subscribeToAuthState(
  callback: (user: FirebaseAuthUser | null) => void
): () => void {
  return auth().onAuthStateChanged((firebaseUser) => {
    void resolveSessionUser(firebaseUser).then(callback);
  });
}
