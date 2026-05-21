import type { ChecklistNote, IdeaNote, Note } from '../types';

/** Pon `true` solo para auditar scroll con 50+ ítems en simulador. */
export const ENABLE_STRESS_SEED = false;

const STRESS_COUNT = 55;

function daysAgo(days: number, hour = 10, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export const seedNotes: Note[] = [
  {
    id: 'demo-1',
    title: 'Arquitectura brutalista en proyectos',
    content:
      'Retomar referencias visuales y definir paleta de grises para la próxima revisión con el equipo.',
    createdAt: daysAgo(0, 9, 30),
    updatedAt: daysAgo(0, 9, 30),
    isArchived: false,
  },
  {
    id: 'demo-2',
    title: 'Kickoff Q2 — equipo diseño',
    content: 'Presentar roadmap, acordar entregables semanales y canal de feedback.',
    createdAt: daysAgo(2, 14, 0),
    updatedAt: daysAgo(1, 11, 15),
    isArchived: false,
  },
];

export const seedChecklists: ChecklistNote[] = [
  {
    id: 'lista-1',
    title: 'Planejamiento do projeto',
    items: [
      { id: 'i1', text: 'Definir alcance MVP', isCompleted: true },
      { id: 'i2', text: 'Revisar mockups', isCompleted: true },
      { id: 'i3', text: 'Sincronizar con tutor', isCompleted: false },
      { id: 'i4', text: 'Preparar demo', isCompleted: false },
      { id: 'i5', text: 'Documentar decisiones UI', isCompleted: false },
    ],
    createdAt: daysAgo(1, 8, 0),
    updatedAt: daysAgo(0, 8, 15),
    isArchived: false,
  },
  {
    id: 'lista-2',
    title: 'Seguimiento reunión cliente',
    items: [
      { id: 'c1', text: 'Enviar acta', isCompleted: true },
      { id: 'c2', text: 'Actualizar Trello', isCompleted: false },
    ],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2, 16, 45),
    isArchived: false,
  },
];

export const seedIdeas: IdeaNote[] = [
  {
    id: 'idea-a',
    title: 'Espacios que inspiran',
    tags: ['ARQUITECTURA', 'CONCEPTO'],
    color: '#EDE8E0',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    isArchived: false,
  },
  {
    id: 'idea-b',
    title: 'Integración calendario',
    tags: ['PRODUCTO', 'V2'],
    color: '#E4E8ED',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(0, 18, 20),
    isArchived: false,
  },
];

function buildStressNotes(): Note[] {
  return Array.from({ length: STRESS_COUNT }, (_, index) => ({
    id: `stress-note-${index}`,
    title: `Nota de prueba ${index + 1}`,
    content: `Contenido generado para auditoría de rendimiento (${index + 1}).`,
    createdAt: daysAgo(index % 30),
    updatedAt: daysAgo(index % 7),
    isArchived: false,
  }));
}

function buildStressChecklists(): ChecklistNote[] {
  return Array.from({ length: STRESS_COUNT }, (_, index) => ({
    id: `stress-checklist-${index}`,
    title: `Checklist de prueba ${index + 1}`,
    items: [
      { id: `s-${index}-a`, text: 'Tarea A', isCompleted: index % 2 === 0 },
      { id: `s-${index}-b`, text: 'Tarea B', isCompleted: false },
    ],
    createdAt: daysAgo(index % 20),
    updatedAt: daysAgo(index % 5),
    isArchived: false,
  }));
}

function buildStressIdeas(): IdeaNote[] {
  return Array.from({ length: STRESS_COUNT }, (_, index) => ({
    id: `stress-idea-${index}`,
    title: `Idea de prueba ${index + 1}`,
    tags: ['TEST', `N${index}`],
    color: index % 2 === 0 ? '#EDE8E0' : '#E4E8ED',
    createdAt: daysAgo(index % 15),
    updatedAt: daysAgo(index % 4),
    isArchived: false,
  }));
}

export function getInitialNotes(): Note[] {
  if (!ENABLE_STRESS_SEED) return seedNotes;
  return [...seedNotes, ...buildStressNotes()];
}

export function getInitialChecklists(): ChecklistNote[] {
  if (!ENABLE_STRESS_SEED) return seedChecklists;
  return [...seedChecklists, ...buildStressChecklists()];
}

export function getInitialIdeas(): IdeaNote[] {
  if (!ENABLE_STRESS_SEED) return seedIdeas;
  return [...seedIdeas, ...buildStressIdeas()];
}
