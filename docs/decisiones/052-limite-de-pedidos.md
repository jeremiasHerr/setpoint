# 052 — Límite de pedidos sin login

**Estado:** aceptada — 25 de octubre de 2026.

## Contexto

Con la [decisión 049](049-identidad-e-ingreso-con-codigo.md), cualquiera puede pedir un código de ingreso para cualquier email, y probar códigos. Más adelante, la búsqueda en el padrón ([decisión 051](051-vinculacion-con-el-padron.md)) también se usa sin login. Sin límites, se puede llenar la casilla de otra persona con códigos, o probar el millón de códigos posibles.

La API no tenía ningún límite. La [decisión 006](006-recuperar-la-contrasena.md) lo había dejado pendiente para la recuperación de la contraseña.

## Opciones consideradas

1. **Los límites por email en la base y el límite por IP con `express-rate-limit`, en memoria.** La tabla de códigos ya sabe cuántos pidió cada email y cuántos intentos lleva cada código.
   - En contra: el límite por IP se reinicia si se reinicia la API, y con varias instancias cada una contaría por su lado.
2. **Todo en la base, también el límite por IP.**
   - En contra: más código propio y una tabla más, para un problema que la librería ya resuelve.
3. **Solo `express-rate-limit`.**
   - En contra: no sabe de emails ni de códigos. "5 intentos por código" y "no más de 5 códigos por email" quedarían sin cubrir.

## Decisión

Opción 1.

- **Por email, en la base:** como mucho 5 códigos pedidos mientras dura uno (10 minutos), y 5 intentos por código. Pasado el primero, `429 DEMASIADOS_PEDIDOS`; pasado el segundo, `400 DEMASIADOS_INTENTOS`.
- **Por IP, en memoria:** 30 pedidos cada 15 minutos entre pedir y verificar códigos (`middleware/limite.ts`). Pasado, `429 DEMASIADOS_PEDIDOS`. El mismo middleware va a servir para la búsqueda en el padrón.

## Por qué

- **Los límites que importan para la seguridad sobreviven a un reinicio**, porque están en la base: nadie puede probar más de 5 códigos por código pedido, ni pedir más de 5 por email.
- **El límite por IP es una segunda capa** contra quien pruebe muchos emails desde un mismo lugar. Que se reinicie con la API no abre nada que la primera capa no cubra.
- **No hace falta otra tabla** ni mantener código propio de ventanas de tiempo.
- **30 es holgado para un club:** varios jugadores detrás de la misma conexión se inscriben a la vez sin chocar con el límite.

## Qué se resigna

- **Con varias instancias de la API**, el límite por IP sería por instancia. Para un deploy así, la librería acepta un almacenamiento compartido sin cambiar las rutas.
- **Una dependencia más** (`express-rate-limit`).
- **La recuperación de la contraseña** sigue sin límite: no da acceso a nada y queda solo para administradores.
