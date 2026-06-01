# Flujo de assets (Subir foto → render remoto)

Documento de referencia para el flujo completo de un archivo de imagen desde la app móvil hasta su visualización remota con buena UX.

## Objetivo

- Subir imágenes de forma segura sin exponer credenciales AWS en la app.
- Guardar en la base de datos solo la URL pública final (`avatarUrl` o adjunto de nota).
- Mostrar imagen remota con **placeholder** mientras descarga y **caché** para mejorar rendimiento.

---

## Diagrama de flujo

```mermaid
flowchart TD
  A[Usuario pulsa "Cambiar foto"] --> B[App pide permiso galería/cámara]
  B -->|Denegado| C[Mostrar aviso permisos]
  B -->|Concedido| D[ImagePicker devuelve localUri]

  D --> E[App pide Presigned URL al backend Next.js]
  E --> F[Backend valida sesión usuario]
  F --> G[Backend genera signedUrl + publicUrl en S3]
  G --> H[App convierte localUri a Blob]
  H --> I[PUT directo a signedUrl de S3]

  I -->|OK| J[App actualiza avatarUrl en Firestore/PostgreSQL]
  I -->|Error| K[Mostrar error de subida]

  J --> L[UI renderiza imagen remota con Image]
  L --> M[Mostrar placeholder mientras descarga]
  M --> N[Imagen cargada y cacheada]
```

---

## Paso a paso técnico

1. **Selección local de imagen**
   - Módulo nativo: `expo-image-picker`.
   - Se solicita permiso con `requestMediaLibraryPermissionsAsync()` o cámara.
   - Se obtiene `asset.uri` local.

2. **Solicitud de URL firmada (backend)**
   - La app llama a un endpoint (ej. `POST /api/uploads/presigned`).
   - El backend valida autenticación.
   - El backend genera URL temporal firmada con AWS SDK.
   - Respuesta esperada: `{ signedUrl, publicUrl, key }`.

3. **Subida directa app → S3**
   - La app hace `fetch(localUri)` y obtiene `blob`.
   - La app sube con `PUT` a `signedUrl`.
   - Si devuelve 200/204, el objeto ya existe en S3.

4. **Persistencia de URL en datos de negocio**
   - Avatar: actualizar `users/{uid}.avatarUrl` en Firestore.
   - Adjuntos de nota: guardar `publicUrl` en PostgreSQL/Firestore según modelo.

5. **Render remoto en UI**
   - Componente `Image` con `source={{ uri: publicUrl }}`.
   - Añadir placeholder (`ActivityIndicator`) durante descarga.
   - Añadir estrategia de caché (`cache: 'force-cache'` en iOS).

---

## Implementación actual en NoteFlow

- Selección local y permisos: `utils/imagePicker.ts`.
- Acción de usuario: `components/UserMenuButton.tsx`.
- Render avatar remoto con UX: `components/images/RemoteAvatar.tsx`.
- Persistencia avatar: `store/authStore.ts` + `lib/userProfile.ts`.
- Subida real a S3: **pendiente** (`lib/uploadToAWS.ts` está en modo stub).

---

## Recomendaciones de seguridad

- Nunca enviar `AWS_ACCESS_KEY_ID` ni `AWS_SECRET_ACCESS_KEY` al móvil.
- URLs firmadas de corta duración (ej. 60 segundos).
- Validar `content-type` y tamaño máximo en backend.
- Guardar objetos por prefijo de usuario (`users/{uid}/...`) para trazabilidad.
- En Firestore, reglas que limiten escritura de `avatarUrl` al propio usuario autenticado.

---

## UX mínima recomendada

- Si no hay permisos: mensaje claro y acción para reintentar.
- Mientras descarga imagen remota: placeholder/skeleton visible.
- Si falla la carga remota: fallback con icono de usuario.
- Evitar parpadeo al reabrir pantalla usando caché.
