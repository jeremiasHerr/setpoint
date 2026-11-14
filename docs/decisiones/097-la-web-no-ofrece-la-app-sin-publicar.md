# 097 — Mientras la app no esté publicada, la web no la ofrece

**Estado:** aceptada — 14 de noviembre de 2026

## Contexto

Al terminar de pagar, la web decía "Seguí tus partidos en la app", y la landing anunciaba una "App para los jugadores". Pero la app no está en ninguna tienda: el APK se genera con EAS para la entrega ([decisión 036](036-apk-con-eas.md)) y nadie fuera del grupo tiene de dónde bajarlo. El jugador que acaba de pagar recibía una indicación que no podía seguir.

## Opciones consideradas

1. **Bajar el APK desde la web**: un botón en la pantalla de pago.
   - En contra: hay que decidir dónde se aloja el archivo y mantenerlo al día con cada build, y el jugador tiene que permitir que Android instale desde fuera de la tienda.
2. **Sin descarga**: la pantalla lleva al torneo en vivo y avisa que la app todavía no se publicó.
   - En contra: el jugador que acaba de pagar no tiene dónde anotar las fechas ni recibir avisos; solo puede mirar.

## Decisión

Opción 2, elegida por el grupo.

- **Al terminar de pagar**, la pantalla dice "Seguí el torneo desde el link" y lleva a la página en vivo ([decisión 069](069-torneo-en-vivo-en-una-pagina.md)). Abajo, una caja: "La app para Android todavía no está publicada. Cuando esté, entrás con este mismo email".
- **La landing dice "App Android, en prueba"** donde decía "App para los jugadores", y la pregunta frecuente dice que la app va a estar.

## Por qué

- **La pantalla dice lo que hay hoy.** Lo único que el jugador puede usar sin instalar nada es el link del torneo, y es lo que ofrece.
- **No hay que alojar ni mantener un archivo** para la entrega, y no se le pide a nadie que instale una app de una fuente desconocida.

## Qué se resigna

- **El jugador no se entera de la app al inscribirse.** Cuando se publique, hay que volver a ofrecerla en esta pantalla: es cambiar la caja por un botón.
