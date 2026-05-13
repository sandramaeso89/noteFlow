# Expo Router en NoteFlow: Tabs, Stack y modal

Este documento describe **cómo está montada la navegación** en la app y **por qué** se combinan un **Stack raíz**, **Tabs** como carcasa principal y una ruta **modal** para crear contenido.

## Resumen visual

```text
Stack (raíz, `app/_layout.tsx`)
├── index          → redirección a `/notas`
├── (tabs)         → barra inferior: Notas | Checklists | Ideas
│   ├── notas      → Stack: lista + `/notas/[id]`
│   ├── checklists → Stack: lista + `/checklists/[id]`
│   └── ideas      → Stack: lista + `/ideas/[id]`
└── nueva-note     → modal (`presentation: 'modal'`) para alta rápida
```

Los **grupos entre paréntesis** `(tabs)` no aparecen en la URL: las rutas públicas son `/notas`, `/checklists`, `/ideas`, etc.

## Stack (raíz)

**Qué es:** una pila global que envuelve toda la app y decide qué pantallas son “hermanas” al nivel superior.

**En NoteFlow:** el Stack raíz oculta la cabecera en `index` y en `(tabs)` para que no haya doble barra; la cabecera la aportan los **Stacks internos** de cada pestaña y el **modal** tiene la suya propia. El modal se declara aquí con `presentation: 'modal'` para el comportamiento nativo de hoja que se cierra encima del resto.

**Por qué no solo Tabs:** necesitamos rutas que **no** son pestañas (por ejemplo el modal de creación) y, más adelante, otras rutas globales (ajustes, búsqueda, etc.) sin meterlas en la barra inferior.

## Tabs

**Qué es:** tres destinos fijos con **tab bar** inferior; el usuario cambia de “ámbito” (notas vs listas vs ideas) con un toque.

**En NoteFlow:** `app/(tabs)/_layout.tsx` define las tres pestañas e iconos con **`@expo/vector-icons`** (`MaterialCommunityIcons`), alineados con el lenguaje visual de Material (coherente con **React Native Paper**).

**Por qué Tabs:** coincide con el modelo mental del producto: tres **colecciones** distintas que conviven; la barra da **orientación** y acceso en un gesto.

## Stack (dentro de cada pestaña)

**Qué es:** dentro de cada pestaña, un Stack propio (`notas/_layout.tsx`, etc.) apila la **lista** y el **detalle** `[id]`.

**En NoteFlow:** desde la lista se navega a `/notas/demo-1` (y análogos en checklists e ideas); el botón atrás del sistema y la cabecera se comportan como en apps nativas.

**Por qué no solo rutas planas:** el detalle debe **apilar** sobre la lista, no reemplazar la pestaña entera; un Stack por sección es el patrón habitual en Expo Router / React Navigation.

## Modal (`nueva-note`)

**Qué es:** una pantalla presentada como **modal** desde el Stack raíz (`app/nueva-note.tsx`).

**En NoteFlow:** el FAB “+” en cada lista hace `router.push('/nueva-note')`. Es un **placeholder** de formulario hasta conectar Zustand y persistencia.

**Por qué modal y no otra pestaña:** la creación es una **acción transitoria** que interrumpe poco el contexto y se cierra con guardar o cancelar; no merece un quinto tab ni mezclarse con la pila del detalle.

## Archivos clave

| Ruta | Rol |
|------|-----|
| `app/_layout.tsx` | Stack raíz, tema Paper, pantallas `index`, `(tabs)`, `nueva-note` |
| `app/index.tsx` | `Redirect` a `/notas` |
| `app/(tabs)/_layout.tsx` | Tabs + iconos |
| `app/(tabs)/notas/_layout.tsx` (y checklists, ideas) | Stack por sección |
| `app/(tabs)/notas/index.tsx`, `[id].tsx` | Lista y detalle dinámico |
| `app/nueva-note.tsx` | Modal de alta |

## Enlaces útiles

- [Expo Router — introduction](https://docs.expo.dev/router/introduction/)
- [Layout routes](https://docs.expo.dev/router/basics/layout/)
