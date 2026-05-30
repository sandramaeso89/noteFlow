/**
 * Inserta solo checklists e ideas demo (sin notas de texto).
 * Uso: node scripts/seedChecklistsIdeas.mjs
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
];

const ideas = [
  { title: 'Widget “próxima reunión” en home', tags: ['PRODUCTO', 'V2'], color: '#E4E8ED' },
  { title: 'Plantilla nota: reunión 1:1', tags: ['PLANTILLA', 'RRHH'], color: '#E8E4ED' },
  { title: 'Enlace dashboard métricas cliente', tags: ['REFERENCIA', 'ACME'], color: '#EDE8E0' },
  { title: 'Sync calendario Outlook ↔ NoteFlow', tags: ['INTEGRACIÓN', 'BACKLOG'], color: '#E0EDE8' },
  { title: 'Modo “solo voz” post-reunión', tags: ['IA', 'EXPERIMENTO'], color: '#EDE0E4' },
];

async function main() {
  console.log(`Sembrando checklists e ideas en ${BASE}…`);

  for (const checklist of checklists) {
    const parent = await api('/notes', {
      method: 'POST',
      body: JSON.stringify({ title: checklist.title, type: 'checklist' }),
    });
    for (const item of checklist.items) {
      await api(`/notes/${parent.id}/checklist-items`, {
        method: 'POST',
        body: JSON.stringify({ text: item.text, is_completed: item.done }),
      });
    }
    console.log(`  ✓ checklist: ${checklist.title}`);
  }

  for (const idea of ideas) {
    await api('/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: idea.title,
        type: 'idea',
        color: idea.color,
        tags: idea.tags,
      }),
    });
    console.log(`  ✓ idea: ${idea.title}`);
  }

  const all = await api('/notes');
  const active = all.filter((n) => !n.is_archived);
  const byType = Object.fromEntries(
    ['note', 'checklist', 'idea'].map((t) => [t, active.filter((n) => n.type === t).length])
  );
  console.log(`\nActivas en API: notas ${byType.note}, checklists ${byType.checklist}, ideas ${byType.idea}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
