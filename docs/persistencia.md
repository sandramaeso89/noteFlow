# Persistencia local con AsyncStorage

NoteFlow guarda notas, checklists e ideas en el dispositivo con [**AsyncStorage**](https://react-native-async-storage.github.io/async-storage/) y el middleware **`persist`** de Zustand (`store/notesStore.ts`).

## Limitaciones (importante)

| Aspecto | Implicación |
|---------|-------------|
| **Sin cifrado** | Cualquiera con acceso al almacén del dispositivo podría leer el JSON. No uses NoteFlow para secretos. |
| **Límite de tamaño** | AsyncStorage no está pensado para megabytes de texto; listas muy grandes pueden fallar o ir lentas. |
| **Solo en este dispositivo** | No hay sincronización entre móvil y tablet; borrar la app suele borrar los datos. |

Para copia de seguridad o cuenta de usuario haría falta otro enfoque (export JSON, backend, etc.).

## Cómo está integrado

```ts
export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({ /* estado + acciones */ }),
    {
      name: 'noteflow-storage',
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: storeDateReviver, // fechas ISO → Date
      }),
      partialize: (state) => ({
        notes: state.notes,
        checklists: state.checklists,
        ideas: state.ideas,
      }),
    }
  )
);
```

- **Clave en disco:** `noteflow-storage` (JSON serializado).
- **`partialize`:** solo se guardan los tres arrays; las funciones del store y `_hasHydrated` no se persisten.
- **Fechas:** al guardar, `Date` pasa a string ISO; al leer, `storeDateReviver` en `utils/storeSerialization.ts` las convierte otra vez a `Date`.

## Rehidratación: qué ocurre al abrir la app

1. **Arranque:** Zustand crea el store con el estado inicial en memoria (incluye datos **seed** si es la primera vez).
2. **Lectura asíncrona:** `persist` lee `noteflow-storage` en AsyncStorage.
3. **Parseo:** el JSON se fusiona con el store; las fechas se reparan con el `reviver`.
4. **Fin:** se ejecuta `onRehydrateStorage` y `persist.onFinishHydration`; el flag `_hasHydrated` pasa a `true`.

Hasta el paso 4, la UI **no debería** asumir que los datos en pantalla son los definitivos: podría mostrarse un instante el seed y luego sustituirse por lo guardado.

## Indicador de carga mientras rehidrata

En NoteFlow, `components/StoreHydrationGate.tsx` envuelve la navegación en `app/_layout.tsx`:

- Si `_hasHydrated === false`: pantalla con `ActivityIndicator` y texto «Cargando tus notas…».
- Cuando termina la rehidratación: se renderiza la app normal (tabs, listas, modal).

También se comprueba `useNotesStore.persist.hasHydrated()` por si la lectura fue síncrona o muy rápida.

### Alternativas válidas

- **Splash nativo** de Expo hasta `onFinishHydration`.
- **Skeleton** en las listas en lugar de pantalla bloqueante.
- **Optimistic UI:** mostrar seed y actualizar al terminar (más riesgo de parpadeo).

La pantalla bloqueante es la opción más simple y evita que el usuario cree o borre datos sobre un estado aún no cargado.

## Cómo verificar (enunciado del curso)

1. Crea una nota nueva desde **+** y guarda.
2. Cierra la app **por completo** (quitarla del reciente / forzar cierre).
3. Vuelve a abrir NoteFlow.
4. La nota debe seguir en la lista.

Si no aparece: revisa que `persist` esté activo, que `partialize` incluya `notes` y que no haya error en consola al parsear JSON.

## Enlaces

- Store: [`store/notesStore.ts`](../store/notesStore.ts)
- Gate de hidratación: [`components/StoreHydrationGate.tsx`](../components/StoreHydrationGate.tsx)
- Gestión de estado: [`gestion-estado.md`](gestion-estado.md)
