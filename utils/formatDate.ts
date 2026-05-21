/**
 * Formateo de fechas en español para tarjetas y pies de checklist.
 */
const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
});

const timeFormatter = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
});

/** Etiqueta corta para tarjetas: "Hoy, 09:30" o "12 may". */
export function formatNoteCardDate(date: Date): string {
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Hoy, ${timeFormatter.format(date)}`;
  }

  return dateFormatter.format(date);
}

/** Pie de checklist: "Actualizado hoy, 08:15". */
export function formatUpdatedLabel(date: Date): string {
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Actualizado hoy, ${timeFormatter.format(date)}`;
  }

  return `Actualizado ${dateFormatter.format(date)}`;
}
