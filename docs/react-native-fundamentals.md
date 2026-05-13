# Fundamentos de React Native (curso)

Notas del módulo según la guía del tutor, aplicadas al contexto de **NoteFlow**. Sirven como referencia antes de optimizar listas, estado o animaciones.

---

## Vistas nativas, no HTML en un WebView

En React Native, cuando usas un componente como `<View>`, **no** se renderiza HTML dentro de un WebView por defecto. React Native **habla con el sistema operativo** para crear **vistas nativas reales** (por ejemplo vistas de UIKit en iOS y vistas del framework de Android). Eso da el **aspecto y el rendimiento** de una app nativa.

> Si en algún momento usas explícitamente un componente `WebView`, ahí sí se embebe contenido web; es un caso distinto a la pantalla habitual construida con `View`, `Text`, `Pressable`, etc.

---

## Dos hilos que deben comunicarse

La arquitectura tiene **dos hilos** principales que coordinan el trabajo:

| Hilo | Rol |
|------|-----|
| **Hilo de JavaScript (JS)** | Aquí corre tu código React, hooks, lógica de negocio, Zustand, llamadas a red, parseo de datos, etc. |
| **Hilo de UI nativo** | Aquí el sistema pinta y gestiona las vistas nativas y buena parte de la interacción fluida con el usuario. |

Entre ambos existe una capa de comunicación (en la documentación clásica se habla del *puente*; en la **Nueva arquitectura** intervienen Fabric, TurboModules y JSI). Lo importante para el día a día: **el trabajo pesado o prolongado en el hilo JS retrasa** la capacidad de React de calcular cambios y enviarlos al lado nativo.

### Bloqueo del hilo JS y la interfaz

**Cuando el hilo JS se bloquea o va muy justo de tiempo, la interfaz puede congelarse o ir a tirones** (scroll entrecortado, toques que responden tarde). Por eso el tutor indica que **entender esto es la base** para escribir apps con **rendimiento real**.

Ejemplos de lo que suele castigar el hilo JS si se abusa:

- Procesar listas enormes o recalcular todo en **cada** render.
- Operaciones síncronas muy pesadas en el camino crítico del render.
- Demasiados re-renders globales por un estado mal particionado.

---

## Relación con NoteFlow (v1)

- La **lista principal** de reuniones, acciones y referencias debe ser **ligera por ítem**; el curso prevé **FlashList** para escenarios con muchos elementos.
- **Zustand:** suscribir componentes solo a los **slices** de estado que necesitan reduce renders y trabajo en el hilo JS.
- **Persistencia:** leer y escribir en disco de forma acorde a las APIs recomendadas evita congelar la UI al abrir o guardar.

---

## Lectura oficial (ampliar)

- [React Native — The New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page) (documentación del equipo de RN).
- [Threading model](https://reactnative.dev/docs/threading-model) (modelo de hilos; puede actualizarse con la versión de RN que use el curso).

Cuando el proyecto Expo esté creado, anota aquí o en el `README` la **versión de React Native** del `package.json` para cruzar con la documentación que corresponda a esa versión.
