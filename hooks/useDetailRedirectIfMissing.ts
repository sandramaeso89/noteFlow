/**
 * En detalle [id]: recarga el store y vuelve al listado si el id ya no existe
 * (p. ej. ruta antigua de seed local o navegación restaurada por Expo Router).
 */
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { useNotesStore } from '../store/notesStore';

type ListPath = '/notas' | '/checklists' | '/ideas';

export function useDetailRedirectIfMissing(found: boolean, listPath: ListPath) {
  const refreshNotes = useNotesStore((s) => s.refreshNotes);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void refreshNotes().finally(() => setReady(true));
  }, [refreshNotes]);

  useEffect(() => {
    if (ready && !found) {
      router.replace(listPath);
    }
  }, [ready, found, listPath]);

  return ready;
}
