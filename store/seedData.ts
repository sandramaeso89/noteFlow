/**
 * Datos de demostración y seed opcional de estrés para probar rendimiento de FlashList.
 * El store usa getInitial*() al arrancar; si AsyncStorage ya tiene datos, los reemplaza.
 *
 * Persona demo: Marta Ruiz — responsable de producto, agenda llena de reuniones
 * (cliente, equipo, 1:1, seguimiento de proyectos).
 */
import type { ChecklistNote, IdeaNote, Note } from '../types';

/** Pon `true` solo para auditar scroll con 50+ ítems en simulador. */
export const ENABLE_STRESS_SEED = false;

/**
 * Sube este número cuando cambies seedNotes/seedChecklists/seedIdeas:
 * la app recarga los datos demo en dispositivos que ya tenían AsyncStorage.
 */
export const DEMO_SEED_VERSION = 2;

const STRESS_COUNT = 55;

// Fecha relativa al día de hoy: las tarjetas muestran "Hoy", "Ayer", etc.
function daysAgo(days: number, hour = 10, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export const seedNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Reunión cliente Acme — revisión Q2',
    content:
      'Acordaron priorizar onboarding y reportes. Pedro envía brief el viernes. Próximo checkpoint: 28/05. Dudan del plazo de integración con su ERP; hay que validar con IT.',
    createdAt: daysAgo(0, 11, 0),
    updatedAt: daysAgo(0, 11, 45),
    isArchived: false,
  },
  {
    id: 'note-2',
    title: 'Daily equipo producto',
    content:
      'Bloqueo en API de facturación (externo). Diseño de checklist casi listo. Demo interna martes 16:00. Ana se incorpora al sprint el lunes.',
    createdAt: daysAgo(0, 9, 15),
    updatedAt: daysAgo(0, 9, 20),
    isArchived: false,
  },
  {
    id: 'note-3',
    title: '1:1 con dirección — carrera y foco',
    content:
      'Feedback positivo en comunicación con cliente. Objetivo trimestre: liderar discovery del módulo analytics. Pedir formación en métricas de producto.',
    createdAt: daysAgo(1, 17, 30),
    updatedAt: daysAgo(1, 18, 0),
    isArchived: false,
  },
  {
    id: 'note-4',
    title: 'Sprint review — NoteFlow interno',
    content:
      'Mostrada persistencia y archivo. Tutor pide auditoría FPS. Siguiente hito: API REST + Neon. Sin incidencias graves en Expo Go.',
    createdAt: daysAgo(2, 15, 0),
    updatedAt: daysAgo(2, 16, 10),
    isArchived: false,
  },
  {
    id: 'note-5',
    title: 'Llamada proveedor hosting',
    content:
      'SLA 99,9 % confirmado. Migración ventana 02:00–04:00 domingo. Guardar contacto soporte: soporte@cloudhost.example — ticket #88421.',
    createdAt: daysAgo(4, 10, 0),
    updatedAt: daysAgo(4, 10, 25),
    isArchived: false,
  },
  {
    id: 'note-6',
    title: 'Kickoff proyecto Delta (cerrado)',
    content:
      'Alcance MVP firmado. Equipo mixto cliente + consultora. Acta enviada por correo el 12/04.',
    createdAt: daysAgo(45, 14, 0),
    updatedAt: daysAgo(40, 9, 0),
    isArchived: true,
  },
];

