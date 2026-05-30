/**
 * Consultas SQL reutilizables para notas con relaciones (ítems y tags).
 */
export const NOTES_WITH_RELATIONS_SELECT = `
SELECT
  n.*,
  json_agg(ci.*) FILTER (WHERE ci.id IS NOT NULL) AS items,
  json_agg(nt.tag) FILTER (WHERE nt.id IS NOT NULL) AS tags
FROM notes n
LEFT JOIN checklist_items ci ON n.id = ci.note_id
LEFT JOIN note_tags nt ON n.id = nt.note_id
`;

export const NOTES_LIST_SQL = `
${NOTES_WITH_RELATIONS_SELECT}
GROUP BY n.id
ORDER BY n.created_at DESC
`;

export const NOTE_BY_ID_SQL = `
${NOTES_WITH_RELATIONS_SELECT}
WHERE n.id = $1
GROUP BY n.id
LIMIT 1
`;
