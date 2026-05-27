/**
 * Cliente SQL serverless hacia Neon PostgreSQL (API Next.js de noteflow-api).
 * Usar query() con parámetros ($1, $2…) para evitar inyección SQL.
 */
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Ejecuta SQL parametrizado contra Neon (PostgreSQL).
 * Usa sql.query() del driver serverless ($1, $2, …).
 */
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await sql(text, params);
  return result as T[];
}