export const seedChecklists: ChecklistNote[] = [
  {
    id: 'checklist-1',
    title: 'Post-reunión Acme — esta semana',
    items: [
      { id: 'c1-a', text: 'Enviar resumen por email a Pedro y Laura (cliente)', isCompleted: true },
      { id: 'c1-b', text: 'Crear tarjetas en Trello para onboarding', isCompleted: true },
      { id: 'c1-c', text: 'Agendar call con IT sobre ERP', isCompleted: false },
      { id: 'c1-d', text: 'Actualizar roadmap compartido en Notion', isCompleted: false },
      { id: 'c1-e', text: 'Preparar estimación integración para el viernes', isCompleted: false },
    ],
    createdAt: daysAgo(0, 12, 0),
    updatedAt: daysAgo(0, 12, 30),
    isArchived: false,
  },
  {
    id: 'checklist-2',
    title: 'Preparar demo martes (equipo)',
    items: [
      { id: 'c2-a', text: 'Revisar datos demo en la app', isCompleted: true },
      { id: 'c2-b', text: 'Probar flujo archivar + búsqueda', isCompleted: false },
      { id: 'c2-c', text: 'Grabar backup por si falla WiFi en sala', isCompleted: false },
    ],
    createdAt: daysAgo(1, 10, 0),
    updatedAt: daysAgo(0, 8, 0),
    isArchived: false,
  },
  {
    id: 'checklist-3',
    title: 'Seguimiento legal — contrato marco',
    items: [
      { id: 'c3-a', text: 'Revisar cláusula de confidencialidad', isCompleted: true },
      { id: 'c3-b', text: 'Devolver borrador con comentarios', isCompleted: true },
      { id: 'c3-c', text: 'Firma digital pendiente de dirección', isCompleted: false },
    ],
    createdAt: daysAgo(5, 11, 0),
    updatedAt: daysAgo(3, 16, 0),
    isArchived: false,
  },
  {
    id: 'checklist-4',
    title: 'Onboarding nuevo compañero (Ana)',
    items: [
      { id: 'c4-a', text: 'Accesos GitHub y Slack', isCompleted: false },
      { id: 'c4-b', text: 'Sesión producto + NoteFlow', isCompleted: false },
      { id: 'c4-c', text: 'Buddy primera semana: Carlos', isCompleted: false },
    ],
    createdAt: daysAgo(2, 9, 0),
    updatedAt: daysAgo(2, 9, 0),
    isArchived: false,
  },
  {
    id: 'checklist-5',
    title: 'Retrospectiva sprint 12 (archivada)',
    items: [
      { id: 'c5-a', text: 'Recoger feedback del equipo', isCompleted: true },
      { id: 'c5-b', text: 'Publicar acta en Confluence', isCompleted: true },
      { id: 'c5-c', text: 'Cerrar acciones en Jira', isCompleted: true },
    ],
    createdAt: daysAgo(20, 16, 0),
    updatedAt: daysAgo(18, 10, 0),
    isArchived: true,
  },
];

export const seedIdeas: IdeaNote[] = [
  {
    id: 'idea-1',
    title: 'Widget “próxima reunión” en home',
    tags: ['PRODUCTO', 'V2'],
    color: '#E4E8ED',
    createdAt: daysAgo(0, 19, 0),
    updatedAt: daysAgo(0, 19, 0),
    isArchived: false,
  },
  {
    id: 'idea-2',
    title: 'Plantilla nota: reunión 1:1',
    tags: ['PLANTILLA', 'RRHH'],
    color: '#E8E4ED',
    createdAt: daysAgo(1, 12, 0),
    updatedAt: daysAgo(1, 12, 0),
    isArchived: false,
  },
  {
    id: 'idea-3',
    title: 'Enlace dashboard métricas cliente',
    tags: ['REFERENCIA', 'ACME'],
    color: '#EDE8E0',
    createdAt: daysAgo(2, 14, 30),
    updatedAt: daysAgo(2, 14, 30),
    isArchived: false,
  },
  {
    id: 'idea-4',
    title: 'Sync calendario Outlook ↔ NoteFlow',
    tags: ['INTEGRACIÓN', 'BACKLOG'],
    color: '#E0EDE8',
    createdAt: daysAgo(6, 9, 0),
    updatedAt: daysAgo(5, 11, 0),
    isArchived: false,
  },
  {
    id: 'idea-5',
    title: 'Modo “solo voz” post-reunión',
    tags: ['IA', 'EXPERIMENTO'],
    color: '#EDE0E4',
    createdAt: daysAgo(10, 20, 0),
    updatedAt: daysAgo(10, 20, 0),
    isArchived: false,
  },
  {
    id: 'idea-6',
    title: 'Badge “sin acta” reuniones > 48h',
    tags: ['UX', 'ARCHIVADO'],
    color: '#F2F2F5',
    createdAt: daysAgo(30, 10, 0),
    updatedAt: daysAgo(28, 15, 0),
    isArchived: true,
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
