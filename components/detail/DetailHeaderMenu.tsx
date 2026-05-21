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
