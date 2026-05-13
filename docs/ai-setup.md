# Configuración de herramientas de IA — NoteFlow

Este documento resume **qué** se ha configurado para que las IAs conozcan el proyecto desde el inicio y **por qué**, según la guía del tutor.

---

## Por qué importa la configuración

Las mismas herramientas producen resultados muy distintos si no tienen **contexto fijo** (stack, convenciones, límites). Sin reglas explícitas, el modelo tiende a:

- Inventar carpetas típicas de otros tutoriales que **aún no existen** en este repo.
- Mezclar JavaScript y TypeScript o patrones de navegación incompatibles con **Expo Router**.
- Añadir dependencias o refactors **no pedidos**.

La configuración persistente reduce esas desviaciones y alinea el código con **NoteFlow** y el curso (React Native, Expo, TypeScript, FlashList, Zustand, persistencia local, diseño).

---

## Cursor

### Qué se ha aplicado

| Mecanismo | Ubicación | Función |
|-----------|-----------|---------|
| **Reglas de proyecto (legacy / pedido explícito del curso)** | `.cursorrules` en la **raíz** | Contexto del producto, stack, estilo RN+TS, restricciones (deps, git, tokens, alcance). Cursor y muchos flujos siguen leyendo este archivo cuando está presente. |
| **Skill del repositorio** | `.cursor/skills/noteflow/` | Flujo de mentoría con Sandra: confirmación previa, analogías, zsh/macOS, seguridad, formato de respuesta, checklist. Complementa `.cursorrules` con el “cómo trabajamos”. |
| **Documentación de producto** | `docs/idea.md`, `README.md` | Fuente de verdad del problema, usuario, v1 y stack previsto. |

### Por qué `.cursorrules` + TypeScript + React Native

- En proyectos **Expo Router**, las rutas viven en `app/`; sin contexto, los modelos suelen sugerir `src/screens` u otros patrones antiguos.
- **TypeScript** reduce errores en props y en el modelo de datos (reuniones, acciones, referencias); las reglas piden `.ts`/`.tsx` y props tipadas.
- **FlashList** tiene requisitos (p. ej. `estimatedItemSize`) distintos de `FlatList`; conviene dejarlo escrito para listas grandes.
- **Zustand** evita boilerplate excesivo; las reglas evitan introducir Redux u otro estado sin que el curso lo pida.

### Cómo activarlo en Cursor

1. Asegúrate de que el proyecto **NoteFlow** está abierto como carpeta raíz (así se cargan `.cursorrules` y `.cursor/skills/`).
2. En **Cursor Settings → Rules, Skills, Subagents**, habilita la skill **`noteflow`** si quieres el flujo completo de mentoría.
3. Si en el futuro migras reglas al formato moderno `.cursor/rules/*.mdc`, puedes **portar** el contenido de `.cursorrules` allí; el tutor pidió explícitamente `.cursorrules` para este ejercicio.

**Referencia:** [Cursor documentation on rules](https://docs.cursor.com/context/rules-for-ai) (convenciones actuales y coexistencia con reglas legacy).

---

## Gemini (Google)

### Mecanismo equivalente

- **Instrucciones del sistema / contexto** en el producto que uses: p. ej. **Gemini en Google AI Studio** (instrucciones del sistema del chat o del “tuned” context), **Gemini Code Assist** / extensiones con “contexto del proyecto”, o **Google Antigravity** si lo usas en el flujo del curso.
- Copia un **resumen corto** (stack NoteFlow + enlace mental a “solo lo pedido, sin deps sin OK”) pegado al inicio de conversaciones largas si la herramienta no guarda instrucciones persistentes.

### Qué pegar como prompt de sistema (plantilla)

Usa un bloque fijo al crear un chat nuevo o al configurar “Custom instructions”:

```text
Proyecto: NoteFlow — app React Native + Expo + TypeScript. Expo Router (app/), FlashList, Zustand, persistencia local, diseño con tokens. Producto: productividad post-reunión (Reunión, Acción, Referencia). Documentación: docs/idea.md y README en el repo.
Convenciones: comentarios en español; código (nombres) en inglés; UI en español. No instalar paquetes ni refactor global sin confirmación. No commit/push automáticos.
```

**Por qué:** Gemini no lee `.cursorrules` del disco por sí solo; necesita **instrucciones repetidas** o **configuración en la UI** del producto Google que uses.

---

## Claude (Anthropic)

### Mecanismo equivalente

- **Proyectos de Claude (web):** “Custom instructions” o contexto fijado al proyecto, con el mismo bloque que arriba.
- **Claude Code / IDE:** fichero de instrucciones del proyecto si la herramienta lo soporta (p. ej. convenciones en un `CLAUDE.md` en raíz en algunos flujos); no es obligatorio duplicar todo si ya está en `.cursorrules`, pero un **párrafo resumen** en el primer mensaje ayuda.

**Por qué:** Igual que con Gemini, el contexto del disco del repo solo entra si **adjuntas archivos** o usas integración que indexe el repo; las instrucciones persistentes en la **cuenta/proyecto** evitan repetir el stack en cada sesión.

---

## Otras herramientas (principio general)

- Busca en ajustes: **“Rules”, “Instructions”, “Project context”, “.instructions.md”, “AGENTS.md”**, etc.
- Si la herramienta solo admite contexto por chat: mantén **`docs/ai-setup.md`** y la **plantilla de párrafo** arriba en un snippet (Raycast, TextExpander, nota) para pegar al abrir sesión.

---

## Mantenimiento

Cuando el repo pase de “solo docs” a **proyecto Expo generado**, revisa:

1. `.cursorrules` — rutas reales (`app/`, `src/`, alias `@/` si existen).
2. Esta archivo — añade captura de qué herramienta exacta usas (p. ej. “Gemini Code Assist en VS Code”) si el tutor lo pide desglosado.
3. `README.md` — enlace a `docs/ai-setup.md` ya reflejado en la tabla de documentación.

---

## Resumen

| Herramienta | Configuración aplicada |
|-------------|-------------------------|
| **Cursor** | `.cursorrules` + skill `.cursor/skills/noteflow/` + docs del repo |
| **Gemini** | Plantilla de instrucciones en este doc (pegar en UI o primer mensaje) |
| **Claude** | Misma plantilla en proyecto / primer mensaje |
| **Otras** | Buscar mecanismo equivalente; reutilizar plantilla |

Con esto la IA dispone de **contexto técnico y de producto** alineado con tus decisiones y con el enunciado del curso.
