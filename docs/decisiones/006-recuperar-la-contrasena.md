# 006 — Recuperar la contraseña: mail local y link sin tabla de tokens

**Estado:** aceptada — 4 de octubre de 2026

## Contexto

La pantalla *Recuperar la contraseña* existía, pero no hacía nada: mostraba "Revisá tu email" sin llamar a la API. Quien administra una organización y olvida su contraseña quedaba afuera, salvo que alguien la cambiara a mano en la base.

Recuperarla exige mandar un mail, y eso choca con una restricción de la cátedra: `docker compose up` tiene que levantar el proyecto en una máquina limpia, **sin depender de cuentas externas**. Un servicio de envío (Gmail, Resend, SendGrid) es exactamente una cuenta externa.

Había dos decisiones: cómo se manda el mail y cómo se valida el link.

## Opciones consideradas

### Cómo se manda el mail

1. **Servidor de mail local (Mailpit) en el docker-compose.** La API manda por SMTP a un contenedor que atrapa los mails y los muestra en `http://localhost:8025`.
   - En contra: un servicio más en el compose y una dependencia (`nodemailer`). Los mails no llegan a una casilla real: para producción hay que apuntar las variables a un SMTP de verdad.
2. **Sacar la pantalla y el link "Olvidé mi contraseña".**
   - En contra: una contraseña olvidada se resuelve a mano en la base.
3. **Dejarla como estaba.**
   - En contra: la pantalla promete algo que no pasa. Se evalúa lo que funciona.

### Cómo se valida el link

1. **Token firmado, sin tabla.** Un JWT de una hora firmado con el secreto de la API **más el hash de la contraseña actual**.
   - En contra: no se puede anular un link suelto ni listar los pedidos; depende del secreto de la API.
2. **Tabla `TokenRecuperacion`** con el hash del token, vencimiento y fecha de uso.
   - En contra: una migración y un modelo más en un schema ya entregado, y una limpieza periódica de tokens viejos, para algo que la firma resuelve sola.

## Decisión

**Mailpit** para el envío y **token firmado sin tabla** para el link.

- `POST /api/auth/recuperar-contrasena` responde `204` exista o no la cuenta. Si existe, manda el mail sin esperar a que salga.
- El link lleva a `/restablecer-contrasena?token=…`. `POST /api/auth/restablecer-contrasena` valida el token y guarda la contraseña nueva.
- El envío está en `apps/api/src/lib/correo.ts` y se configura con `SMTP_HOST`, `SMTP_PORT` y `WEB_URL`. **Sin `SMTP_HOST`, el mail se imprime en la consola de la API.**

## Por qué

- **Funciona en la demo sin cuentas externas.** Mailpit es una imagen pública que levanta con el resto; el mail se ve en el navegador.
- **Pasar a un SMTP real es cambiar variables de entorno**, no código.
- **El link sirve una sola vez sin guardar nada.** Al cambiar la contraseña cambia el hash, y con él la clave con la que se firmó el token: la firma deja de valer. Lo mismo si se piden dos links: usar uno anula el otro.
- **No se revela qué emails están registrados.** La respuesta es la misma en los dos casos y no espera al envío, así que tampoco se nota por el tiempo. Es el mismo criterio que ya usa el ingreso.
- **El token de recuperación no sirve como sesión, ni al revés:** se firman con claves distintas y el de recuperación lleva una marca propia.

## Qué se resigna

- **Mails reales.** Hasta configurar un SMTP de verdad, el link solo lo ve quien tiene acceso a Mailpit o a la consola de la API.
- **Anular un link a mano** y **auditar pedidos.** No queda registro de quién pidió recuperar ni cuándo.
- **Límite de pedidos.** Nada impide pedir muchos links seguidos para una misma cuenta. No da acceso a nada, pero llenaría la casilla; un límite por IP queda pendiente para antes de un deploy público.
- **Las sesiones abiertas siguen valiendo.** Cambiar la contraseña no cierra las sesiones que ya estaban iniciadas: el token de sesión dura 7 días y no depende de la contraseña.
