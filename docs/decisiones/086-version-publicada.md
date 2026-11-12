# 086 — La versión publicada

**Estado:** aceptada — 12 de noviembre de 2026

## Contexto

Además de la entrega dockerizada ([decisión 085](085-entrega-dockerizada.md)), queremos SetPoint publicado en internet, en `setpoint.com.ar`, con la idea de que lo use un circuito real. Eso cierra dos decisiones abiertas que decían "revisar antes de un deploy público": el proveedor de email (17) y dónde guarda la web el token de sesión (13).

La API no puede correr en cualquier lado. Tiene dos tareas propias que corren solas: vence las reservas sin pagar cada minuto y pasa los torneos a grupos cada hora ([decisión 029](029-grupos-en-curso.md)). Si el servidor se apaga entre pedidos, las reservas vencidas no se liberan y el cupo queda trabado. Además, el límite de pedidos por IP vive en la memoria de la API ([decisión 052](052-limite-de-pedidos.md)): tiene que haber una sola instancia.

## Opciones consideradas

**Dónde se publica**

1. **Un VPS que corre el mismo `docker compose`**, con un proxy para el https.
   - En contra: hay que administrar la máquina (firewall, actualizaciones, backups de la base).
2. **Todo en un PaaS**, como Render.
   - En contra: el plan gratis se duerme a los 15 minutos y apaga las tareas de la API; su Postgres gratis se borra a los 30 días.
3. **Separado: la web en un hosting de sitios estáticos, la API en un servidor siempre prendido y la base en un Postgres administrado.**
   - En contra: tres cuentas y tres configuraciones.

**El hosting de la web**, dentro de la opción 3

1. **Vercel.**
   - En contra: su plan gratis es para uso no comercial.
2. **Cloudflare Pages.**
   - En contra: no reenvía `/api` a otro dominio sin escribir una función aparte.

**Cómo llega la web a la API**

1. **Directo a `api.setpoint.com.ar`, con CORS** que solo acepta `setpoint.com.ar`.
   - En contra: la web necesita saber la dirección de la API al compilar (`VITE_API_URL`).
2. **Una función de Cloudflare que reenvíe `/api`.**
   - En contra: código que solo existe en la versión publicada, y un salto más en cada pedido.

**Email**

1. **Resend**, con el dominio verificado.
   - En contra: el plan gratis tiene un tope bajo de mails por día.
2. **Brevo.**
   - En contra: ninguno importante con dominio propio; lo eligió el grupo por Resend.
3. **Gmail con contraseña de aplicación.**
   - En contra: los mails salen de una dirección `@gmail.com`, desde la cuenta de una persona.

**Cómo llegan los mails a Resend** (agregado después de publicar, ver *Actualización*)

1. **Por SMTP**, con el mismo `nodemailer` que usa Mailpit. Fue lo primero que se eligió.
   - En contra: Railway bloquea el SMTP saliente en los planes Trial y Hobby; solo lo habilita en Pro.
2. **Por la API HTTP de Resend**, con un `fetch`, sin dependencias nuevas. El SMTP queda para Mailpit.
   - En contra: dos caminos de envío en el código.
3. **Pasar Railway a Pro**, sin tocar código.
   - En contra: unos US$20 por mes en vez de US$5, y en el foro de Railway hay quienes siguieron con el bloqueo después de pasar a Pro.

## Decisión

| | Dónde | Dirección |
|---|---|---|
| Web | Cloudflare Pages | `https://setpoint.com.ar` |
| API | Railway, con el mismo `apps/api/Dockerfile` de la entrega | `https://api.setpoint.com.ar` |
| Base | Neon | — |
| Mails | Resend, por su API HTTP | `no-responder@setpoint.com.ar` |

- **Los mails salen por la API HTTP de Resend** cuando está `RESEND_API_KEY`. Sin ella se usa el SMTP, como en el compose de la entrega con Mailpit.
- **La web llama directo a la API**, con `VITE_API_URL`. La API acepta pedidos del navegador solo desde `WEB_URL`. En desarrollo y en el compose la variable va vacía y nada cambia.
- **La API confía en un proxy** (`trust proxy`), para que el límite por IP vea la IP de cada persona y no la del proxy de Railway.
- **Sin seed.** La versión publicada arranca vacía, y cada circuito se registra desde `/registro`. Las cuentas de prueba, con una contraseña que está en el repo, no existen ahí.
- **El token sigue en `localStorage`** (decisión abierta 13).
- **El APK se genera con el perfil `production`**, que exige https ([decisión 048](048-http-en-el-apk-de-prueba.md)).

## Por qué

- **La API reutiliza la imagen de la entrega.** Railway construye el mismo Dockerfile, así que lo que se prueba con `docker compose up` es lo que corre publicado.
- **Ningún servicio se duerme ni vence:** las tareas de la API corren, y la base no se borra.
- **Cloudflare permite uso comercial gratis**, y con el DNS del dominio en Cloudflare la web, la API y los registros de Resend se configuran en un solo lugar.
- **La API HTTP de Resend pasa por https**, que Railway no bloquea, y es lo que recomienda la documentación de Railway. Es un solo `fetch` en `correo.ts`, y la entrega no cambia: sin la clave sigue con Mailpit.
- **Llamar directo es una línea en la web.** Como el token va en el encabezado y no en una cookie, CORS no necesita credenciales.
- **El token en `localStorage` alcanza para un circuito.** Pasarlo a una cookie `httpOnly` obliga a configurar CORS con credenciales y protección CSRF, y con la web y la API en dominios distintos se complica más. React escapa todo lo que muestra y la web no inserta HTML de nadie, que es por donde entraría un script.

## Qué se resigna

- **Railway cuesta unos US$5 por mes.** Es el único servicio pago.
- **El tope de mails de Resend.** Al abrir una inscripción, cada jugador recibe un código y un comprobante el mismo día. Si un circuito grande lo supera, hay que pasar a un plan pago o a otro proveedor. Otro proveedor ya no es solo cambiar variables: un SMTP, Railway lo bloquea; otra API HTTP es otra función en `correo.ts`.
- **Dos caminos de envío**: la API de Resend en la versión publicada y el SMTP en la entrega. Lo que se prueba con Mailpit no es exactamente lo que corre publicado.
- **Si alguna vez entra un script por XSS, puede leer el token** de quien administra.
- **La web publicada depende de que la API acepte su dominio:** si cambia la dirección de la web, hay que cambiar `WEB_URL` en Railway.
- **Una sola instancia de la API**, por el límite en memoria.

## Actualización — 12 de noviembre de 2026

Publicada la API, los pedidos de código llegaban (respondían 204) pero a Resend no le llegaba ningún mail. Railway bloquea el SMTP saliente en los planes Trial y Hobby ([Outbound Networking](https://docs.railway.com/reference/outbound-networking)), y no lo habíamos tenido en cuenta al elegir el SMTP. Los mails pasan a salir por la API HTTP de Resend; el resto de la decisión no cambia.
