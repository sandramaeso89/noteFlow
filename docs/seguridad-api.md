# Seguridad API: SQL injection y secretos

Esta guía resume riesgos básicos de seguridad al construir endpoints para `noteflow-api`.

---

## Qué es SQL injection

La **inyección SQL** ocurre cuando datos de entrada del usuario se concatenan directamente dentro de una consulta SQL.
Si el backend mezcla SQL + input sin control, un atacante puede alterar la consulta y leer, modificar o borrar datos.

Ejemplo de vector malicioso en un campo `title`:

```text
'; DROP TABLE notes;--
```

---

## Ejemplo vulnerable (no usar)

```ts
// vulnerable: concatenación directa
const title = req.body.title; // vector de ataque: "'; DROP TABLE notes;--"
const query = "SELECT * FROM notes WHERE title = '" + title + "'";
const rows = await db.query(query);
```

Problema:

- El valor del usuario entra en la cadena SQL como si fuera parte del código.
- El motor puede interpretar contenido malicioso como instrucciones SQL válidas.

---

## Ejemplo seguro: consultas parametrizadas

```ts
// seguro: consulta parametrizada
const query = 'SELECT * FROM notes WHERE title = $1';
const rows = await db.query(query, [req.body.title]);
```

Por qué funciona:

- La estructura de la consulta y los datos viajan por separado.
- PostgreSQL trata `$1` como parámetro de datos, nunca como código ejecutable.
- Se reduce el riesgo de inyección incluso si la entrada contiene comillas o payloads maliciosos.

Buenas prácticas adicionales:

- Validar y sanear input (por ejemplo con Zod) antes de consultar.
- Limitar longitud y formato de campos (`title`, `tag`, etc.).
- Registrar intentos fallidos sin exponer SQL interno al cliente.

---

## Variables de entorno y secretos

Una **variable de entorno** es un valor de configuración externo al código fuente (por ejemplo `DATABASE_URL`).
Sirve para inyectar secretos en runtime sin hardcodearlos en archivos versionados.

### Por qué el connection string nunca debe aparecer en código

- Si queda en el repo, puede filtrarse por commits, forks o capturas.
- Si se incrusta en app cliente, cualquiera puede extraerlo del binario.
- Con acceso al string, un atacante podría conectarse directamente a la base de datos.

### Regla práctica en NoteFlow

- Guardar `DATABASE_URL` solo en `noteflow-api/.env.local`.
- Mantener `.env.local` fuera de git (`.gitignore`).
- Versionar solo la plantilla `noteflow-api/.env.example` con valor vacío.

---

## Checklist rápida antes de exponer endpoints

- [ ] Todas las consultas usan parámetros (`$1`, `$2`, ...).
- [ ] No hay concatenación SQL con input de usuario.
- [ ] Inputs validados con Zod.
- [ ] Errores internos de base de datos no se devuelven al cliente.
- [ ] `DATABASE_URL` no aparece en código, commits ni documentación con valor real.
