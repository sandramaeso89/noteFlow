/**
 * Diálogos nativos de confirmación para archivar o borrar definitivamente.
 * Encapsula Alert + haptic para no repetir la misma lógica en cada pantalla de detalle.
 */
import { Alert } from 'react-native';

import { hapticImpactLight } from './haptics';

export function confirmArchive(
  title: string,
  onConfirm: () => void
): void {
  Alert.alert(
    'Archivar',
    `¿Archivar «${title}»? Podrás verlo en la pestaña Archivadas.`,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Archivar',
        onPress: () => {
          void hapticImpactLight();
          onConfirm();
        },
      },
    ]
  );
}

export function confirmPermanentDelete(
  title: string,
  onConfirm: () => void
): void {
  Alert.alert(
    'Eliminar definitivamente',
    `¿Borrar «${title}»? No se puede deshacer.`,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void hapticImpactLight();
          onConfirm();
        },
      },
    ]
  );
}

/** Confirma archivar varios ítems a la vez. */
export function confirmBulkArchive(
  count: number,
  singular: string,
  plural: string,
  onConfirm: () => void
): void {
  const label = count === 1 ? singular : plural;
  Alert.alert(
    'Archivar selección',
    `¿Archivar ${count} ${label}? Podrás verlas en Archivadas.`,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Archivar',
        onPress: () => {
          void hapticImpactLight();
          onConfirm();
        },
      },
    ]
  );
}
