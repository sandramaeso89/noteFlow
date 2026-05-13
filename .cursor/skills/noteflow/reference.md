# Referencia extendida — NoteFlow

Material **opcional** o **transversal** (sobre todo web y correo). El núcleo móvil de NoteFlow está en [`SKILL.md`](SKILL.md) y en [`docs/idea.md`](../../../docs/idea.md).

---

## NoteFlow: resumen de alcance (v1)

Según `docs/idea.md`:

- CRUD de **Reuniones**, **Acciones** y **Referencias**.
- Lista principal **fluida** (FlashList cuando esté integrado).
- Filtros / estados: pendiente-hecha, activa-archivada donde aplique.
- **Archivar** sin borrar historial útil.
- **Persistencia local** entre sesiones.
- **Navegación** clara (captura, lista, detalle).
- **Sistema de diseño** mínimo coherente.

Roadmap opcional (búsqueda, recordatorios, etiquetas, sync, export JSON, etc.) está documentado en la misma `idea.md`.

---

## Productividad y apps móviles (contexto 2025–2026)

- Captura **rápida** y ordenación después; fricción mínima post-reunión.
- Listas **performantes** y estados vacíos bien diseñados.
- **Modo oscuro** suele ser valorado en apps de productividad.
- Privacidad: datos locales + transparencia si en el futuro hay nube o cuentas.

### Identidad visual (rellenar cuando exista tema en código)

- **Minimalismo:** cada pantalla con propósito claro.
- Centralizar **tokens** (color, tipo, espaciado) en `src/theme` o equivalente; no dispersar hex/radius sueltos.

---

## Estructura genérica si el curso usa solo `app/` sin `src/`

Algunos repos Expo concentran componentes en `app/components` o `components/` en raíz. **Respeta** la estructura que exista tras el scaffold; la guía en `SKILL.md` es orientativa.

---

## Correo HTML transaccional y hosting (proyectos web / futuro)

> Solo relevante si NoteFlow o un módulo asociado envía correo HTML desde servidor. Útil como referencia de Sandra en otros trabajos.

### Límites de clientes de correo

- Gmail suele recortar si el HTML supera **~102 KB** de fuente.
- Preferir **correo corto + PDF o enlace** para textos largos.

### Maquetado compatible

- Tablas `role="presentation"`, estilos **inline**, ancho útil ~600px.
- Evitar grid/flex como único layout del cuerpo del mensaje.

### Envío seguro

- Placeholders sustituidos con **escape HTML** en servidor.
- `html` + `text` plano en multipart cuando el proveedor lo permita.
- No incrustar secretos en plantillas.

---

## Checklist legal (RGPD + LSSI) — recordatorio web

Si la app incorpora **formularios**, **analytics** o **cookies** no esenciales en web o políticas:

- [ ] Consentimiento explícito enlazado a política de privacidad en formularios.
- [ ] Banner de cookies solo si hay cookies no esenciales.
- [ ] Política actualizada: finalidad, base jurídica, conservación, derechos ARCO+.
- [ ] Encargos de tratamiento si se gestionan datos de terceros por cuenta de un cliente.

Para apps **solo locales** sin cuenta, muchos ítems no aplican aún; revisar de nuevo al añadir sync o identificación de usuario.
