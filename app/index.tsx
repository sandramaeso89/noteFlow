/**
 * Punto de entrada de la app (ruta `/`).
 * Redirige de inmediato a la pestaña Notas; no hay pantalla de bienvenida.
 */
import { Redirect } from 'expo-router';

// Entrada: la app vive en pestañas; la primera pestaña es Notas
export default function Index() {
  return <Redirect href="/notas" />;
}
