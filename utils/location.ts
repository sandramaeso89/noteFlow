/**
 * Geolocalización con expo-location (GPS + geocodificación inversa).
 */
import * as Location from 'expo-location';
import { Alert } from 'react-native';

import { handlePermissionResult } from './permissions';

export type NoteLocation = {
  latitude: number;
  longitude: number;
  name: string;
};

/** Lee posición actual y devuelve coordenadas + etiqueta legible (calle, ciudad). */
export async function getCurrentAddress(): Promise<NoteLocation | null> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (
    !handlePermissionResult(
      permission,
      'Necesitamos permiso para usar tu ubicación al crear la nota.'
    )
  ) {
    return null;
  }

  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    Alert.alert(
      'Ubicación desactivada',
      'Activa el GPS en Ajustes del dispositivo. En el emulador Android: panel lateral ⋮ → Location → elige un punto en el mapa.'
    );
    return null;
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const [address] = await Location.reverseGeocodeAsync(position.coords);

    const street = address?.street ?? address?.name ?? '';
    const city = address?.city ?? address?.subregion ?? '';
    const name =
      [street, city].filter((part) => part.length > 0).join(', ') || 'Ubicación actual';

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      name,
    };
  } catch {
    Alert.alert(
      'No se pudo obtener la ubicación',
      'En el emulador: Extended controls (⋮) → Location y marca una posición. En móvil real: activa GPS y prueba al aire libre o cerca de una ventana.'
    );
    return null;
  }
}
