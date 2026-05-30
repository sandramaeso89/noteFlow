import { NextResponse } from 'next/server';
import { z } from 'zod';

import { isAuthError, requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { NOTE_BY_ID_SQL } from '@/lib/noteQueries';

const paramsSchema = z.object({
  id: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      'El id debe ser un UUID válido'
    ),
});

const patchSchema = z
  .object({
    title: z.string().min(3).optional(),
    type: z.enum(['note', 'checklist', 'idea']).optional(),
    content: z.string().optional(),
    color: z.string().optional(),
    is_archived: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  });

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const rawParams = await context.params;
    const parsedParams = paramsSchema.safeParse(rawParams);
    if (!parsedParams.success) {
      return NextResponse.json({ errors: parsedParams.error.issues }, { status: 400 });
    }

    const [note] = await query(NOTE_BY_ID_SQL, [auth.userId, parsedParams.data.id]);
    if (!note) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('[GET /api/notes/:id]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const rawParams = await context.params;
    const parsedParams = paramsSchema.safeParse(rawParams);
    if (!parsedParams.success) {
      return NextResponse.json({ errors: parsedParams.error.issues }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = patchSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ errors: parsedBody.error.issues }, { status: 400 });
    }

    const setClauses: string[] = [];
    const values: unknown[] = [];

    if (parsedBody.data.title !== undefined) {
      values.push(parsedBody.data.title);
      setClauses.push(`title = $${values.length + 2}`);
    }
    if (parsedBody.data.type !== undefined) {
      values.push(parsedBody.data.type);
      setClauses.push(`type = $${values.length + 2}`);
    }
    if (parsedBody.data.content !== undefined) {
      values.push(parsedBody.data.content);
      setClauses.push(`content = $${values.length + 2}`);
    }
    if (parsedBody.data.color !== undefined) {
      values.push(parsedBody.data.color);
      setClauses.push(`color = $${values.length + 2}`);
    }
    if (parsedBody.data.is_archived !== undefined) {
      values.push(parsedBody.data.is_archived);
      setClauses.push(`is_archived = $${values.length + 2}`);
    }

    const sql = `
      UPDATE notes
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE id = $1 AND user_id = $${values.length + 2}
      RETURNING id
    `;

    const updated = await query<{ id: string }>(sql, [
      parsedParams.data.id,
      ...values,
      auth.userId,
    ]);
    if (updated.length === 0) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    const [note] = await query(NOTE_BY_ID_SQL, [auth.userId, parsedParams.data.id]);
    if (!note) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('[PATCH /api/notes/:id]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const rawParams = await context.params;
    const parsedParams = paramsSchema.safeParse(rawParams);
    if (!parsedParams.success) {
      return NextResponse.json({ errors: parsedParams.error.issues }, { status: 400 });
    }

    const deleted = await query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [parsedParams.data.id, auth.userId]
    );
    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[DELETE /api/notes/:id]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
