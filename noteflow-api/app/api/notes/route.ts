import { NextResponse } from 'next/server';
import { z } from 'zod';

import { query } from '@/lib/db';
import { NOTES_LIST_SQL } from '@/lib/noteQueries';

const noteSchema = z.object({
  title: z.string().min(3),
  type: z.enum(['note', 'checklist', 'idea']),
  content: z.string().optional(),
  color: z.string().optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export async function GET() {
  try {
    const notes = await query(NOTES_LIST_SQL);
    return NextResponse.json(notes);
  } catch (error) {
    console.error('[GET /api/notes]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = noteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 });
    }

    const { title, type, content, color, tags } = result.data;
    const [inserted] = await query<{ id: string }>(
      'INSERT INTO notes (title, type, content, color) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, type, content ?? null, color ?? null]
    );

    if (tags?.length) {
      for (const tag of tags) {
        await query('INSERT INTO note_tags (note_id, tag) VALUES ($1, $2)', [
          inserted.id,
          tag,
        ]);
      }
    }

    const [note] = await query(
      `SELECT
        n.*,
        json_agg(ci.*) FILTER (WHERE ci.id IS NOT NULL) AS items,
        json_agg(nt.tag) FILTER (WHERE nt.id IS NOT NULL) AS tags
      FROM notes n
      LEFT JOIN checklist_items ci ON n.id = ci.note_id
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      WHERE n.id = $1
      GROUP BY n.id
      LIMIT 1`,
      [inserted.id]
    );

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('[POST /api/notes]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
