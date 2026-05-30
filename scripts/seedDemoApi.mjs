/**
 * Inserta datos demo en noteflow-api (POST /notes + ítems de checklist).
 * Uso: AUTH_TOKEN=eyJ... node scripts/seedDemoApi.mjs
 */
const BASE = process.env.API_URL ?? 'http://127.0.0.1:3000/api';
const AUTH_TOKEN = process.env.AUTH_TOKEN;

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (AUTH_TOKEN) headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  return headers;
}

async function api(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { ...authHeaders(), ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${options?.method ?? 'GET'} ${path} → ${res.status}: ${body}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const notes = [
  {
    title: 'Reunión cliente Acme — revisión Q2',
    content:
      'Acordaron priorizar onboarding y reportes. Pedro envía brief el viernes. Próximo checkpoint: 28/05. Dudan del plazo de integración con su ERP; hay que validar con IT.',
  },
  {
    title: 'Daily equipo producto',
    content:
      'Bloqueo en API de facturación (externo). Diseño de checklist casi listo. Demo interna martes 16:00. Ana se incorpora al sprint el lunes.',
  },
  {
    title: '1:1 con dirección — carrera y foco',
    content:
      'Feedback positivo en comunicación con cliente. Objetivo trimestre: liderar discovery del módulo analytics. Pedir formación en métricas de producto.',
  },
  {
    title: 'Sprint review — NoteFlow interno',
    content:
      'Mostrada persistencia y archivo. Tutor pide auditoría FPS. Siguiente hito: API REST + Neon. Sin incidencias graves en Expo Go.',
  },
  {
    title: 'Llamada proveedor hosting',
    content:
      'SLA 99,9 % confirmado. Migración ventana 02:00–04:00 domingo. Guardar contacto soporte: soporte@cloudhost.example — ticket #88421.',
  },
  {
    title: 'Kickoff proyecto Delta (cerrado)',
    content:
      'Alcance MVP firmado. Equipo mixto cliente + consultora. Acta enviada por correo el 12/04.',
    archived: true,
  },
];

const checklists = [
  {
    title: 'Post-reunión Acme — esta semana',
    items: [
      { text: 'Enviar resumen por email a Pedro y Laura (cliente)', done: true },
      { text: 'Crear tarjetas en Trello para onboarding', done: true },
      { text: 'Agendar call con IT sobre ERP', done: false },
      { text: 'Actualizar roadmap compartido en Notion', done: false },
      { text: 'Preparar estimación integración para el viernes', done: false },
    ],
  },
  {
    title: 'Preparar demo martes (equipo)',
    items: [
      { text: 'Revisar datos demo en la app', done: true },
      { text: 'Probar flujo archivar + búsqueda', done: false },
      { text: 'Grabar backup por si falla WiFi en sala', done: false },
    ],
  },
  {
    title: 'Seguimiento legal — contrato marco',
    items: [
      { text: 'Revisar cláusula de confidencialidad', done: true },
      { text: 'Devolver borrador con comentarios', done: true },
      { text: 'Firma digital pendiente de dirección', done: false },
    ],
  },
  {
    title: 'Onboarding nuevo compañero (Ana)',
    items: [
      { text: 'Accesos GitHub y Slack', done: false },
      { text: 'Sesión producto + NoteFlow', done: false },
      { text: 'Buddy primera semana: Carlos', done: false },
    ],
  },
  {
    title: 'Retrospectiva sprint 12 (archivada)',
    items: [
      { text: 'Recoger feedback del equipo', done: true },
      { text: 'Publicar acta en Confluence', done: true },
      { text: 'Cerrar acciones en Jira', done: true },
    ],
    archived: true,
  },
];

const ideas = [
  {
    title: 'Widget “próxima reunión” en home',
    tags: ['PRODUCTO', 'V2'],
    color: '#E4E8ED',
  },
  {
    title: 'Plantilla nota: reunión 1:1',
    tags: ['PLANTILLA', 'RRHH'],
    color: '#E8E4ED',
  },
  {
    title: 'Enlace dashboard métricas cliente',
    tags: ['REFERENCIA', 'ACME'],
    color: '#EDE8E0',
  },
  {
    title: 'Sync calendario Outlook ↔ NoteFlow',
    tags: ['INTEGRACIÓN', 'BACKLOG'],
    color: '#E0EDE8',
  },
  {
    title: 'Modo “solo voz” post-reunión',
    tags: ['IA', 'EXPERIMENTO'],
    color: '#EDE0E4',
  },
  {
    title: 'Badge “sin acta” reuniones > 48h',
    tags: ['UX', 'ARCHIVADO'],
    color: '#F2F2F5',
    archived: true,
  },
];

async function createNote(data) {
  return api('/notes', { method: 'POST', body: JSON.stringify(data) });
}

async function archive(id) {
  return api(`/notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_archived: true }),
  });
}

async function main() {
  console.log(`Sembrando demo en ${BASE}…`);

  for (const note of notes) {
    const { archived, ...payload } = note;
    const created = await createNote({ ...payload, type: 'note' });
    if (archived) await archive(created.id);
    console.log(`  ✓ nota: ${note.title}`);
  }

  for (const checklist of checklists) {
    const { archived, items, ...rest } = checklist;
    const parent = await createNote({ ...rest, type: 'checklist' });
    for (const item of items) {
      await api(`/notes/${parent.id}/checklist-items`, {
        method: 'POST',
        body: JSON.stringify({ text: item.text, is_completed: item.done }),
      });
    }
    if (archived) await archive(parent.id);
    console.log(`  ✓ checklist: ${checklist.title}`);
  }

  for (const idea of ideas) {
    const { archived, ...payload } = idea;
    const created = await createNote({ ...payload, type: 'idea' });
    if (archived) await archive(created.id);
    console.log(`  ✓ idea: ${idea.title}`);
  }

  const all = await api('/notes');
  const active = all.filter((n) => !n.is_archived);
  console.log(`\nListo: ${all.length} en total, ${active.length} activas.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
