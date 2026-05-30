/**
 * Cliente HTTP para registro e inicio de sesión.
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export class AuthApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseAuthJson<T>(res: Response, fallback: string): Promise<T> {
  const data = (await res.json()) as T & { error?: string; errors?: unknown };
  if (!res.ok) {
    const message =
      typeof data.error === 'string'
        ? data.error
        : res.status === 401
          ? 'Credenciales incorrectas'
          : fallback;
    throw new AuthApiError(message, res.status);
  }
  return data;
}

export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseAuthJson<AuthResponse>(res, 'Error al registrarse');
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseAuthJson<AuthResponse>(res, 'Error al iniciar sesión');
}
