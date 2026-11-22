# 130 — El link del torneo abre siempre la web

**Estado:** aceptada — 22 de noviembre de 2026. Cierra la decisión abierta 18 del [README](../README.md).

## Contexto

La organización comparte el link del torneo por WhatsApp para que los jugadores se inscriban ([04-flujo-jugador.md](../04-flujo-jugador.md) §5.3). Sin la sesión iniciada en la app, el link tiene que abrir la web, porque la app sin sesión solo muestra el ingreso ([decisión 042](042-la-app-sin-sesion.md)). La pregunta era si, con la app instalada y la sesión iniciada, convenía abrirla a ella.

## Opciones consideradas

1. **La web, siempre.**
   - En contra: quien tiene la app y la sesión iniciada verifica su email con un código otra vez en el navegador.
2. **La app si está instalada, con App Links de Android.**
   - En contra: hace falta verificar el dominio (`assetlinks.json` en `setpoint.com.ar`), una pantalla de inscripción en la app que hoy no existe y volver a generar el APK. Sin sesión, igual tiene que volver a la web.

## Decisión

Opción 1, elegida por el grupo. El link del torneo y el link personal abren la web en cualquier caso.

## Por qué

- **Funciona igual para todos**, tengan o no la app, y en la entrega con `docker compose up`, donde no hay un dominio verificado.
- **La inscripción ya está entera en la web**: identificación, pago y lista de espera. Llevarla a la app era una pantalla más y un APK más a días de la entrega.
- **Pedir el código otra vez es un paso**, no un bloqueo: el email ya está verificado y se vincula con la misma cuenta ([decisión 049](049-identidad-e-ingreso-con-codigo.md)).

## Qué se resigna

- **Quien tiene la app inscripta pasa por el navegador** y escribe el código de su email.
- **Si más adelante se quiere abrir la app**, hace falta lo de la opción 2: el dominio verificado, la pantalla y un APK nuevo.
