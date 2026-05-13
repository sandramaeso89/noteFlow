# NoteFlow

App de **productividad** pensada para quienes viven de **reuniones**: capturar en segundos el resumen de cada cita, las **acciones** pendientes y **referencias** útiles, revisar lo pendiente con calma y archivar lo cerrado sin perder el contexto.

La definición de producto, usuario y alcance está en **[`docs/idea.md`](docs/idea.md)**.

## Tablero Trello (gestión del trabajo)

| Recurso | Enlace |
|---------|--------|
| **Tablero NoteFlow** | [Abrir tablero en Trello](https://trello.com/invite/b/6a048a0373bbe62e3367a880/ATTI8b855197a3a2f6feced08fd4beb61fa60725B2BD/noteflow) |
| **Cómo se usa el tablero** | [`docs/project-management.md`](docs/project-management.md) — columnas, flujo y tarjetas con subtareas |

Columnas del tablero: **Backlog**, **Todo**, **In Progress**, **Review**, **Done**.

## Estado del proyecto

Fase inicial: documentación de la idea en el repositorio. La implementación prevista sigue el módulo de desarrollo móvil con **React Native** y **Expo**. La configuración de **herramientas de IA** (Cursor, Gemini, Claude, etc.) está descrita en [`docs/ai-setup.md`](docs/ai-setup.md).

## Stack previsto (curso)

- **React Native** + **Expo** — app nativa con flujo ágil. Fundamentos (hilos JS/UI): [`docs/react-native-fundamentals.md`](docs/react-native-fundamentals.md). **Expo Go** (QR, sin binario propio) vs **Development Build** / **EAS Build** (nativos personalizados): [`docs/expo-go-vs-development-build.md`](docs/expo-go-vs-development-build.md).
- **Expo Router** — navegación basada en archivos y layouts.
- **FlashList** — listas de alto rendimiento cuando el volumen de notas y tareas crece.
- **Zustand** — estado global ligero.
- **Persistencia local** — datos en el dispositivo entre sesiones.
- **Sistema de diseño** — tokens y componentes reutilizables para una UI coherente.

## Documentación

| Archivo | Contenido |
|---------|-----------|
| `docs/idea.md` | Problema, usuario, funcionalidades |
| `docs/react-native-fundamentals.md` | Fundamentos RN del tutor: vistas nativas, hilo JS vs UI, rendimiento y vínculo con NoteFlow |
| `docs/expo-go-vs-development-build.md` | Expo Go vs Development Build (EAS): cuándo usar cada uno (curso) |
| `docs/project-management.md` | Trello: columnas, flujo de trabajo y tarjetas/subtareas sugeridas |
| `docs/ai-setup.md` | Configuración de IA (Cursor, Gemini, Claude, otras) y por qué |
| `.cursorrules` | Reglas de contexto en raíz para Cursor: stack RN+TS, estilo, restricciones |
| `.cursor/skills/noteflow/SKILL.md` | Skill de Cursor del repo: cómo trabaja el asistente con Sandra (mentoría, reglas, stack NoteFlow) |
| `.cursor/skills/noteflow/reference.md` | Referencia complementaria (alcance v1, a11y, RGPD/web si aplica más adelante) |

Habilita o invoca la skill **`noteflow`** en Cursor (Rules / Skills) para que estas reglas apliquen en las sesiones de este proyecto.

## Requisitos (cuando exista el código)

Será un proyecto Expo; hace falta Node.js y, para ejecutar en dispositivo o emulador, lo que indique el curso: normalmente **Expo Go** al inicio; **Development Build** si el enunciado exige módulos nativos fuera de Go (ver [`docs/expo-go-vs-development-build.md`](docs/expo-go-vs-development-build.md)).

## Licencia

Por definir.
