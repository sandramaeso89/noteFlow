/**
 * Utilidades de cierre de sesión tras errores 401 en la API REST (fase anterior).
 */
import { router } from 'expo-router';

import { useAuthStore } from '../store/authStore';
import { useNotesStore } from '../store/notesStore';

/** Llamar tras 401 en peticiones API para cerrar sesión de forma segura. */
export async function handleApiUnauthorized(): Promise<void> {
  await useAuthStore.getState().logout();
  useNotesStore.getState().resetForLogout();
  router.replace('/login');
}
