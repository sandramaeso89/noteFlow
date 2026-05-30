-- Migración: autenticación de usuarios y aislamiento de notas por user_id.
-- Ejecutar SOLO en Neon → SQL Editor (consola web).
-- NO pegar aquí JWT_SECRET ni DATABASE_URL (van en noteflow-api/.env.local).

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Opcional: borrar datos demo sin dueño (descomenta si quieres empezar limpio)
-- DELETE FROM notes WHERE user_id IS NULL;
