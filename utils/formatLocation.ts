/**
 * Texto legible para coordenadas guardadas en una nota.
 */
import type { BaseNote } from '../types';

export function formatLocationLabel(
  note: Pick<BaseNote, 'latitude' | 'longitude' | 'locationName'>
): string | null {
  if (note.locationName?.trim()) {
    return note.locationName.trim();
  }

  if (note.latitude != null && note.longitude != null) {
    return `${note.latitude.toFixed(5)}, ${note.longitude.toFixed(5)}`;
  }

  return null;
}
