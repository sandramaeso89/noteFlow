# Geolocalización (expo-location)

NoteFlow lee el **GPS del dispositivo** con `expo-location`, pide permiso en primer plano y guarda **latitude** / **longitude** en Neon cuando la API está disponible.

## Flujo en la app

1. En **Nueva nota** → **Usar mi ubicación**.
2. `getCurrentAddress()` en `utils/location.ts`:
   - `requestForegroundPermissionsAsync()`
   - `getCurrentPositionAsync()`
   - `reverseGeocodeAsync()` → nombre legible (calle, ciudad)
3. Al guardar, `addNote` envía coordenadas a `POST /api/notes` o las persiste en AsyncStorage (fallback local).

## Permisos

Mismo patrón que galería y notificaciones: si el usuario bloquea el permiso, `utils/permissions.ts` ofrece **Abrir Ajustes**.

## Backend (Neon)

Ejecuta en el SQL Editor de Neon:

[`sql/migrations/002_notes_location.sql`](../sql/migrations/002_notes_location.sql)

```sql
ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;
```

Sin esta migración, el `POST /notes` con coordenadas fallará en producción.

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `utils/location.ts` | GPS + geocodificación inversa |
| `utils/formatLocation.ts` | Texto en listas y detalle |
| `noteflow-api/app/api/notes/route.ts` | INSERT con lat/lon |
| `lib/api.ts` | Mapeo snake_case → modelo app |
| `app/nueva-note.tsx` | Botón de ubicación |
| `app/(tabs)/notas/[id].tsx` | Muestra ubicación en detalle |

## Probar

1. Recompilar dev build tras instalar `expo-location`: `npx expo run:android` / `run:ios`.
2. Ejecutar migración SQL en Neon (si usas API Vercel).
3. Crear nota con ubicación y abrir detalle.

### Emulador Android (error «Current location is unavailable»)

El permiso de la app puede estar concedido, pero el **emulador no tiene coordenadas** hasta que tú las defines:

1. En la ventana del emulador, abre **Extended controls** (icono **⋮** o tres puntos).
2. Pestaña **Location**.
3. Elige un punto en el mapa (p. ej. Madrid) o escribe lat/lon → **Set location**.
4. Vuelve a la app y pulsa **Usar mi ubicación**.

Alternativa por terminal (con el emulador encendido):

```bash
# Longitud primero, luego latitud (ejemplo: Madrid)
adb emu geo fix -3.7038 40.4168
```

En **dispositivo físico**, activa **Ubicación** en Ajustes del sistema.

## Reanimated y gestos

La app usa **react-native-reanimated** en listas y layout (`AnimatedCardWrapper`, `app/_layout.tsx`) y **react-native-gesture-handler** para swipe-to-delete (`SwipeableCard`). Ver [`gestos-swipe.md`](gestos-swipe.md). La geolocalización no depende de esas librerías.
