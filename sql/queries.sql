-- Consultas SQL de referencia para NoteFlow (PostgreSQL / Neon).
-- Esquema base: sql/schema.sql

-- =============================================================================
-- Notas con ítems de checklist y etiquetas agregados en una sola fila por nota
-- =============================================================================
--
-- Objetivo: obtener todas las notas aunque no tengan ítems ni tags (LEFT JOIN).
-- json_agg agrupa filas hijas en arrays JSON; FILTER excluye NULL cuando no hay match.

SELECT
  -- n.*: todas las columnas de la nota (id, title, content, type, color, fechas).
  n.*,

  -- json_agg(ci.*): agrupa cada fila de checklist_items en un array JSON.
  -- FILTER (WHERE ci.id IS NOT NULL): si la nota no tiene ítems, el LEFT JOIN
  -- produce NULL en ci.*; sin FILTER el array sería [null] en lugar de [].
  json_agg(ci.*) FILTER (WHERE ci.id IS NOT NULL) AS items,

  -- json_agg(nt.tag): mismo patrón para etiquetas (solo el texto del tag).
  json_agg(nt.tag) FILTER (WHERE nt.id IS NOT NULL) AS tags

FROM notes n

-- LEFT JOIN: devuelve TODAS las filas de notes (tabla izquierda) y, cuando exista
-- coincidencia, las columnas de checklist_items. Si no hay ítems, ci.* es NULL.
LEFT JOIN checklist_items ci ON n.id = ci.note_id

-- Segundo LEFT JOIN: igual para note_tags; una nota puede tener 0, 1 o N tags.
LEFT JOIN note_tags nt ON n.id = nt.note_id

-- GROUP BY n.id: obligatorio al usar agregados (json_agg); una fila por nota.
GROUP BY n.id

-- Orden cronológico: las notas más recientes primero.
ORDER BY n.created_at DESC;
