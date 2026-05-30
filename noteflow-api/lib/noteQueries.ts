/**
 * Consultas SQL reutilizables para notas con relaciones (ítems y tags).
 * Todas filtran por user_id del JWT autenticado.
 */
export const NOTES_WITH_RELATIONS_SELECT = `
SELECT
  n.*,
  json_agg(ci.*) FILTER (WHERE ci.id IS NOT NULL) AS items,
  json_agg(nt.tag) FILTER (WHERE nt.id IS NOT NULL) AS tags
FROM notes n
LEFT JOIN checklist_items ci ON n.id = ci.note_id
LEFT JOIN note_tags nt ON n.id = nt.note_id
WHERE n.user_id = $1
`;

export const NOTES_LIST_SQL = `
${NOTES_WITH_RELATIONS_SELECT}
GROUP BY n.id
ORDER BY n.created_at DESC
`;

export const NOTE_BY_ID_SQL = `
${NOTES_WITH_RELATIONS_SELECT}
AND n.id = $2
GROUP BY n.id
LIMIT 1
`;

/** Comprueba que una nota pertenece al usuario antes de operar sobre ella. */
export const NOTE_OWNERSHIP_SQL =
  'SELECT id FROM notes WHERE id = $1 AND user_id = $2 LIMIT 1';

/** Comprueba que un ítem de checklist pertenece a una nota del usuario. */
export const CHECKLIST_ITEM_OWNERSHIP_SQL = `
SELECT ci.id
FROM checklist_items ci
INNER JOIN notes n ON n.id = ci.note_id
WHERE ci.id = $1 AND n.user_id = $2
LIMIT 1
`;
