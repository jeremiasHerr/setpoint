# 053 — El pago sin credenciales de MercadoPago

**Estado:** aceptada — 25 de octubre de 2026. Tomada durante la implementación, sin consultar al grupo: revisarla en el PR.

## Contexto

La inscripción se paga con Checkout Pro de MercadoPago ([05-pagos.md](../05-pagos.md)). Para crear una preferencia hace falta un access token de una cuenta de MercadoPago, y para que llegue el webhook, una URL pública de la API.

La cátedra pide que `docker compose up` levante el proyecto en una máquina limpia, **sin depender de cuentas externas**. Sin credenciales, nadie puede pagar, y sin pagar no se llega al final del flujo: la inscripción confirmada, la vinculación y el comprobante. En la máquina de desarrollo pasa lo mismo con el webhook: sin ngrok no llega.

## Opciones consideradas

1. **Un error claro sin credenciales**, como la importación sin `ANTHROPIC_API_KEY`.
   - En contra: el flujo del jugador termina en un error en cualquier máquina sin cuenta de MercadoPago, incluida la del evaluador.
2. **Un checkout simulado cuando no hay credenciales.** La pantalla de pago ofrece "pago aprobado" o "pago rechazado", y la API los confirma por el mismo camino que el webhook.
   - En contra: es un camino que confirma pagos sin que nadie pague. Tiene que quedar imposible de usar con credenciales cargadas.
3. **Credenciales de sandbox del grupo en el repo.**
   - En contra: CLAUDE.md prohíbe secretos en el repo, y dependería igual de una cuenta externa.

## Decisión

Opción 2.

- **Con `MERCADOPAGO_ACCESS_TOKEN`**, la API crea la preferencia y devuelve el link del checkout. La confirmación llega solo por el webhook (`POST /api/webhooks/mercadopago`), que consulta el pago contra la API de MercadoPago.
- **Sin `MERCADOPAGO_ACCESS_TOKEN`**, la API responde que el pago es simulado, y la pantalla de pago muestra las dos opciones. `POST /api/inscripcion/:slug/inscripciones/:id/simulado` confirma o rechaza **solo si no hay token**: con el token cargado responde 404, como si no existiera.
- **Las dos vías terminan en las mismas funciones** (`confirmarPago` y `rechazarPago`), así que la vinculación, la idempotencia y el comprobante se prueban igual con o sin MercadoPago.
- La API avisa en la consola al arrancar si el pago es simulado.

## Por qué

- **El flujo completo anda en una máquina limpia**, que es lo que se evalúa.
- **Lo que importa del pago no es el checkout**, que es de MercadoPago: es la reserva, la confirmación por webhook, la idempotencia y lo que pasa después. Eso es el mismo código en las dos vías.
- **No hay forma de usar la simulación en un deploy real**, porque un deploy real tiene el token cargado.

## Qué se resigna

- **Un camino de código que no existe en producción.** Hay que mantenerlo y no confundirlo con el real.
- **La pantalla de pago tiene un estado que ningún jugador real ve.** Se marca como simulación.
- **Probar el checkout real** sigue pidiendo una cuenta de sandbox y una URL pública para el webhook (ngrok), como dice el README.
