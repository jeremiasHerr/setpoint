# 050 — Link personal de inscripción

**Estado:** aceptada — 25 de octubre de 2026. Pendiente de código.

## Contexto

Con la [decisión 049](049-identidad-e-ingreso-con-codigo.md), el jugador se identifica con su email verificado. La primera vez, el padrón no tiene con qué comparar: la persona se busca por su apellido y elige su perfil ([decisión 051](051-vinculacion-con-el-padron.md)). Ahí está el hueco: alguien puede elegir el perfil de otro, y ningún dato que se tipee lo evita.

La organización, en cambio, sabe quién es cada uno. Tiene su padrón y, muchas veces, el teléfono, y ya le escribe a cada jugador por WhatsApp.

## Opciones consideradas

1. **Link con el id del jugador** (`/i/42`).
   - En contra: cambiando el número se llega al perfil de otro.
2. **Link personal con un código aleatorio**, del jugador y regenerable.
   - En contra: un código más por jugador para guardar, y mandarlos es trabajo de la organización.
3. **Un link por jugador y por torneo.**
   - En contra: hay que mandarlo de nuevo en cada convocatoria, y la organización administra muchos más links.
4. **Sin link personal:** solo el link general del torneo.
   - En contra: todos pasan por la búsqueda la primera vez, y el hueco queda abierto.

## Decisión

Opción 2.

- **En el padrón**, cada jugador tiene "Compartir link", que abre WhatsApp con el mensaje armado, y "Copiar link". Si el jugador tiene teléfono, abre su chat; si no, WhatsApp para elegir el contacto.
- **El mensaje** nombra la edición si hay una sola con la inscripción abierta en su categoría (*"Hola Lucas, inscribite al Primavera 26 desde acá: …"*); si no, es general (*"Hola Lucas, este es tu link para inscribirte en los torneos de Polenta Team Tenis: …"*).
- **El link lleva un código aleatorio**, no el id del jugador. Es del jugador, no de un torneo.
- **Quien entra se saltea la búsqueda.** Escribe su email y verifica el código (o ya tiene la sesión iniciada), y queda vinculado a ese perfil. Después ve los torneos de su categoría con la inscripción abierta y sigue al pago.
  - No hay revisión de homónimo: el perfil lo eligió la organización.
  - Como en el resto del flujo, la vinculación se guarda al confirmarse el pago.
- **La organización puede generar uno nuevo**, y el anterior deja de andar.
- **Deja de servir para vincular cuando el perfil ya está vinculado.** Si lo abre la misma cuenta, sigue a los torneos abiertos. Si lo abre otra, ve *"Este perfil ya está vinculado a otra cuenta"*, con el botón para avisarle a la organización (decisión 051).
- **Un link regenerado y uno que nunca existió se ven igual:** *"Este link ya no anda"*, con la opción de pedirle uno nuevo a la organización o de inscribirse desde el link del torneo. El código viejo no se guarda, así que no se pueden distinguir.
- **Si la cuenta ya tiene otro perfil en ese circuito**, no se vincula y se deriva a la organización: una cuenta tiene un solo perfil por circuito.

## Por qué

- **Cierra el hueco de la primera vez.** El perfil lo elige la organización, que conoce a sus jugadores, y no quien abre el link del torneo.
- **Llega por donde ya llegan las cosas.** La organización tiene el teléfono y ya habla por WhatsApp con cada jugador; el mensaje armado le ahorra escribirlo.
- **El código aleatorio no se adivina**, y si se le mandó a quien no era, se regenera.
- **Es del jugador y no del torneo:** se manda una vez. Para POLENTA, la organización puede mandar los links antes del primer torneo, y nadie tiene que buscarse.

## Qué se resigna

- **Quien recibe el link de otro** (reenviado) puede vincular su email a ese perfil antes que el dueño. El dueño ve "ya vinculado a otra cuenta" y avisa, y la organización lo resuelve desde *Revisar vinculación*.
- **Mandarlos es uno por uno.** No hay envío masivo: WhatsApp no lo permite sin su API para empresas, que es una cuenta externa.
- **Un código por jugador** que guardar y regenerar.

## Pendiente de código

- **Código del link en `Jugador`:** único, aleatorio y no secuencial, regenerable. Puede generarse la primera vez que se comparte.
- **Ruta pública que resuelve el código** a la organización y el perfil, con límite por IP.
- **Acciones del padrón:** compartir, copiar y generar uno nuevo.
