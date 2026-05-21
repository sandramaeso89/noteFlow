/**
 * Generación de ids únicos locales (prefijo + timestamp + aleatorio).
 * No sustituye UUID de servidor; suficiente para datos offline en el dispositivo.
 */
export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
