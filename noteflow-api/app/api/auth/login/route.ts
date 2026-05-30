import { NextResponse } from 'next/server';
import { z } from 'zod';

import { signAccessToken, verifyPassword } from '@/lib/auth';
import { query } from '@/lib/db';

const loginSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type DbUser = {
  id: string;
  email: string;
  password_hash: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.issues }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();

    const [user] = await query<DbUser>(
      'SELECT id, email, password_hash FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    // Mismo mensaje genérico si no existe o la contraseña falla (evita enumerar emails).
    if (!user || !(await verifyPassword(parsed.data.password, user.password_hash))) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const token = await signAccessToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error('[POST /api/auth/login]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
