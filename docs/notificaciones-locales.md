# Notificaciones locales y permisos nativos

NoteFlow usa **módulos nativos** (vía Expo) para recursos sensibles del SO: galería, cámara y **notificaciones locales**.

## Modelo de permisos (iOS/Android)

| Escenario | Comportamiento de la app |
|-----------|---------------------------|
| Primera solicitud | El SO muestra el diálogo nativo (`requestPermissionsAsync`). |
| Denegado, aún se puede preguntar | `Alert` explicando por qué hace falta el permiso. |
| Denegado permanentemente (`canAskAgain === false`) | `Alert` con botón **Abrir Ajustes** → `Linking.openSettings()`. |

Utilidad compartida: `utils/permissions.ts` (`handlePermissionResult`, `promptOpenSettings`).

## Notificaciones locales (`expo-notifications`)

- **No requieren servidor:** el dispositivo programa y entrega la notificación a la hora indicada.
- **Handler en primer plano:** `configureNotificationHandler()` en `app/_layout.tsx`.
- **Programar recordatorio:** `scheduleReminder(title, date)` en `utils/notifications.ts`.
- **UI:** al crear una **nota** en `app/nueva-note.tsx`, interruptor «Recordatorio local» + selector de fecha/hora.

## Galería y cámara

`utils/imagePicker.ts` usa el mismo patrón de permisos antes de abrir galería o cámara.

## Probar en dispositivo

1. Tras instalar `expo-notifications`, **recompilar** el dev build (módulo nativo nuevo):
   ```bash
   npx expo run:android
   # o npx expo run:ios
   ```
2. Crear una nota con recordatorio en **1–2 minutos**.
3. Conceder permiso de notificaciones cuando el SO lo pida.
4. Minimizar la app y esperar la alerta.

Si deniegas el permiso dos veces, prueba **Abrir Ajustes** desde el diálogo de la app.

## Enlaces de código

- `utils/notifications.ts`
- `utils/permissions.ts`
- `app/_layout.tsx`
- `app/nueva-note.tsx`
