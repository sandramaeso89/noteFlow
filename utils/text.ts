/**
 * Recorte de texto para previews en tarjetas sin desbordar una línea.
 */
export function truncate(text: string, maxLength = 72): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trim()}…`;
}
