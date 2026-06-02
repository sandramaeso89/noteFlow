/**
 * Permisos del SO: primera solicitud vs denegado permanente (ir a Ajustes).
 */
import { Alert, Linking } from 'react-native';

export type PermissionResponseLike = {
  status: string;
  canAskAgain?: boolean;
};

/** Muestra diálogo con opción de abrir Ajustes del sistema. */
export function promptOpenSettings(message: string): void {
  Alert.alert('Permiso necesario', message, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Abrir Ajustes',
      onPress: () => {
        void Linking.openSettings();
      },
    },
  ]);
}

/**
 * Comprueba respuesta de request*PermissionsAsync.
 * Devuelve true si el permiso quedó concedido.
 */
export function handlePermissionResult(
  response: PermissionResponseLike,
  deniedMessage: string
): boolean {
  if (response.status === 'granted') {
    return true;
  }

  if (response.canAskAgain === false) {
    promptOpenSettings(
      `${deniedMessage}\n\nActívalo en Ajustes del dispositivo para continuar.`
    );
  } else {
    Alert.alert('Permiso necesario', deniedMessage);
  }

  return false;
}
