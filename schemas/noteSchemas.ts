import { z } from 'zod';

export const noteFormSchema = z.object({
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres'),
  content: z.string().trim().min(1, 'El contenido no puede estar vacío'),
});

export const checklistFormSchema = z.object({
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres'),
  items: z
    .array(
      z.object({
        text: z.string().trim().min(1, 'El ítem no puede estar vacío'),
      })
    )
    .min(1, 'Añade al menos un ítem'),
});

export const ideaFormSchema = z.object({
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres'),
  tagsInput: z.string().trim().min(1, 'Añade al menos una etiqueta'),
  color: z.string().min(1, 'Elige un color'),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;
export type ChecklistFormValues = z.infer<typeof checklistFormSchema>;
export type IdeaFormValues = z.infer<typeof ideaFormSchema>;

/** Colores curados para ideas (alineados con docs/diseno-ui.md). */
export const IDEA_COLOR_OPTIONS = [
  '#EDE8E0',
  '#E4E8ED',
  '#E8E4ED',
  '#E0EDE8',
  '#EDE0E4',
  '#F2F2F5',
] as const;

/** Convierte errores de Zod en mapa campo → mensaje. */
export function zodFieldErrors(
  error: z.ZodError
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
