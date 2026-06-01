/**
 * Estado de autenticación con Firebase Auth + perfil en Firestore.
 */
import { create } from 'zustand';

import {
  FirebaseAuthError,
  loginWithEmail,
  logoutFirebase,
  registerWithProfile,
  type FirebaseAuthUser,
} from '../lib/firebaseAuth';
import { setApiAuthToken } from '../lib/api';
import { clearAuthToken, clearAuthUser } from '../lib/authStorage';
import { uploadToAWS } from '../lib/uploadToAWS';
import { updateUserAvatarUrl } from '../lib/userProfile';
import { pickImageFromGallery } from '../utils/imagePicker';

export type AuthUser = FirebaseAuthUser;

interface AuthStore {
  user: AuthUser | null;
  isReady: boolean;
  isAuthenticated: boolean;
  error: string | null;
  /** Sincroniza sesión tras auth().onAuthStateChanged en _layout. */
  syncSession: (user: FirebaseAuthUser | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  /** Galería → uploadToAWS (stub) → Firestore avatarUrl. */
  changeProfilePhoto: () => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isReady: false,
  isAuthenticated: false,
  error: null,

  syncSession: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isReady: true,
      error: null,
    });
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      await loginWithEmail(email, password);
      return true;
    } catch (error) {
      const message =
        error instanceof FirebaseAuthError ? error.message : 'Error al iniciar sesión';
      set({ error: message });
      return false;
    }
  },

  register: async (email, password, name) => {
    set({ error: null });
    try {
      await registerWithProfile(email, password, name);
      return true;
    } catch (error) {
      const message =
        error instanceof FirebaseAuthError ? error.message : 'Error al registrarse';
      set({ error: message });
      return false;
    }
  },

  changeProfilePhoto: async () => {
    const currentUser = get().user;
    if (!currentUser) {
      set({ error: 'Debes iniciar sesión para cambiar la foto' });
      return false;
    }

    set({ error: null });

    try {
      const picked = await pickImageFromGallery();
      if (!picked) return false;

      const avatarUrl = await uploadToAWS(picked.uri);
      await updateUserAvatarUrl(currentUser.id, avatarUrl);

      set({
        user: { ...currentUser, avatarUrl },
        error: null,
      });
      return true;
    } catch {
      set({ error: 'No se pudo actualizar la foto de perfil' });
      return false;
    }
  },

  logout: async () => {
    await logoutFirebase();
    await clearAuthToken();
    await clearAuthUser();
    setApiAuthToken(null);
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
