import type { ChecklistNote, IdeaNote, Note } from '../types';

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
  },
  {
    id: 'demo-2',
    title: 'Kickoff Q2 — equipo diseño',
    content: 'Presentar roadmap, acordar entregables semanales y canal de feedback.',
    createdAt: daysAgo(2, 14, 0),
    updatedAt: daysAgo(1, 11, 15),
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
  },
  {
    id: 'idea-b',
    title: 'Integración calendario',
    tags: ['PRODUCTO', 'V2'],
    color: '#E4E8ED',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(0, 18, 20),
  },
];
