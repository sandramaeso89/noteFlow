/**
 * Token JWT en expo-secure-store (Keychain iOS / Keystore Android).
 * No usar AsyncStorage: no cifra datos sensibles.
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'noteflow_auth_token';
const USER_KEY = 'noteflow_auth_user';

export type StoredAuthUser = {
  id: string;
  email: string;
};

async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function saveAuthToken(token: string): Promise<void> {
  await setSecureItem(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return getSecureItem(TOKEN_KEY);
}

export async function clearAuthToken(): Promise<void> {
  await deleteSecureItem(TOKEN_KEY);
}

export async function saveAuthUser(user: StoredAuthUser): Promise<void> {
  await setSecureItem(USER_KEY, JSON.stringify(user));
}

export async function getAuthUser(): Promise<StoredAuthUser | null> {
  const raw = await getSecureItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredAuthUser;
    if (typeof parsed.id === 'string' && typeof parsed.email === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearAuthUser(): Promise<void> {
  await deleteSecureItem(USER_KEY);
}
