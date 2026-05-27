import { NextResponse } from 'next/server';
import { z } from 'zod';

import { query } from '@/lib/db';

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
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  });

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const rawParams = await context.params;
    const parsedParams = paramsSchema.safeParse(rawParams);
    if (!parsedParams.success) {
      return NextResponse.json({ errors: parsedParams.error.issues }, { status: 400 });
    }

    const [note] = await query('SELECT * FROM notes WHERE id = $1 LIMIT 1', [parsedParams.data.id]);
    if (!note) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    // Log solo servidor para diagnosticar fallos de BD sin filtrar detalle al cliente.
    console.error('[GET /api/notes/:id]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
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
      setClauses.push(`title = $${values.length + 1}`);
    }
    if (parsedBody.data.type !== undefined) {
      values.push(parsedBody.data.type);
      setClauses.push(`type = $${values.length + 1}`);
    }
    if (parsedBody.data.content !== undefined) {
      values.push(parsedBody.data.content);
      setClauses.push(`content = $${values.length + 1}`);
    }
    if (parsedBody.data.color !== undefined) {
      values.push(parsedBody.data.color);
      setClauses.push(`color = $${values.length + 1}`);
    }

    const sql = `
      UPDATE notes
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const [note] = await query(sql, [parsedParams.data.id, ...values]);
    if (!note) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    // Log solo servidor para diagnosticar fallos de BD sin filtrar detalle al cliente.
    console.error('[PATCH /api/notes/:id]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const rawParams = await context.params;
    const parsedParams = paramsSchema.safeParse(rawParams);
    if (!parsedParams.success) {
      return NextResponse.json({ errors: parsedParams.error.issues }, { status: 400 });
    }

    const deleted = await query('DELETE FROM notes WHERE id = $1 RETURNING id', [parsedParams.data.id]);
    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Log solo servidor para diagnosticar fallos de BD sin filtrar detalle al cliente.
    console.error('[DELETE /api/notes/:id]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
