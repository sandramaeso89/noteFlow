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
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
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

  logout: async () => {
    await logoutFirebase();
    await clearAuthToken();
    await clearAuthUser();
    setApiAuthToken(null);
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
