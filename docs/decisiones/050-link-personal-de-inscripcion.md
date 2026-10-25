# 050 — Link personal de inscripción

**Estado:** aceptada — 25 de octubre de 2026. Pendiente de código.

## Contexto

Con la [decisión 049](049-identificacion-en-la-inscripcion.md), quien todavía no tiene DNI en el padrón se busca por su apellido. Es el paso con más fricción del flujo y el único con riesgo de elegir a un homónimo. En POLENTA, cuyo padrón no tiene DNI, lo pasaría cada jugador en su primera inscripción.

La organización ya sabe quién es cada uno: tiene su padrón y, muchas veces, el teléfono. Y ya le escribe a cada jugador por WhatsApp.

## Opciones consideradas

1. **Link con el id del jugador** (`/i/42`).
   - En contra: cambiando el número se llega al perfil de otro.
2. **Link personal con un código aleatorio**, del jugador y regenerable.
   - En contra: un código más por jugador para guardar, y mandarlos es trabajo de la organización.
3. **Un link por jugador y por torneo.**
   - En contra: hay que mandarlo de nuevo en cada convocatoria, y la organización administra muchos más links.
4. **Sin link personal:** solo el link general del torneo.
   - En contra: todos pasan por la búsqueda la primera vez.

## Decisión

Opción 2.

- **En el padrón**, cada jugador tiene "Compartir link", que abre WhatsApp con el mensaje armado, y "Copiar link". Si el jugador tiene teléfono, abre su chat; si no, WhatsApp para elegir el contacto.
- **El mensaje** nombra la edición si hay una sola con la inscripción abierta en su categoría (*"Hola Lucas, inscribite al Primavera 26 desde acá: …"*); si no, es general (*"Hola Lucas, este es tu link para inscribirte en los torneos de Polenta Team Tenis: …"*).
- **El link lleva un código aleatorio**, no el id del jugador. Es del jugador, no de un torneo.
- **Quien entra se saltea la búsqueda:** escribe su DNI, que queda asociado al perfil, y su email. Después ve los torneos de su categoría con la inscripción abierta, elige uno y sigue al pago. No hay revisión de homónimo: el link lo mandó la organización a esa persona. Igual que en la decisión 049, la vinculación se guarda al confirmarse el pago.
- **La organización puede generar uno nuevo**, y el anterior deja de andar.
- **Deja de servir para vincular cuando el perfil ya tiene DNI.** Si se abre de nuevo, pide el DNI: si coincide con el del perfil, sigue a los torneos abiertos; si no, *"Ese DNI no es el de este perfil"*, con el contacto de la organización.
- **Un link regenerado y uno que nunca existió se ven igual:** *"Este link ya no anda"*, con la opción de pedirle uno nuevo a la organización o de inscribirse desde el link del torneo. El código viejo no se guarda, así que no se pueden distinguir.
- **Si el DNI ya está asociado a otro jugador del circuito** (perfil duplicado o DNI ajeno), no se vincula: *"Ese DNI ya está en el padrón con otro nombre"*, y se deriva a la organización.

## Por qué

- **Llega por donde ya llegan las cosas.** La organización tiene el teléfono y ya habla por WhatsApp con cada jugador; el mensaje armado le ahorra escribirlo.
- **Saltear la búsqueda elimina el único paso con riesgo de homónimo**, así que estas vinculaciones no necesitan revisión.
- **El código aleatorio no se adivina**, y si se le mandó a quien no era, se regenera.
- **Es del jugador y no del torneo:** se manda una vez. Para POLENTA, la organización puede mandar los links antes del primer torneo y la primera inscripción de cada uno queda sin búsqueda.
- **Volver a abrirlo no es un callejón sin salida.** Quien guardó el mensaje puede seguir usándolo con su DNI.

## Qué se resigna

- **Quien recibe el link de otro** (reenviado) puede vincular su DNI a ese perfil hasta que la organización lo note. La persona real se entera cuando no se encuentra en la búsqueda, y la organización lo revierte desde el padrón.
- **Mandarlos es uno por uno.** No hay envío masivo: WhatsApp no lo permite sin su API para empresas, que es una cuenta externa.
- **Un código por jugador** que guardar y regenerar.

## Pendiente de código

- **Código del link en `Jugador`:** único, aleatorio y no secuencial, regenerable. Puede generarse la primera vez que se comparte.
- **Ruta pública que resuelve el código** a la organización y el perfil, con el mismo límite por IP que la consulta por DNI (decisión 049).
- **Acciones del padrón:** compartir, copiar y generar uno nuevo.
