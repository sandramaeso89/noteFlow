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

**Paso 1 (curso) hecho:** proyecto Expo creado en la **raíz de este repositorio** con `create-expo-app` plantilla **blank-typescript** (SDK Expo 54).

**Paso 2 (curso) hecho:** `expo-router` y dependencias de navegación instaladas con `expo install`; `package.json` usa **`main`: `expo-router/entry`**; en `app.json` hay **`scheme`: `noteflow`** (deep links tipo `noteflow://`). Carpetas **`app/`**, **`components/`**, **`store/`**, **`types/`**, **`constants/`** creadas; entrada en **`app/_layout.tsx`** y **`app/index.tsx`**. `babel.config.js` usa **`babel-preset-expo`** (preset de Expo; el plugin antiguo `expo-router/babel` ya no aplica en SDK recientes).

**Navegación NoteFlow:** pestañas **Notas / Checklists / Ideas**, detalle dinámico `[id]` por sección y modal **`/nueva-note`**; detalle en [`docs/expo-router-navegacion.md`](docs/expo-router-navegacion.md).

**UI y listas (hecho):** tokens en [`constants/theme.ts`](constants/theme.ts) según [`docs/diseno-ui.md`](docs/diseno-ui.md); tarjetas `NoteCard` / `ChecklistCard` / `IdeaCard`; **FlashList** en las tres pestañas; cabecera con botón **+**.

**Estado y formularios (hecho):** store **Zustand** en [`store/notesStore.ts`](store/notesStore.ts); modal **`/nueva-note`** con formulario por tipo (nota / checklist / idea), validación **Zod** en [`schemas/noteSchemas.ts`](schemas/noteSchemas.ts) y guardado en el store. Pendiente del curso: [`docs/pendiente-ejercicio.md`](docs/pendiente-ejercicio.md).

`create-expo-app` no permite mezclar con archivos existentes; antes del scaffold inicial se movieron temporalmente `.cursor/`, `.cursorrules` y `README.md` y luego se restauraron.

La configuración de **herramientas de IA** sigue en [`docs/ai-setup.md`](docs/ai-setup.md).

## Arranque local

```bash
npm start
```

Equivalente: `npx expo start`. Luego escanea el QR con **Expo Go** o abre simulador (teclas `i` / `a` en la CLI de Expo según entorno).

## Stack previsto (curso)

- **React Native** + **Expo** — app nativa con flujo ágil. Fundamentos (hilos JS/UI): [`docs/react-native-fundamentals.md`](docs/react-native-fundamentals.md). Teoría (Metro, RN vs nativo, UI Gluestack vs Paper): [`docs/react-native-teoria.md`](docs/react-native-teoria.md). **Expo Go** vs **Development Build**: [`docs/expo-go-vs-development-build.md`](docs/expo-go-vs-development-build.md).
- **Expo Router** — navegación basada en archivos y layouts; arquitectura Tabs + Stack + modal: [`docs/expo-router-navegacion.md`](docs/expo-router-navegacion.md).
- **FlashList** — listas en las pestañas (ver sección *Rendimiento en listas* en [`docs/react-native-teoria.md`](docs/react-native-teoria.md)).
- **Zustand** — estado global en `store/notesStore.ts`.
- **Zod** — validación de formularios en `schemas/noteSchemas.ts`.
- **Persistencia local** — pendiente (`AsyncStorage` + middleware `persist` en Zustand).
- **Sistema de diseño** — tokens en [`constants/theme.ts`](constants/theme.ts); UI con **React Native Paper** (MD3) y tema claro/oscuro según sistema. Detalle y justificación: [`docs/react-native-teoria.md`](docs/react-native-teoria.md) (sección *Sistemas de diseño*).

## Documentación

| Archivo | Contenido |
|---------|-----------|
| `docs/idea.md` | Problema, usuario, funcionalidades |
| `docs/diseno-ui.md` | **Dirección UI acordada:** mockup minimalista + escala de grises, tarjetas y tokens |
| `docs/pendiente-ejercicio.md` | **Checklist del curso:** qué está hecho y qué falta (FlashList, Zod, AsyncStorage, UX) |
| `docs/modelo-datos.md` | Tipos `Note`, `ChecklistNote`, `IdeaNote`, `AnyNote` y type guards |
| `docs/gestion-estado.md` | Comparativa useState / Context / Zustand |
| `schemas/noteSchemas.ts` | Schemas Zod del formulario de alta |
| `docs/react-native-fundamentals.md` | Fundamentos RN del tutor: vistas nativas, hilo JS vs UI, rendimiento y vínculo con NoteFlow |
| `docs/react-native-teoria.md` | RN vs nativo, Metro, Expo Go, comparativa UI y **sistema de diseño (Paper + tokens)** |
| `constants/theme.ts` | Tokens (`spacing`, `typography`) y `getNoteFlowPaperTheme` (claro/oscuro) |
| `docs/expo-go-vs-development-build.md` | Expo Go vs Development Build (EAS): cuándo usar cada uno (curso) |
| `docs/expo-router-navegacion.md` | Tabs vs Stack vs modal en NoteFlow y archivos de rutas (`app/`) |
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
