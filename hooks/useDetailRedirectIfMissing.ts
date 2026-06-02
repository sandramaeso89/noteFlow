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
  const [ready, setReady] = useState(found);

  useEffect(() => {
    // Si la nota ya está en memoria (p. ej. local), no recargar API: evita 401 → logout.
    if (found) {
      setReady(true);
      return;
    }

    void refreshNotes().finally(() => setReady(true));
  }, [refreshNotes, found]);

  useEffect(() => {
    if (ready && !found) {
      router.replace(listPath);
    }
  }, [ready, found, listPath]);

  return ready;
}
