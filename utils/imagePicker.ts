/**
 * Selección de imágenes desde galería o cámara (expo-image-picker).
 * Pide permiso al SO antes de acceder (enunciado del tutor).
 */
import * as ImagePicker from 'expo-image-picker';

import { handlePermissionResult } from './permissions';

export type PickedImage = {
  uri: string;
  width?: number;
  height?: number;
};

/** Abre la galería con recorte cuadrado 1:1 (avatar). */
export async function pickImageFromGallery(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (
    !handlePermissionResult(
      permission,
      'Necesitamos permiso para acceder a tu galería.'
    )
  ) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
  };
}

/** Abre la cámara (útil para adjuntos o avatar en fases posteriores). */
export async function takePhotoWithCamera(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (
    !handlePermissionResult(permission, 'Necesitamos permiso para usar la cámara.')
  ) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
  };
}
