/**
 * Menú contextual (⋯) del header en pantallas de detalle.
 * Muestra Archivar o Restaurar/Eliminar según si el ítem está archivado.
 */
import { useState } from 'react';
import { IconButton, Menu } from 'react-native-paper';

import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';

type DetailHeaderMenuProps = {
  isArchived: boolean;
  onArchive: () => void;
  onRestore?: () => void;
  onDeletePermanent: () => void;
};

export function DetailHeaderMenu({
  isArchived,
  onArchive,
  onRestore,
  onDeletePermanent,
}: DetailHeaderMenuProps) {
  const colors = useNoteFlowColors();
  const [visible, setVisible] = useState(false);

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <IconButton
          icon="dots-vertical"
          onPress={() => setVisible(true)}
          iconColor={colors.textPrimary}
          accessibilityLabel="Más acciones"
        />
      }
    >
      {isArchived && onRestore ? (
        // Desde Archivadas: volver a la pestaña activa correspondiente.
        <Menu.Item
          leadingIcon="archive-arrow-up"
          onPress={() => {
            setVisible(false);
            onRestore();
          }}
          title="Restaurar"
        />
      ) : null}
      {!isArchived ? (
        <Menu.Item
          leadingIcon="archive-outline"
          onPress={() => {
            setVisible(false);
            onArchive();
          }}
          title="Archivar"
        />
      ) : (
        // En archivo: borrado irreversible (no hay papelera intermedia).
        <Menu.Item
          leadingIcon="trash-can-outline"
          onPress={() => {
            setVisible(false);
            onDeletePermanent();
          }}
          title="Eliminar definitivamente"
          titleStyle={{ color: colors.error }}
        />
      )}
    </Menu>
  );
}
