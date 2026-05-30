/**
 * Autenticación JWT y utilidades para proteger rutas de la API.
 */
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

const JWT_EXPIRY = '7d';
const BCRYPT_ROUNDS = 12;

export type AuthUser = {
  userId: string;
  email: string;
};

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET no configurado o demasiado corto (mín. 32 caracteres)');
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

/** Firma un JWT con el id y email del usuario. */
export async function signAccessToken(user: AuthUser): Promise<string> {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.userId)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getJwtSecret());
}

/** Verifica el JWT y devuelve userId + email, o null si es inválido. */
export async function verifyAccessToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const userId = payload.sub;
    const email = payload.email;
    if (typeof userId !== 'string' || typeof email !== 'string') return null;
    return { userId, email };
  } catch {
    return null;
  }
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

/** Exige Authorization: Bearer válido; devuelve usuario o respuesta 401. */
export async function requireAuth(
  request: Request
): Promise<AuthUser | NextResponse> {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const user = await verifyAccessToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
  }

  return user;
}

export function isAuthError(result: AuthUser | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
