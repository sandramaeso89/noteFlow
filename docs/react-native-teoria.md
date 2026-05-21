# React Native: teoría para NoteFlow

Documento de apoyo del curso: conceptos generales, **Metro** y por qué **Expo Go** tiene límites en producción. Incluye una comparación orientativa entre dos librerías UI habituales en el ecosistema **Expo** antes de elegir sistema de diseño.

Para hilos JS/UI y rendimiento, ver también [`react-native-fundamentals.md`](react-native-fundamentals.md). Para Expo Go frente a **Development Build**, ver [`expo-go-vs-development-build.md`](expo-go-vs-development-build.md).

---

## React Native frente a una app “100 % nativa”

### App nativa clásica (por plataforma)

- **iOS:** interfaz y lógica principalmente en **Swift** (o Objective-C), APIs del sistema directamente.
- **Android:** lo mismo en **Kotlin** (o Java).
- Dos bases de código distintas (salvo que compartas capas mínimas con C++ u otros enfoques poco comunes en apps de producto típicas).
- Control total del runtime y del árbol de vistas del sistema.

### App con React Native

- Una **base de código** (JavaScript/TypeScript + React) para la mayor parte de la **lógica** y de la **UI declarativa**.
- Los componentes core (`View`, `Text`, `Image`…) **no son etiquetas HTML**: el runtime de RN pide al **motor nativo** que cree y actualice vistas reales (UIKit / Android views).
- Si necesitas algo muy específico del sistema, puedes **extender con módulos nativos** (Swift/Kotlin) o usar librerías que ya los traigan.

### Diferencia clave en una frase

**Nativa pura:** tú escribes directamente contra las APIs y vistas de cada SO. **React Native:** escribes en React; el **puente / nueva arquitectura** coordina con el SO para pintar nativo y ejecutar tu JS. Ganas velocidad de desarrollo y unificación; gestionas bien el **hilo JS** y las dependencias nativas para no perder fluidez.

---

## Metro Bundler: qué es y para qué sirve

**Metro** es el **empaquetador (bundler)** por defecto de React Native (y del flujo **Expo** en desarrollo).

### Qué hace

- **Lee** tu grafo de entrada (p. ej. el entry de Expo o `expo-router/entry`).
- **Resuelve** `import`/`require`, aplica transformaciones (**Babel**: TypeScript, JSX, plugins como `expo-router/babel`).
- **Genera bundles** que el runtime carga en el dispositivo o simulador: en desarrollo suele servir por **HTTP** al cliente (Expo Go o dev build) con **Fast Refresh** para recargar cambios rápido.
- Puede **dividir** código (conceptos de chunks / lazy según configuración y versión) para no mandar todo de golpe cuando aplica.

### Por qué importa al desarrollar

- Sin Metro (o equivalente), el dispositivo no tendría un **árbol de módulos JS** coherente listo para ejecutar.
- Los errores de “no resuelve el módulo”, duplicados de React o problemas de **Babel** suelen mostrarse en la **consola de Metro**: mirar ahí es el primer paso al depurar.

---

## Por qué Expo Go no basta en proyectos reales

**Expo Go** es una **app genérica** precompilada con un **subconjunto fijo** de módulos nativos. Tu código JS se carga dentro de ella (QR, desarrollo rápido).

En **proyectos reales** suele hacer falta:

- Librerías con **código nativo** que **no** está incluido en el binario de Expo Go.
- **Versión exacta** del runtime nativo alineada con tu `app.json` / plugins.
- **Identidad de marca** en notificaciones, esquemas de URL, permisos y builds de tienda.

Por eso se pasa a un **Development Build** (binario **tuyo**) generado con **EAS Build** u otro flujo de compilación: incluye **tus** nativos y configuración. Resumen operativo en [`expo-go-vs-development-build.md`](expo-go-vs-development-build.md).

---

## Sistema de diseño y librería UI (antes de componentizar)

Antes de llenar `components/`, conviene decidir **tokens** (color, tipo, espaciado) y si apoyas la UI en una **librería de componentes** o en primitivos de RN + estilos propios.

