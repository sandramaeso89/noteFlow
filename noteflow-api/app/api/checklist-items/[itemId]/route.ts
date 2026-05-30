import { NextResponse } from 'next/server';
import { z } from 'zod';

import { isAuthError, requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { CHECKLIST_ITEM_OWNERSHIP_SQL } from '@/lib/noteQueries';

const paramsSchema = z.object({
  itemId: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      'El id debe ser un UUID válido'
    ),
});

const patchSchema = z.object({
  is_completed: z.boolean(),
});

type RouteContext = {
  params: Promise<{ itemId: string }>;
};

export const dynamic = 'force-dynamic';

/** Marca o desmarca un ítem de checklist (campo is_completed). */
export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const rawParams = await context.params;
    const parsedParams = paramsSchema.safeParse(rawParams);
    if (!parsedParams.success) {
      return NextResponse.json({ errors: parsedParams.error.issues }, { status: 400 });
    }

    const [owned] = await query(CHECKLIST_ITEM_OWNERSHIP_SQL, [
      parsedParams.data.itemId,
      auth.userId,
    ]);
    if (!owned) {
      return NextResponse.json({ error: 'Ítem no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const parsedBody = patchSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ errors: parsedBody.error.issues }, { status: 400 });
    }

    const [item] = await query(
      'UPDATE checklist_items SET is_completed = $1 WHERE id = $2 RETURNING *',
      [parsedBody.data.is_completed, parsedParams.data.itemId]
    );

    if (!item) {
      return NextResponse.json({ error: 'Ítem no encontrado' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('[PATCH /api/checklist-items/:itemId]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

/** Elimina un ítem de checklist de forma definitiva. */
export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const rawParams = await context.params;
    const parsedParams = paramsSchema.safeParse(rawParams);
    if (!parsedParams.success) {
      return NextResponse.json({ errors: parsedParams.error.issues }, { status: 400 });
    }

    const [owned] = await query(CHECKLIST_ITEM_OWNERSHIP_SQL, [
      parsedParams.data.itemId,
      auth.userId,
    ]);
    if (!owned) {
      return NextResponse.json({ error: 'Ítem no encontrado' }, { status: 404 });
    }

    const deleted = await query(
      'DELETE FROM checklist_items WHERE id = $1 RETURNING id',
      [parsedParams.data.itemId]
    );

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Ítem no encontrado' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[DELETE /api/checklist-items/:itemId]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
