/**
 * Tras Firebase Auth, obtiene JWT de noteflow-api para que las notas REST funcionen.
 * Si el usuario solo existe en Firebase, registra el mismo email en la API (Neon).
 */
import { loginUser, registerUser, AuthApiError } from './authApi';
import { setApiAuthToken } from './api';
import { saveAuthToken, saveAuthUser } from './authStorage';

async function persistApiSession(token: string, user: { id: string; email: string }): Promise<void> {
  await saveAuthToken(token);
  await saveAuthUser(user);
  setApiAuthToken(token);
}

/**
 * Login en API; si no existe cuenta Neon, la crea con las mismas credenciales.
 * Devuelve false si la API no responde (Firebase sigue válido).
 */
export async function syncApiAuthForFirebaseUser(
  email: string,
  password: string
): Promise<boolean> {
  const trimmedEmail = email.trim();

  try {
    const session = await loginUser(trimmedEmail, password);
    await persistApiSession(session.token, session.user);
    return true;
  } catch (loginError) {
    const shouldRegister =
      loginError instanceof AuthApiError &&
      (loginError.status === 401 || loginError.status === 404);

    if (!shouldRegister) {
      return false;
    }
  }

  try {
    const session = await registerUser(trimmedEmail, password);
    await persistApiSession(session.token, session.user);
    return true;
  } catch (registerError) {
    if (registerError instanceof AuthApiError && registerError.status === 409) {
      try {
        const session = await loginUser(trimmedEmail, password);
        await persistApiSession(session.token, session.user);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}
