-- Ubicación GPS opcional en notas (enunciado curso: latitude / longitude).
-- Ejecutar en Neon SQL Editor si ya tenías el esquema anterior.

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;
