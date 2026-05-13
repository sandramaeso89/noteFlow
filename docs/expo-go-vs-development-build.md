# Expo Go vs Development Build (curso)

Notas según la guía del tutor, ampliadas con contexto práctico para **NoteFlow** y el desarrollo con Expo.

---

## Qué es Expo Go

**Expo Go** es el entorno de desarrollo **rápido**: escaneas un **QR** y tu app corre **sin compilar** un binario propio en ese momento. El JavaScript de tu proyecto se ejecuta dentro de la **app Expo Go** ya instalada en el dispositivo (iOS/Android).

**Ventajas típicas:**

- Arranque inmediato para aprender y para la mayoría de APIs incluidas en el cliente Expo Go.
- Mismo flujo en distintos dispositivos de prueba.

**Límite importante:** Expo Go incluye un **conjunto fijo** de módulos nativos precompilados. Si tu proyecto necesita **módulos nativos personalizados** o librerías nativas que **no** están en ese cliente, **no podrás** probarlas solo con Expo Go.

---

## Qué es un Development Build

Un **Development Build** es un **binario propio** de tu aplicación (una build de desarrollo), generado con **EAS Build** (Expo Application Services) u otro flujo equivalente del ecosistema Expo. Es “tu app” con el runtime que necesitas, incluidos los **nativos personalizados** que el proyecto declare.

Ejemplos de necesidades que suelen empujarte fuera de Expo Go hacia un Development Build:

- **Cámara** o APIs nativas con requisitos que no coinciden con el cliente genérico.
- **Notificaciones push** con el stack nativo que elijas y configuración del proyecto.
- **Biometría** u otras extensiones que requieran código o configuración nativa propia.

En **proyectos reales**, el tutor indica que **siempre** se acaba usando **Development Build**, porque el producto suele crecer más allá del subconjunto que Expo Go puede cargar.

---

## Cómo elegir en la práctica (NoteFlow)

| Situación | Elección habitual |
|-----------|-------------------|
| Curso inicial, pantallas, Zustand, listas, persistencia con APIs soportadas en Go | **Expo Go** suele ser suficiente mientras el enunciado lo permita. |
| Enunciado o librería exige nativo no incluido en Expo Go | **Development Build** con EAS Build (y seguir la guía del curso). |

Cuando exista el repositorio con código, anota en el `README` **qué flujo usa el equipo** (solo Go, o Go + dev client) para no confundir a quien clone el proyecto.

---

## Lectura oficial

- [Expo Go](https://docs.expo.dev/get-started/expo-go/) — qué es y cuándo usarlo.
- [Development builds](https://docs.expo.dev/develop/development-builds/introduction/) — introducción a builds de desarrollo.
- [EAS Build](https://docs.expo.dev/build/introduction/) — generación de binarios en la nube.
