# Setup de Firebase en NoteFlow

Guía de la **nueva fase del curso**: integrar **Firebase Authentication** (correo/contraseña) y **Cloud Firestore** en la app Expo con `@react-native-firebase/*`.

**Enunciado del tutor:** crear proyecto en [firebase.google.com](https://firebase.google.com), activar auth email/contraseña y Firestore; instalar:

```bash
npx expo install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

---

## Qué es la consola de Firebase

La **consola de Firebase** es la interfaz web en **[console.firebase.google.com](https://console.firebase.google.com)**. Desde ahí configuras servicios (Auth, Firestore, reglas, apps registradas). **No** es código del repo: es el panel de administración del proyecto en la nube.

**Analogía (salud):** la consola es la **dirección del hospital** (activar servicios, dar de alta terminales). La app móvil es la **sala de consulta**. Los paquetes npm son el **equipamiento** que conecta la sala con el hospital.

---

## Relación con lo que ya teníamos

NoteFlow **sigue usando** (de momento) la API propia:

| Capa actual | Tecnología |
|-------------|------------|
| Login en app | JWT + `expo-secure-store` → [`docs/auth-api.md`](auth-api.md) |
| Datos de notas | API Next.js + Neon PostgreSQL → [`noteflow-api/`](../noteflow-api/) |

Firebase es una **fase nueva del curso**. Instalar las librerías **no sustituye** automáticamente JWT ni Neon; el tutor indicará cuándo conectar la app a Firebase en código.

---

## Progreso (sesión junio 2026)

### Hecho en la consola Firebase

| Paso | Estado | Notas |
|------|--------|-------|
| Crear proyecto **noteFlow** | Hecho | Plan **Spark** (gratuito) |
| Entrar en la consola | Hecho | [console.firebase.google.com](https://console.firebase.google.com) → proyecto noteFlow |
| Iniciar **Firestore Database** | Hecho | Modo prueba |
| **Authentication** email/contraseña | Hecho | Consola → Sign-in method |

### Hecho en el repo (Mac / código)

| Paso | Estado | Dónde |
|------|--------|-------|
| Instalar paquetes Firebase | Hecho | `package.json` — `@react-native-firebase/app`, `auth`, `firestore` ^24.0.0 |
| Plugin `@react-native-firebase/app` en `app.json` | Hecho | `app.json` → `plugins` |
| Rutas a archivos de config nativos | Hecho | `android.googleServicesFile`, `ios.googleServicesFile` en `app.json` |
| Identificadores Android / iOS | Hecho | `noteFlow.ANDROID` / `noteFlowIOS` — alineados con Firebase |
| Plugins `auth` + `firestore` | Hecho | `app.json` → `plugins` |
| Código Auth + perfil Firestore | Hecho | `lib/firebaseAuth.ts`, `app/login.tsx`, `app/register.tsx` |
| `google-services.json` / `GoogleService-Info.plist` en la raíz | Hecho | Raíz del repo, alineados con `app.json` |
| **Development Build (EAS)** | Pendiente | `@react-native-firebase` **no funciona en Expo Go** — ver abajo |

### Pendiente en la consola Firebase

- [x] Firestore creado (modo prueba)
- [x] **Authentication** → **Correo electrónico/Contraseña** activado
- [x] Apps Android e iOS registradas
- [x] **`google-services.json`** y **`GoogleService-Info.plist`** descargados
- [ ] (Más adelante) Endurecer **reglas de Firestore** — el modo prueba expira y es inseguro en producción

---

## Descargar y colocar archivos de config (paso del tutor)

Los archivos **no se generan solos** en el repo: los crea Firebase cuando registras cada app móvil. Deben estar en la **raíz** de NoteFlow (misma carpeta que `app.json`):

```text
noteFlow/
  app.json
  google-services.json          ← Android
  GoogleService-Info.plist      ← iOS
  package.json
  …
```

### Identificadores (importante)

Al registrar cada app en Firebase, usa **exactamente** estos valores (ya definidos en `app.json`):

| Plataforma | Campo en Firebase | Valor |
|------------|-------------------|-------|
| Android | Nombre del paquete de Android | `noteFlow.ANDROID` |
| iOS | ID del paquet de iOS (Bundle ID) | `noteFlowIOS` |

Si pones otro nombre en la consola, el `.json` / `.plist` descargado **no coincidirá** con la app y Firebase fallará al arrancar.

### Android — `google-services.json`

1. Consola → **Project Overview** → icono **Android** (o **+ Agregar app**).
2. Nombre del paquete: `noteFlow.ANDROID`.
3. Registra la app → **Descargar google-services.json**.
4. Mueve el archivo a la raíz del repo (arrastrar desde Descargas o en terminal):

```bash
mv ~/Downloads/google-services.json ~/Desktop/Projects/noteFlow/
```

### iOS — `GoogleService-Info.plist`

1. Consola → **Project Overview** → icono **iOS**.
2. ID del paquet: `noteFlowIOS`.
3. Registra la app → **Descargar GoogleService-Info.plist**.
4. Colócalo en la raíz:

```bash
mv ~/Downloads/GoogleService-Info.plist ~/Desktop/Projects/noteFlow/
```

### Plugin en `app.json` (ya aplicado)

El tutor pide el plugin base de Firebase:

```json
"plugins": [
  "@react-native-firebase/app"
]
```

En NoteFlow también se mantienen `expo-router`, `expo-secure-store` y `@react-native-firebase/auth` (fase auth). Las rutas a los archivos:

```json
"android": {
  "package": "noteFlow.ANDROID",
  "googleServicesFile": "./google-services.json"
},
"ios": {
  "bundleIdentifier": "noteFlowIOS",
  "googleServicesFile": "./GoogleService-Info.plist"
}
```

---

## Flujo Auth + perfil en Firestore (implementado)

| Pieza | Dónde |
|-------|--------|
| Registro (Auth + doc `users/{uid}`) | `lib/firebaseAuth.ts` → `registerWithProfile` |
| Login | `lib/firebaseAuth.ts` → `loginWithEmail` |
| Pantalla login | `app/login.tsx` |
| Pantalla registro (campo nombre) | `app/register.tsx` |
| Validación Zod | `schemas/authSchemas.ts` |
| Estado global sesión | `store/authStore.ts` + `auth().onAuthStateChanged` en `app/_layout.tsx` |
| Colección Firestore | `users` — campos: `name`, `email`, `createdAt`, `avatarUrl` |

**Notas:** la API REST (Neon) sigue en el repo; con sesión Firebase las listas pueden ir vacías hasta migrar notas a Firestore. Probar requiere **Development Build**.

---

**Qué hace:** instala las tres librerías con versiones compatibles con **Expo SDK 54** y actualiza `package.json` / `package-lock.json`.

**Qué no hace:**

- No activa Auth ni Firestore en la consola
- No registra la app en Firebase
- No añade los archivos de configuración nativos
- No hace que la app funcione solo escaneando el QR de **Expo Go**

Ejecutar desde la raíz del proyecto:

```bash
cd ~/Desktop/Projects/noteFlow
npx expo install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

*(Ya ejecutado en este repo; repetir solo tras `git pull` si el tutor añade dependencias.)*

---

## Expo Go vs Development Build

`@react-native-firebase/*` incluye **código nativo** que Expo Go no trae preinstalado.

| Entorno | ¿Firebase nativo? |
|---------|-------------------|
| **Expo Go** (QR) | No — fallará al usar estos módulos |
| **Development Build** (EAS) | Sí — binario propio con plugins nativos |

Detalle: [`expo-go-vs-development-build.md`](expo-go-vs-development-build.md).

Pasos futuros típicos: `expo-dev-client`, colocar archivos de Firebase, `eas build --profile development`.

### Development Build con EAS (obligatorio para probar Firebase)

**Expo Go no incluye** los módulos nativos de `@react-native-firebase`. Para probar Auth o Firestore necesitas un **binario propio**:

1. Cuenta en [expo.dev](https://expo.dev) y CLI: `npm install -g eas-cli` → `eas login`.
2. En la raíz del proyecto: `eas build:configure` (crea `eas.json`).
3. Instalar cliente de desarrollo: `npx expo install expo-dev-client`.
4. Generar build de desarrollo, por ejemplo:
   - iOS simulador: `eas build --profile development --platform ios`
   - Android: `eas build --profile development --platform android`
5. Instalar el `.apk` / `.app` en el dispositivo o simulador y arrancar con `npx expo start --dev-client`.

Guía del curso: [`expo-go-vs-development-build.md`](expo-go-vs-development-build.md).

**Nota iOS:** React Native Firebase suele requerir `expo-build-properties` con `"useFrameworks": "static"` en el plugin — el tutor lo indicará en el paso de EAS si hace falta.

---

## Dónde va cada cosa (no mezclar)

| Qué | Dónde **sí** | Dónde **no** |
|-----|--------------|--------------|
| Activar Auth email/contraseña | Consola Firebase → Authentication | Código del repo |
| Crear base Firestore | Consola Firebase → Firestore | Neon SQL Editor |
| `google-services.json` | Raíz del proyecto Expo (Android) | Git con datos sensibles innecesarios — revisar `.gitignore` |
| `GoogleService-Info.plist` | Raíz o ruta que indique el plugin iOS | Mismo criterio |
| Secretos / API keys privadas de Firebase | Variables de entorno o archivos de config **fuera de git** | Comentarios, README, commits |
| Login actual de NoteFlow | JWT + API Vercel/Neon | Sustituir solo cuando el enunciado lo pida |

---

## Seguridad (prioridad)

- **Modo prueba** en Firestore: cualquiera con el SDK puede leer/escribir durante el periodo de gracia — solo para aprendizaje.
- Antes de producción: reglas que exijan `request.auth != null` y restrinjan datos por `uid`.
- Las credenciales de cliente en `google-services.json` / plist **identifican** el proyecto; la seguridad real está en **reglas de Firestore** y **Auth**.
- Datos de reuniones en Firestore siguen siendo **datos personales** (RGPD) si hay nombres de terceros.

Más contexto API: [`seguridad-api.md`](seguridad-api.md).

---

## Próximos pasos (orden sugerido)

1. Consola: terminar Firestore + activar Auth email/contraseña.
2. Consola: registrar apps Android e iOS con `noteFlow.ANDROID` / `noteFlowIOS` → descargar archivos.
3. Mac: colocar `google-services.json` y `GoogleService-Info.plist` en la **raíz** del repo.
4. Instalar `expo-dev-client` y generar **Development Build** con EAS (no Expo Go).
5. Repo: añadir plugin `@react-native-firebase/firestore` en `app.json` si el tutor lo indica.
6. Código: inicializar Firebase y conectar login/datos según el enunciado.

---

## Referencias

- [Consola Firebase](https://console.firebase.google.com)
- [React Native Firebase — Expo](https://rnfirebase.io/)
- [Expo — Development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- NoteFlow — auth actual: [`auth-api.md`](auth-api.md), setup Neon: [`setup-auth-local.md`](setup-auth-local.md)

---

*Última revisión: junio 2026 — setup Firebase del tutor completo; dev build y código en app pendientes.*
