# Gestos: swipe para eliminar (Gesture Handler + Reanimated)

NoteFlow combina **react-native-gesture-handler** y **react-native-reanimated** para deslizar tarjetas a la izquierda y pedir confirmación de borrado definitivo, animando en el **UI thread** (sin bloquear el hilo JS en cada frame).

## Dependencia

```bash
npx expo install react-native-gesture-handler
```

Tras instalar o actualizar el paquete, **recompila el development build** (no basta con recargar Metro):

```bash
npx expo run:android
# o
npx expo run:ios
```

## Raíz de la app

En `app/_layout.tsx`:

1. `import 'react-native-gesture-handler'` como primera importación del archivo (junto con Reanimated).
2. Envolver la app en `GestureHandlerRootView` con `style={{ flex: 1 }}`.

## Componente `SwipeableCard`

Ruta: `components/items/SwipeableCard.tsx`.

- Gesto **Pan**: solo desplazamiento hacia la izquierda (`translationX < 0`).
- Umbral **-80 px**: si sueltas más allá, se llama `onDelete` vía `runOnJS` (diálogo nativo en JS).
- Si no alcanza el umbral, vuelve con `withSpring(0)`.
- Fondo monocromo (`colors.fill`) con icono y texto «Eliminar» en `colors.onFill` (claro/oscuro).
- Haptic ligero al cruzar el umbral; la tarjeta **permanece abierta** hasta confirmar o cancelar.
- Banner `SwipeHintBanner` la primera vez; vacíos con texto de ayuda en `ListEmptyState`.
- Prop `enabled={false}` durante **selección múltiple** en listas activas.

## Dónde está integrado

| Pantalla | Archivo |
|----------|---------|
| Notas | `app/(tabs)/notas/index.tsx` |
| Checklists | `app/(tabs)/checklists/index.tsx` |
| Ideas | `app/(tabs)/ideas/index.tsx` |
| Archivadas | `app/(tabs)/archivadas/index.tsx` |

Cada fila: `AnimatedCardWrapper` → `SwipeableCard` → tarjeta (`NoteCard`, etc.). Props: `itemTitle`, `onConfirmDelete`. El diálogo distingue **eliminar definitivamente** de **archivar** (`utils/confirmActions.ts`).

## Errores frecuentes

### Fallo al importar `react-native-gesture-handler` en `SwipeableCard`

Suele significar que el **development build** se generó **antes** de instalar el paquete. El JS está en `node_modules`, pero falta el módulo nativo en el binario.

1. Asegúrate de tener dependencias: `npm install`
2. Entrada con import temprano: `index.js` en la raíz (antes de `expo-router/entry`)
3. Limpia Metro y recompila nativo:

```bash
npx expo start --dev-client -c
# En otra terminal:
npx expo run:android
# o
npx expo run:ios
```

Abre la app **noteFlow** (icono del proyecto), no Expo Go.

### `Couldn't find a screen named 'index'` en `notas/_layout.tsx`

Efecto en cadena: si `index.tsx` no carga (por el error anterior), Expo Router solo registra `[id]`. Arregla Gesture Handler y reinicia Metro con `-c`.

---

## Prueba manual

1. Abre una lista con al menos un ítem.
2. Desliza una tarjeta hacia la **izquierda** hasta ver «Eliminar».
3. Suelta pasado el umbral → debe aparecer el diálogo de confirmación.
4. Confirma → el ítem desaparece (API o fallback local).
5. En modo selección (long press), el swipe debe estar **desactivado**.

## Relación con animaciones de entrada

Las entradas escalonadas (`FadeInDown` en `AnimatedCardWrapper`) siguen en la envoltura exterior; el gesto actúa sobre el contenido deslizable interior.
