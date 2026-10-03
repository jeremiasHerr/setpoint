# 002 — A qué organización entra quien administra varias

**Estado:** aceptada — 3 de octubre de 2026

## Contexto

Un usuario puede administrar varias organizaciones: la relación `AdminOrganizacion` es N:M, pensada para que los miembros de un comité compartan un circuito sin compartir contraseña. Pero la sesión de la web guarda **una sola** organización, y todas las rutas del panel cuelgan de su slug.

Al implementar el ingreso (`POST /api/auth/ingreso`) había que decidir qué devuelve el login cuando el usuario administra más de una.

Hoy el caso no ocurre: el registro crea una organización por usuario y todavía no hay forma de sumar administradores.

## Opciones consideradas

1. **Entrar a la organización más antigua que administra** (la primera por fecha de alta del vínculo).
   - En contra: quien administre dos no puede llegar a la segunda hasta que exista un selector.
2. **Devolver la lista y mostrar un selector** cuando hay más de una.
   - En contra: obliga a hacer una pantalla de elegir organización que no está en `docs/pantallas/` y a cambiar la forma de la sesión, para un caso que todavía no existe.
3. **Rechazar el ingreso** si administra más de una.
   - En contra: es un error artificial que deja afuera a un usuario válido.

## Decisión

Opción 1. `ingresar()` en `apps/api/src/modules/auth/auth.service.ts` toma el `AdminOrganizacion` más antiguo del usuario (`orderBy: creadoEn asc`). La respuesta tiene la misma forma que la del registro, así la web guarda la sesión igual en los dos casos.

## Por qué

- **Resuelve el único caso real de hoy** (un usuario, una organización) sin código extra ni pantallas nuevas.
- **Es determinista:** el mismo usuario entra siempre a la misma organización.
- **No cierra la puerta al selector.** Si más adelante se suman administradores, agregar el selector es cambiar la respuesta del login y sumar una pantalla; el resto del panel ya trabaja con el slug de la sesión.

## Qué se resigna

- **Administrar varias organizaciones desde una cuenta.** Hasta que exista el selector, la segunda organización es inaccesible para ese usuario. Quien lo necesite tendría que usar otra cuenta.
