import { NextResponse } from 'next/server';
import { z } from 'zod';

import { hashPassword, signAccessToken } from '@/lib/auth';
import { query } from '@/lib/db';

const registerSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const passwordHash = await hashPassword(parsed.data.password);

    const [user] = await query<{ id: string; email: string }>(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email`,
      [email, passwordHash]
    );

    const token = await signAccessToken({ userId: user.id, email: user.email });

    return NextResponse.json(
      {
        token,
        user: { id: user.id, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    const pgCode =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code: string }).code)
        : '';

    if (pgCode === '23505') {
      return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 409 });
    }

    console.error('[POST /api/auth/register]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
