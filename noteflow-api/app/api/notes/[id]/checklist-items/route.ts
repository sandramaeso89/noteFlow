import { NextResponse } from 'next/server';
import { z } from 'zod';

import { isAuthError, requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { NOTE_OWNERSHIP_SQL } from '@/lib/noteQueries';

const paramsSchema = z.object({
  id: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      'El id debe ser un UUID válido'
    ),
});

const postSchema = z.object({
  text: z.string().min(1, 'El texto del ítem es obligatorio').max(255),
  is_completed: z.boolean().optional().default(false),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic';

/** Lista los ítems de checklist asociados a una nota del usuario. */
export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const rawParams = await context.params;
    const parsedParams = paramsSchema.safeParse(rawParams);
    if (!parsedParams.success) {
      return NextResponse.json({ errors: parsedParams.error.issues }, { status: 400 });
    }

    const noteId = parsedParams.data.id;

    const [note] = await query(NOTE_OWNERSHIP_SQL, [noteId, auth.userId]);
    if (!note) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    const items = await query(
      'SELECT * FROM checklist_items WHERE note_id = $1 ORDER BY id',
      [noteId]
    );

    return NextResponse.json(items);
  } catch (error) {
    console.error('[GET /api/notes/:id/checklist-items]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

/** Crea un ítem de checklist vinculado a la nota indicada en la ruta. */
export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const rawParams = await context.params;
    const parsedParams = paramsSchema.safeParse(rawParams);
    if (!parsedParams.success) {
      return NextResponse.json({ errors: parsedParams.error.issues }, { status: 400 });
    }

    const noteId = parsedParams.data.id;

    const [note] = await query(NOTE_OWNERSHIP_SQL, [noteId, auth.userId]);
    if (!note) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    const body = await request.json();
    const parsedBody = postSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ errors: parsedBody.error.issues }, { status: 400 });
    }

    const { text, is_completed } = parsedBody.data;
    const [item] = await query(
      'INSERT INTO checklist_items (note_id, text, is_completed) VALUES ($1, $2, $3) RETURNING *',
      [noteId, text, is_completed]
    );

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('[POST /api/notes/:id/checklist-items]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
