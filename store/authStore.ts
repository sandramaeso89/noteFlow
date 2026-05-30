/**
 * Estado de autenticación (JWT). El token persiste en SecureStore, no en AsyncStorage.
 */
import { create } from 'zustand';

import { AuthApiError, loginUser, registerUser, type AuthUser } from '../lib/authApi';
import {
  clearAuthToken,
  clearAuthUser,
  getAuthToken,
  getAuthUser,
  saveAuthToken,
  saveAuthUser,
} from '../lib/authStorage';
import { setApiAuthToken } from '../lib/api';

interface AuthStore {
  user: AuthUser | null;
  isReady: boolean;
  isAuthenticated: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isReady: false,
  isAuthenticated: false,
  error: null,

  bootstrap: async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        const user = await getAuthUser();
        setApiAuthToken(token);
        set({
          user,
          isAuthenticated: true,
          isReady: true,
          error: null,
        });
        return;
      }
      setApiAuthToken(null);
      set({ user: null, isAuthenticated: false, isReady: true, error: null });
    } catch {
      setApiAuthToken(null);
      set({ user: null, isAuthenticated: false, isReady: true, error: null });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const { token, user } = await loginUser(email, password);
      await saveAuthToken(token);
      await saveAuthUser(user);
      setApiAuthToken(token);
      set({ user, isAuthenticated: true, error: null });
      return true;
    } catch (error) {
      const message =
        error instanceof AuthApiError ? error.message : 'Error al iniciar sesión';
      set({ error: message });
      return false;
    }
  },

  register: async (email, password) => {
    set({ error: null });
    try {
      const { token, user } = await registerUser(email, password);
      await saveAuthToken(token);
      await saveAuthUser(user);
      setApiAuthToken(token);
      set({ user, isAuthenticated: true, error: null });
      return true;
    } catch (error) {
      const message =
        error instanceof AuthApiError ? error.message : 'Error al registrarse';
      set({ error: message });
      return false;
    }
  },

  logout: async () => {
    await clearAuthToken();
    await clearAuthUser();
    setApiAuthToken(null);
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
