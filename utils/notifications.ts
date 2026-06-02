/**
 * Notificaciones locales (expo-notifications): permisos y recordatorios programados.
 */
import * as Notifications from 'expo-notifications';

import { handlePermissionResult } from './permissions';

/** Configura alerta/sonido cuando la app está en primer plano (enunciado del tutor). */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/** Pide permiso de notificaciones; si está bloqueado, sugiere Ajustes. */
export async function ensureNotificationPermissions(): Promise<boolean> {
  const response = await Notifications.requestPermissionsAsync();
  return handlePermissionResult(
    response,
    'Necesitamos permiso para enviarte recordatorios.'
  );
}

/**
 * Programa un recordatorio local en la fecha indicada.
 * Devuelve el id de la notificación o null si no hay permiso o la fecha no es futura.
 */
export async function scheduleReminder(
  title: string,
  date: Date
): Promise<string | null> {
  if (date.getTime() <= Date.now()) {
    return null;
  }

  const granted = await ensureNotificationPermissions();
  if (!granted) {
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de NoteFlow',
      body: title.trim() || 'Tienes un recordatorio pendiente',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });

  return id;
}

/** Cancela un recordatorio programado por id. */
export async function cancelReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
