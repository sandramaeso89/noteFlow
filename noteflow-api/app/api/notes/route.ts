import { NextResponse } from 'next/server';
import { z } from 'zod';

import { isAuthError, requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { NOTE_BY_ID_SQL, NOTES_LIST_SQL } from '@/lib/noteQueries';

const noteSchema = z.object({
  title: z.string().min(3),
  type: z.enum(['note', 'checklist', 'idea']),
  content: z.string().optional(),
  color: z.string().optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  latitude: z.number().finite().optional(),
  longitude: z.number().finite().optional(),
});

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const notes = await query(NOTES_LIST_SQL, [auth.userId]);
    return NextResponse.json(notes);
  } catch (error) {
    console.error('[GET /api/notes]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const result = noteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 });
    }

    const { title, type, content, color, tags, latitude, longitude } = result.data;
    const [inserted] = await query<{ id: string }>(
      `INSERT INTO notes (user_id, title, type, content, color, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        auth.userId,
        title,
        type,
        content ?? null,
        color ?? null,
        latitude ?? null,
        longitude ?? null,
      ]
    );

    if (tags?.length) {
      for (const tag of tags) {
        await query('INSERT INTO note_tags (note_id, tag) VALUES ($1, $2)', [
          inserted.id,
          tag,
        ]);
      }
    }

    const [note] = await query(NOTE_BY_ID_SQL, [auth.userId, inserted.id]);
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('[POST /api/notes]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
