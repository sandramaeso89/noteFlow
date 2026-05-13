# Idea: NoteFlow

## Qué problema resuelve

Las personas con muchas reuniones acumulan **acuerdos y tareas** en la cabeza, en notas sueltas del móvil o en hilos de correo. Eso provoca **pérdida de contexto** (“¿qué quedó pendiente de aquella reunión?”) y **listas mezcladas** (texto largo mezclado con cosas por hacer).

NoteFlow separa lo **descriptivo** (qué pasó, qué se acordó) de lo **accionable** (qué hay que hacer) y ofrece un lugar para **material de apoyo** (enlaces, datos breves). Así se puede **revisar pendientes** y **archivar** lo ya cerrado sin borrar el historial útil de cada reunión.

## Usuario objetivo

**Perfil:** profesional con agenda cargada de reuniones (equipo, clientes, proveedores).

**Uso entre semana:** al terminar una reunión, en uno o dos minutos deja una **nota breve** con lo esencial (decisiones, contexto, próximos pasos) y registra **acciones concretas** (frases claras del tipo “enviar propuesta el martes”). No busca un acta formal; busca **no perder el hilo** antes de la siguiente cita.

**Revisión periódica (por ejemplo el fin de semana):** abre la vista de **pendientes**, marca como hechas las acciones completadas y **archiva** reuniones o bloques que ya no necesita a primera vista, conservando la información por si debe consultarla más adelante.

## Tres tipos de contenido (alcance del producto)

| Tipo        | Rol |
|------------|-----|
| **Reunión** | Nota breve post-reunión: contexto, acuerdos, “qué importa recordar”. |
| **Acción**  | Tarea derivada de una reunión o independiente; estado pendiente / hecha; opcionalmente enlazada a una reunión. |
| **Referencia** | Enlace, dato corto o snippet que no es una tarea pero sí útil junto a una reunión o tema. |

## Funcionalidades principales (primera versión)

- Crear, editar y eliminar **reuniones**, **acciones** y **referencias**.
- Lista principal **rápida y fluida** (pensada para muchos ítems en el tiempo).
- Filtrar o agrupar por tipo y por estado básico (pendiente / hecha en acciones; activa / archivada donde aplique).
- **Archivar** contenido ya cerrado sin perderlo del todo.
- **Persistencia local**: los datos sobreviven al cerrar la app.
- **Navegación** clara entre captura, lista general y detalle de un ítem.
- **Sistema de diseño** mínimo pero coherente (tipografía, color, espaciado, componentes reutilizables).

## Funcionalidades opcionales (más adelante)

- Búsqueda de texto en notas y títulos.
- Recordatorios o notificaciones locales.
- Etiquetas por cliente, proyecto o tipo de reunión.
- Plantillas de reunión (1:1, cliente, retrospectiva).
- Adjuntos (imagen, audio) o texto enriquecido.
- Sincronización en la nube y cuenta de usuario.
- Exportar / importar copia de seguridad (por ejemplo JSON).
- Widgets o compartir desde otras apps hacia NoteFlow.
