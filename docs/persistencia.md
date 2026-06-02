# Persistencia actual de datos

NoteFlow usa persistencia **hibrida**:

- **API REST + Neon** como fuente principal cuando hay JWT valido.
- **AsyncStorage por usuario** como fallback local si no hay JWT o falla la API.

La logica esta en `store/notesStore.ts`, con soporte de `lib/api.ts`, `lib/authStorage.ts` y `lib/localNotesRepository.ts`.

## Limitaciones y trade-offs (importante)

| Aspecto | Implicación |
| --------- | ------------- |
| **Sin cifrado en fallback local** | Cualquiera con acceso al almacen del dispositivo podria leer el JSON local. No uses NoteFlow para secretos. |
| **Límite de tamaño** | AsyncStorage no está pensado para megabytes de texto; listas muy grandes pueden fallar o ir lentas. |
| **Solo en este dispositivo (modo local)** | Sin sync a nube en fallback local; borrar app suele borrar datos locales. |
| **Riesgo de divergencia** | Si alternas entre API y local, puede haber diferencias hasta definir estrategia de migracion/sync. |

Para copia de seguridad o cuenta de usuario haría falta otro enfoque (export JSON, backend, etc.).

## Como esta integrado hoy

1. `notesStore.fetchNotes()` intenta cargar desde API (`ensureApiAuthToken` + `fetchNoteBuckets`).
2. Si no hay token o hay `ApiAuthError`, carga buckets locales con `loadLocalBuckets(userId)`.
3. En operaciones CRUD, intenta API primero; si falla auth/API, guarda en local con `saveLocalBuckets(userId, buckets)`.
4. IDs locales usan `createLocalId(...)` y se distinguen de UUID de Neon para evitar llamadas invalidas al backend.

**Clave local por usuario:** `noteflow-local-${userId}`.

## Carga inicial al abrir la app

1. `StoreHydrationGate` detecta sesion y llama `fetchNotes()`.
2. Si hay JWT valido, carga de API.
3. Si no hay JWT/API, carga local por usuario.
4. Si API falla sin fallback disponible, muestra error bloqueante con boton **Reintentar**.

## Indicador de carga y errores

En NoteFlow, `components/StoreHydrationGate.tsx` envuelve la navegacion en `app/_layout.tsx`:

- Si `isLoading === true`: pantalla con `ActivityIndicator` y texto "Cargando tus notas...".
- Si `loadError` existe: pantalla de error con accion de reintento.
- Si todo va bien: se renderiza la app normal (tabs, listas, modal).

La pantalla bloqueante evita operar sobre estado incompleto al arrancar.

## Cómo verificar (enunciado del curso)

1. Inicia sesion con Firebase.
2. Crea una nota nueva desde **+** y guarda.
3. Simula falta de API (URL invalida o backend caido) y vuelve a abrir la app.
4. Verifica que la app sigue mostrando datos locales del usuario.
5. Restablece API y verifica que vuelve a cargar desde backend cuando hay JWT valido.

Si no aparece: revisa token en SecureStore, `ensureApiAuthToken`, y que exista clave `noteflow-local-${userId}` en AsyncStorage.

## Enlaces

- Store de notas: [`store/notesStore.ts`](../store/notesStore.ts)
- Repositorio local: [`lib/localNotesRepository.ts`](../lib/localNotesRepository.ts)
- Cliente API: [`lib/api.ts`](../lib/api.ts)
- Gate de carga: [`components/StoreHydrationGate.tsx`](../components/StoreHydrationGate.tsx)