Abajo, comparación **orientativa** de dos opciones muy usadas con **Expo** (nombres y paquetes pueden evolucionar; revisa la documentación oficial al instalar).

### Gluestack UI

- **Filosofía:** componentes y estilos pensados para **componer y personalizar** con tokens; sensación cercana a **utility-first / design system** (similar en espíritu a **Tailwind**: utilidades, variantes, consistencia por tokens).
- **Fortalezas:** identidad visual **única**, theming fuerte, buen encaje si quieres **alejarte del “aspecto Google/Material”** por defecto.
- **Coste:** curva de aprendizaje y más decisiones de diseño que asumir tú (a cambio de control).

### React Native Paper

- **Filosofía:** implementación de **Material Design** (Material You en versiones recientes) para React Native.
- **Fortalezas:** componentes **listos** (botones, listas, diálogos, surfaces), comportamiento y accesibilidad muy trabajados; en **Android** se integra de forma muy natural con la estética del sistema.
- **Coste:** la app se “lee” muy **Material**; salir de esa estética exige más overrides.

### Tabla rápida

| Criterio | Gluestack UI | React Native Paper |
|----------|----------------|---------------------|
| Estética por defecto | Neutral / la que definas con tokens | Material Design |
| Personalización fuerte | Muy buena | Posible, más trabajo |
| Android “nativo” visual | Depende de tu tema | Muy alineado |
| Curva inicial | Media | Baja–media |
| Nota para NoteFlow | Encaja si buscas **marca propia** minimalista | Encaja si priorizas **velocidad** y look **Material** |

---

## Sistemas de diseño (decisión en NoteFlow)

### Elección: **React Native Paper**

Tras comparar con **Gluestack UI** (v3), se opta por **React Native Paper** en este repositorio por:

