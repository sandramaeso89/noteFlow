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
| Iniciar **Firestore Database** | En curso | Asistente «Crea una base de datos» — paso 2 (ID y ubicación) |
| ID de base de datos `(default)` | Hecho | Valor por defecto recomendado |
| Ubicación **nam5 (United States)** | Elegida | La ubicación **no se puede cambiar** después; para Europa suele preferirse `eur3` en proyectos reales |

### Hecho en el repo (Mac / código)

| Paso | Estado | Dónde |
|------|--------|-------|
| Instalar paquetes Firebase | Hecho | `package.json` — `@react-native-firebase/app`, `auth`, `firestore` ^24.0.0 |
| Plugins Expo (parcial) | Hecho | `app.json` — `@react-native-firebase/app`, `@react-native-firebase/auth` |
| Plugin Firestore en `app.json` | Pendiente | Falta `@react-native-firebase/firestore` en `plugins` |
| Código que use Firebase | Pendiente | Sin imports en `app/` ni `lib/` todavía |
| `google-services.json` / `GoogleService-Info.plist` | Pendiente | Requiere **+ Agregar app** en la consola |
| **Development Build** | Pendiente | `@react-native-firebase` **no funciona en Expo Go** — ver abajo |

### Pendiente en la consola Firebase

- [ ] Terminar Firestore — paso 3 **Configurar** (modo **prueba** suele bastar para el curso)
- [ ] **Authentication** → Sign-in method → activar **Correo electrónico/Contraseña**
- [ ] **Project Overview** → **+ Agregar app** (Android y/o iOS)
- [ ] Descargar **`google-services.json`** (Android) y/o **`GoogleService-Info.plist`** (iOS)
- [ ] (Más adelante) Endurecer **reglas de Firestore** — el modo prueba expira y es inseguro en producción

---

## El comando `npx expo install …`

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
2. Consola: **+ Agregar app** → descargar archivos de config.
3. Repo: añadir plugin `@react-native-firebase/firestore` en `app.json` si el tutor lo indica.
4. Repo: colocar `google-services.json` / plist y configurar `android.package` / `ios.bundleIdentifier` alineados con Firebase.
5. Instalar `expo-dev-client` y generar **Development Build**.
6. Código: inicializar Firebase y conectar login/datos según el enunciado.

---

## Referencias

- [Consola Firebase](https://console.firebase.google.com)
- [React Native Firebase — Expo](https://rnfirebase.io/)
- [Expo — Development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- NoteFlow — auth actual: [`auth-api.md`](auth-api.md), setup Neon: [`setup-auth-local.md`](setup-auth-local.md)

---

*Última revisión: junio 2026 — consola iniciada; paquetes npm instalados; integración en código y dev build pendientes.*
