/**
 * Subida a AWS S3 — pendiente de la fase del tutor.
 * Por ahora devuelve la URI local tras validar que existe.
 */
export async function uploadToAWS(localUri: string): Promise<string> {
  if (!localUri.trim()) {
    throw new Error('URI de imagen vacía');
  }
  // TODO(curso): subir a S3 y devolver URL pública cuando el tutor lo indique.
  return localUri;
}
