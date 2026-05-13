# Gestión del trabajo — NoteFlow (Trello)

## Enlace al tablero

**URL del tablero (invitación):** [https://trello.com/invite/b/6a048a0373bbe62e3367a880/ATTI8b855197a3a2f6feced08fd4beb61fa60725B2BD/noteflow](https://trello.com/invite/b/6a048a0373bbe62e3367a880/ATTI8b855197a3a2f6feced08fd4beb61fa60725B2BD/noteflow)

El mismo enlace está en [`README.md`](../README.md). Los enlaces de invitación de Trello pueden caducar o revocarse desde la configuración del tablero; si deja de funcionar, genera uno nuevo y actualiza ambos archivos.

---

## Cómo está organizado el trabajo

### Columnas del tablero

| Columna | Uso |
|---------|-----|
| **Backlog** | Tarjetas acordadas para la v1 pero **no priorizadas** para la semana actual, o mejoras opcionales del `docs/idea.md` (roadmap). |
| **Todo** | Listo para entrar en desarrollo: criterios claros y dependencias resueltas (o ninguna). |
| **In Progress** | Máximo **1–2** tarjetas a la vez para no dispersar foco; la persona que desarrolla mueve aquí al empezar. |
| **Review** | Implementación hecha: revisas tú misma el enunciado, pruebas en dispositivo/simulador y checklist de la tarjeta. |
| **Done** | Revisión superada; el comportamiento coincide con `docs/idea.md` y el curso. |

### Flujo

1. Nuevas ideas o extras → **Backlog** (no bloquean la v1).
2. Al planificar el sprint o la sesión → seleccionar tarjetas y pasarlas a **Todo**.
3. Al codificar → **In Progress** (una tarjeta principal por bloque de tiempo ayuda).
4. Antes de dar por cerrada → **Review** (pruebas + README/`docs` si aplica).
5. OK → **Done**.

### Guía rápida: ¿qué tarjetas creo y en qué lista van?

**Regla de oro:** solo **Backlog** y **Todo** reciben tarjetas nuevas que tú creas. **In Progress**, **Review** y **Done** son etapas por las que **pasas** una tarjeta ya existente (arrastrándola).

| Lista | Qué pones aquí |
|--------|------------------|
| **Backlog** | Tarjetas de la v1 que **aún no** vas a tocar en esta sesión/semana, **y** todas las opcionales (búsqueda, recordatorios, etc.). |
| **Todo** | Tarjetas que **sí** vas a implementar **pronto** (siguiente o siguientes bloques). Aquí deben estar **listas para coger**: título claro + checklist de subtareas. |
| **In Progress** | Como mucho **1 tarjeta** (o 2 si son muy pequeñas): la que estás haciendo **ahora mismo**. |
| **Review** | La tarjeta ya tiene el código hecho; falta **probar** en móvil/simulador y tachar checklist. |
| **Done** | Revisión OK; la funcionalidad cumple el enunciado. |

**Al empezar el tablero vacío (recomendación simple):**

1. Crea **las 12 tarjetas** de la sección siguiente (títulos copiados tal cual).
2. Pon **todas** en **Backlog** (así ves el mapa completo de la v1).
3. Arrastra solo la **tarjeta 1 (Bootstrap)** a **Todo** cuando vayas a empezar el código.
4. Cuando abras el proyecto a programar esa tarjeta, pásala a **In Progress**.
5. Al terminar la implementación, a **Review**; tras probar, a **Done**.
6. Vuelve a **Backlog**, elige la siguiente (p. ej. tarjeta 2), pásala a **Todo** y repite.

Si prefieres ver todo el trabajo “pendiente” a la vista: puedes crear las 12 directamente en **Todo** y usar **Backlog** solo para extras opcionales; es válido, pero mezcla “por hacer ya” con “por hacer después”. El orden anterior (todo en Backlog y solo bajar a Todo la activa) suele ser más claro.

**Nunca** abras una tarjeta nueva directamente en **Done** ni en **Review** (no tiene sentido el flujo).

### Relación con Git

- Cada tarjeta **Done** debería corresponder con uno o más commits pequeños en la rama del curso (mensajes `feat:`, `fix:`, etc.).
- No hace falta integración automática Trello–Git para el ejercicio; basta con coherencia manual.

---

## Tarjetas sugeridas (v1) y subtareas técnicas

Crea **una tarjeta por bloque** y copia las subtareas como **checklist** de Trello (o como descripción con `- [ ]`).

**Títulos exactos sugeridos para Trello** (uno = una tarjeta):

1. `Bootstrap — Expo, TypeScript y estructura base`
2. `Sistema de diseño (tokens y componentes base)`
3. `Modelo de dominio y Zustand (estado global)`
4. `CRUD — Reuniones`
5. `CRUD — Acciones`
6. `CRUD — Referencias`
7. `Lista principal con FlashList`
8. `Filtros y agrupación (tipo y estado)`
9. `Archivar y desarchivar`
10. `Persistencia local`
11. `Navegación (Expo Router)`
12. `Revisión final v1 (transversal)`

### 1. Bootstrap — Expo, TypeScript y estructura base

- [ ] Crear proyecto con Expo + TypeScript según guía del curso.
- [ ] Verificar `app/` (Expo Router) y entrada de la app.
- [ ] Configurar ESLint/Prettier si el curso lo pide.
- [ ] Documentar en `README` cómo arrancar (`npx expo start`, etc.).

### 2. Sistema de diseño (tokens y componentes base)

- [ ] Definir tokens: color, tipografía, espaciado, radios (un solo módulo `theme` o similar).
- [ ] Componentes atómicos: `Text`, `Button`, `Screen`, `Card` (nombres orientativos).
- [ ] Evitar colores sueltos fuera de tokens en nuevas pantallas.

### 3. Modelo de dominio y Zustand (estado global)

- [ ] Tipos TS: `Meeting`, `Action`, `Reference` (campos mínimos: id, título, fechas si aplica, `archived`, etc.).
- [ ] `Action`: estados `pending` | `done`; opcional `linkedMeetingId`.
- [ ] Store Zustand: acciones para crear / actualizar / borrar por tipo.
- [ ] Selectores o vistas derivadas (p. ej. solo pendientes) si simplifican la UI.

### 4. CRUD — Reuniones

- [ ] Pantalla o flujo crear/editar reunión (formulario breve acorde a la idea de producto).
- [ ] Validación básica de texto (no vacío, longitud razonable).
- [ ] Eliminar reunión con confirmación.
- [ ] Listado o acceso desde detalle según la navegación definida.

### 5. CRUD — Acciones

- [ ] Crear/editar/borrar acción.
- [ ] Toggle o control pendiente ↔ hecha.
- [ ] Opcional: asociar a reunión existente (selector simple).

### 6. CRUD — Referencias

- [ ] Crear/editar/borrar referencia (enlace o texto breve).
- [ ] Validación de URL o texto según reglas que fijes en la tarjeta.

### 7. Lista principal con FlashList

- [ ] Instalar y configurar `@shopify/flash-list` cuando toque el paquete (con OK del flujo de trabajo).
- [ ] `FlashList` con `estimatedItemSize` adecuado y `renderItem` estable (evitar funciones inline que rompan memo si el curso lo exige).
- [ ] Estado vacío (“no hay reuniones aún”) con copy en español.
- [ ] Pull-to-refresh solo si el enunciado lo pide (si no, omitir).

### 8. Filtros y agrupación (tipo y estado)

- [ ] Filtro o pestañas: todos / reunión / acción / referencia (o el patrón que elijas y documentes).
- [ ] Filtro de acciones: pendientes / hechas / todas.
- [ ] Filtro o vista de archivados si la UI lo separa.

### 9. Archivar y desarchivar

- [ ] Marcar ítem como archivado sin borrarlo de la base local.
- [ ] UI para ver archivados y restaurar o ocultar según `docs/idea.md`.

### 10. Persistencia local

- [ ] Elegir mecanismo (p. ej. AsyncStorage + middleware de Zustand, u otro indicado en el curso).
- [ ] Rehidratación al abrir la app sin parpadeos raros de UI.
- [ ] Manejo de error si falla la lectura (mensaje claro al usuario).

### 11. Navegación (Expo Router)

- [ ] Layout raíz (tabs o stack) alineado al flujo: captura rápida, lista, detalle.
- [ ] Rutas a pantallas de detalle por `id`.
- [ ] Cabeceras y títulos en español.

### 12. Revisión final v1 (transversal)

- [ ] Pase de accesibilidad básica (labels, contraste, táctiles).
- [ ] `README.md` y `docs/idea.md` alineados con lo implementado.
- [ ] Lista de pruebas manuales en Review antes de mover a Done.

---

## Tarjetas opcionales en Backlog (no v1 obligatoria)

Útiles para no olvidar mejoras sin mezclarlas con la entrega mínima:

- Búsqueda por texto en títulos y notas.
- Recordatorios locales.
- Etiquetas por cliente/proyecto.
- Export/import JSON de respaldo.
- Modo oscuro explícito si no entró en el sistema de diseño inicial.

---

## Consejos prácticos

- **Orden sugerido de arranque:** tarjetas 1 → 2 → 3 → 11 (navegación mínima) → 4–6 (CRUD) → 7 → 8 → 9 → 10 → 12.
- **Tamaño de tarjeta:** si una tarjeta lleva más de 2–3 sesiones, divídela (p. ej. separar “Lista FlashList” de “Filtros”).
- **Definition of Done por tarjeta:** checklist completo + probado en **móvil** (Expo Go o simulador).