1. **Integración con Expo sin CLI interactiva:** `npx gluestack-ui init` requiere confirmaciones en terminal y genera mucha estructura; en un flujo reproducible (CI, asistente) **React Native Paper** se instala como dependencia npm y se conecta con un **`PaperProvider`** en `app/_layout.tsx`, alineado con la [documentación oficial](https://callstack.github.io/react-native-paper/docs/guides/getting-started).
2. **Material Design 3 listo:** componentes accesibles (`Button`, `Surface`, `Text` con variantes MD3) y **temas claro/oscuro** bien definidos (`MD3LightTheme` / `MD3DarkTheme`), fáciles de **mapear** a una paleta propia sin reinventar cada primitivo.
3. **Android:** buen encaje visual y de comportamiento con el ecosistema Material del SO, útil para una app de productividad usada a diario en móvil.
4. **Tokens centralizados:** la identidad NoteFlow (violeta sobrio, fondos claros/oscuros) vive en **`constants/theme.ts`** como `spacing`, `typography` y paleta fusionada con el tema MD3 mediante **`getNoteFlowPaperTheme`**. Así se cumple el criterio de **sistema de diseño** del curso sin duplicar lógica de color en cada pantalla.
5. **Modo claro/oscuro:** `useColorScheme` de React Native decide el tema; en `app.json` se usa **`userInterfaceStyle: "automatic"`** para que el sistema pueda forzar el esquema cuando el usuario cambia apariencia en iOS/Android.

**Gluestack UI** sigue siendo una opción excelente si en el futuro se prioriza **máxima libertad visual** tipo utility-first y se acepta el flujo del CLI y la curva de componentes; la comparativa de la tabla anterior sigue vigente para valorar un cambio.

### Archivos relevantes en el repo

| Archivo | Rol |
|---------|-----|
| `constants/theme.ts` | Tokens (`spacing`, `typography`) y `getNoteFlowPaperTheme` |
| `app/_layout.tsx` | `SafeAreaProvider`, `PaperProvider`, `Stack` |
| `app/index.tsx` | Ejemplo de `useTheme()` y superficies Paper |

### Nota sobre dependencias

En este SDK, `npm install react-native-paper` puede exigir **`--legacy-peer-deps`** por avisos entre `react` y `react-dom` opcionales de `expo-router`. El repo incluye **`.npmrc`** con `legacy-peer-deps=true` para que `npm install` sea reproducible en otros equipos.

### Recomendación práctica (actualizada)

La app usa **una sola** librería de componentes base (**Paper**) más tokens en **`constants/theme.ts`**. No mezclar un segundo kit de UI sin planificar, para no duplicar sistemas de color y espaciado.

### Enlaces oficiales

- [Gluestack UI](https://gluestack.io/) — documentación y paquetes actuales.
- [React Native Paper](https://reactnativepaper.com/) — guías, theming y listado de componentes.

---

## Rendimiento en listas

En NoteFlow las pantallas de **Notas**, **Checklists** e **Ideas** usan [**FlashList**](https://shopify.github.io/flash-list/) (`@shopify/flash-list`) en lugar de `FlatList` cuando la lista puede crecer.

### Reciclaje de componentes

Al hacer scroll, una lista **no debería crear una vista nueva por cada fila** en memoria. El motor **reutiliza** (recicla) un número acotado de celdas: cuando una fila sale de pantalla, su componente se resetea y se asigna a otra fila que entra. Así el uso de memoria y el trabajo del hilo de UI se mantienen estables.

`FlatList` ya recicla, pero con listas largas y scroll rápido a veces aparecen **huecos blancos**: el reciclaje no alcanza a preparar la celda a tiempo. **FlashList** estima tamaños y recicla de forma más agresiva, lo que reduce esos parpadeos.

### Tamaño de filas (`estimatedItemSize`)

En **FlashList 1.x** el enunciado del curso pide `estimatedItemSize`: una altura media aproximada en píxeles **antes** de medir cada celda; cuanto más precisa, mejor el scroll.

En este repo usamos **FlashList 2.x** (Expo SDK 54), que **mide las celdas automáticamente** y ya no expone `estimatedItemSize` en los tipos. Los valores orientativos en `constants/theme.ts` → `listEstimatedItemSize` (nota ~148, checklist ~172, idea ~160) sirven como referencia de altura real de `NoteCard`, `ChecklistCard` e `IdeaCard` al depurar rendimiento.

### Buenas prácticas en NoteFlow

- Mantener las tarjetas **lo más ligeras** posible (evitar animaciones pesadas dentro de cada celda en la primera versión).
- Usar **`keyExtractor` estable** (`item.id`).
- Leer del store con **selectores** (`useNotesStore(s => s.notes)`) para no re-renderizar toda la pantalla al cambiar otro slice.

Más contexto de hilos y fluidez: [`react-native-fundamentals.md`](react-native-fundamentals.md). Dirección visual de las tarjetas: [`diseno-ui.md`](diseno-ui.md).

---

## Relación con el resto de docs del repo

| Tema | Documento |
|------|-----------|
| Hilos JS / UI y rendimiento | [`react-native-fundamentals.md`](react-native-fundamentals.md) |
| Expo Go vs Development Build | [`expo-go-vs-development-build.md`](expo-go-vs-development-build.md) |
| Producto y pantallas | [`idea.md`](idea.md) |

---

## Mapa del entregable del curso (NoteFlow)

Tabla de cierre del enunciado: qué pide el tutor y dónde está en este repo.

| Requisito del entregable | Implementación |
|--------------------------|----------------|
| Proyecto Expo funcional | Raíz Expo SDK 54, `expo-router/entry`, `npm start` |
| Librería UI configurada | React Native Paper + `getNoteFlowPaperTheme` en `constants/theme.ts` |
| Tres tipos con tarjetas distintas | `NoteCard`, `ChecklistCard`, `IdeaCard` + tipos en `types/index.ts` |
| FlashList en todas las listas | `app/(tabs)/*/index.tsx` (incl. `archivadas`) |
| Formularios + Zod | `app/nueva-note.tsx`, `schemas/noteSchemas.ts` |
| Zustand | `store/notesStore.ts` |
| AsyncStorage | `persist` + clave `noteflow-storage`, `StoreHydrationGate` |
| Este documento (`react-native-teoria.md`) | RN vs nativo, Metro, Expo Go, comparativa UI, Paper, FlashList |

Checklist detallado y pruebas manuales pendientes: [`pendiente-ejercicio.md`](pendiente-ejercicio.md).
