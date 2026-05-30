/**
 * Cliente SQL serverless hacia Neon PostgreSQL (API Next.js de noteflow-api).
 * Usar query() con parámetros ($1, $2…) para evitar inyección SQL.
 */
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

// Lazy init: evita fallo en `next build` de Vercel si DATABASE_URL no existe aún en build time.
let sql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL no configurada. Añádela en Vercel → Environment Variables o en .env.local'
    );
  }
  if (!sql) {
    sql = neon(url);
  }
  return sql;
}

/**
 * Ejecuta SQL parametrizado contra Neon (PostgreSQL).
 * Usa sql.query() del driver serverless ($1, $2, …).
 */
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const client = getSql();
  const result = params?.length
    ? await client.query(text, params)
    : await client.query(text);
  return result as T[];
}
