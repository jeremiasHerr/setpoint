# 138 — El pago simulado se activa a propósito

**Estado:** aceptada — 23 de noviembre de 2026. Reemplaza en parte a la [decisión 053](053-pago-sin-credenciales.md): cambia cuándo se simula el pago, no cómo.

## Contexto

La decisión 053 simulaba el pago cuando faltaba el token de MercadoPago, y suponía que "un deploy real tiene el token cargado". Al revisar la versión publicada, Railway no lo tenía: en setpoint.com.ar, cualquiera podía inscribirse tocando "Pago aprobado", con el comprobante incluido, y la conciliación de la organización contaba como cobrado por MercadoPago un monto que nunca entró.

Con la [decisión 137](137-cada-organizacion-cobra-con-su-mercadopago.md) ya no hay un token de Setpoint: cada organización conecta su cuenta. Hacía falta decir de nuevo cuándo se simula.

## Opciones consideradas

1. **Simular solo con una variable explícita**, `PAGO_SIMULADO=1`, que pone el `docker-compose.yml` de la entrega.
   - En contra: quien levante la API con `npm run dev` tiene que poner la variable en su `.env`.
2. **Seguir simulando cuando faltan las credenciales**, ahora las de la aplicación de MercadoPago.
   - En contra: si alguien borra o renombra una variable en Railway, el agujero vuelve, y solo lo avisa una línea del log.

## Decisión

Opción 1, elegida por el grupo.

- **Con `PAGO_SIMULADO=1`,** la pantalla de pago ofrece aprobarlo o rechazarlo, y se pueden publicar torneos con importe sin cuenta conectada. Termina en las mismas funciones que el webhook, como en la 053.
- **Sin la variable,** `POST .../simulado` responde 404, como si no existiera, falte lo que falte.
- **El compose la pone en 1 si el `.env` no dice otra cosa**, así `docker compose up` sigue andando en una máquina limpia. Los `.env.example` también la traen en 1.
- La API avisa al arrancar si el pago es simulado, y Tu circuito lo dice en la sección de MercadoPago.

## Por qué

- **Que falte una credencial no puede abrir una forma de inscribirse sin pagar.** El modo de prueba tiene que ser una decisión de quien levanta la instalación, no la consecuencia de un olvido.
- **La entrega no cambia:** quien levanta el proyecto con `docker compose up` sigue viendo el pago simulado sin configurar nada.

## Qué se resigna

- **Una variable más en el `.env` de desarrollo.** Sin ella, en la máquina de un integrante no se puede pagar hasta conectar una cuenta de prueba.
- **Si alguien pone `PAGO_SIMULADO=1` en Railway,** el agujero vuelve, ahora a propósito.
