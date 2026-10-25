# 051 — Vinculación con el padrón: búsqueda acotada y revisión por excepción

**Estado:** aceptada — 25 de octubre de 2026. Pendiente de código.

## Contexto

Con la [decisión 049](049-identidad-e-ingreso-con-codigo.md), la persona es su email verificado y ya tiene cuenta cuando se inscribe. Falta conectarla con su perfil del padrón (`Jugador`), que es uno por organización y lo arma cada organización.

Hay cinco situaciones: la persona ya tiene perfil en ese circuito; la persona ya juega en otro circuito y es nueva en este; es su primera vez en la plataforma; el perfil que busca ya está vinculado a otra cuenta; o no está en el padrón.

La primera vez el padrón no tiene con qué comparar: alguien puede elegir el perfil de otro. El link personal ([decisión 050](050-link-personal-de-inscripcion.md)) cubre ese hueco cuando la organización lo usa; esta decisión cubre el resto.

El principio de la decisión 049 manda acá también: **la organización no toca la identidad de nadie**, pero decide sobre su padrón: de qué persona es cada perfil, y sus inscripciones.

## Opciones consideradas

### Cómo se encuentra el perfil la primera vez

1. **Una lista con todo el padrón de la categoría.**
   - En contra: muestra el padrón entero a cualquiera que tenga el link.
2. **Un buscador acotado:** nada hasta escribir 3 letras, como mucho 5 resultados y solo de la categoría del torneo.
   - En contra: si el nombre del padrón está escrito muy distinto de como lo escribe el jugador, no se encuentra y tiene que pedirle a la organización.
3. **Que la organización vincule cada perfil a mano**, cargando el email de cada jugador.
   - En contra: la organización no tiene esos emails, y son 77 a mano.

### Los perfiles que ya están vinculados a otra cuenta

1. **No aparecen en la búsqueda.**
   - En contra: el dueño real no se encuentra y no sabe si es eso o una falta de ortografía.
2. **Aparecen marcados, y al tocarlos se ve el aviso.**
   - En contra: deja ver qué perfiles tienen cuenta. Los nombres ya son públicos en el ranking.

### Cómo se entera la organización de un perfil reclamado

1. **Un texto con el contacto del circuito:** el jugador escribe por WhatsApp.
   - En contra: la organización recibe un mensaje y tiene que buscar a mano las dos cuentas.
2. **Un botón que crea el caso en "Para revisar"**, con el email verificado de quien reclama.
   - En contra: cualquiera con un email puede abrir un reclamo. No cambia nada hasta que la organización decide.

### Cuándo se guarda la vinculación

1. **Al elegir el perfil.**
   - En contra: un flujo abandonado deja el perfil tomado por alguien que nunca pagó.
2. **Al confirmarse el pago**, con el perfil reservado mientras dura la reserva.
   - En contra: la elección queda pendiente en la inscripción hasta el webhook.

### Los casos dudosos

1. **La organización aprueba cada vinculación** antes de que valga.
   - En contra: frena la primera inscripción de todos, que es justo cuando el padrón está sin vincular.
2. **Automático por excepción:** se avisa de cada vinculación nueva sin frenarla, y solo los homónimos y los reclamos quedan para revisar.
   - En contra: un error sin homónimo ni reclamo lo detecta recién la organización al mirar las vinculaciones nuevas, o el dueño cuando no se encuentra.
3. **Sin revisión.**
   - En contra: con dos "Juan Pérez" en la categoría, la mitad de las veces el historial va al equivocado.

## Decisión

Buscador acotado, perfiles vinculados marcados, botón de reclamo, vinculación al pagar y revisión por excepción.

- **Después del código, o con la sesión iniciada:**
  1. **Si ya tiene perfil en este circuito**, ve "Lucas Bravo · Tercera" y sigue al pago.
  2. **Si ya juega en otro circuito y es nuevo en este**, se busca su apellido en la categoría del torneo y se le propone *"¿Sos Federico Ibáñez, de Intermedia?"*, que confirma con un toque. Si hay varios, elige entre hasta 5.
  3. **Si es su primera vez**, se busca por apellido. El buscador:
     - no muestra nada hasta 3 letras y como mucho 5 resultados;
     - busca solo en la categoría del torneo y muestra solo nombre y apellido;
     - compara sin tildes ni mayúsculas y palabra por palabra;
     - no muestra los perfiles reservados por otra inscripción en curso;
     - tiene un límite de búsquedas por IP.
  4. **Si no está en la lista**, depende de `modo_inscripcion` ([07-configurabilidad.md](../07-configurabilidad.md) §2.6).
- **Los perfiles vinculados a otra cuenta aparecen marcados.** Al tocarlos: *"Este perfil ya está vinculado a otra cuenta"*, con el botón "Avisarle a la organización". El botón crea el caso en "Para revisar" con el email verificado de quien reclama.
- **Consentimiento en un circuito nuevo:** antes de vincularse, *"Al inscribirte, Liga Amateur del Valle va a ver tu nombre y tu email"*. Nunca se muestra nada de otros circuitos.
- **La vinculación se guarda al confirmarse el pago**, con el webhook aprobado, igual que el perfil nuevo del modo abierto. Mientras dura la reserva de 15 minutos, el perfil queda reservado y no aparece en la búsqueda; si la reserva vence o el pago se rechaza, vuelve a aparecer y no queda nada guardado.
- **La organización ve cada vinculación nueva** en el padrón, con cómo se hizo: link personal, búsqueda o "¿Sos…?". No tiene que aprobar nada.
- **Revisión por excepción.** Quedan para revisar dos casos, y en los dos la inscripción sigue en pie:
  - **Posible homónimo:** el perfil elegido tiene otro igual o parecido en la categoría. La organización confirma, pasa la inscripción al otro perfil o da de alta a la persona como jugador nuevo. Vale para la búsqueda y el "¿Sos…?", no para el link personal.
  - **Perfil reclamado:** otra cuenta dice que el perfil es suyo. La organización decide de quién es el perfil: lo deja como está, se lo pasa a quien lo reclama, o lo desvincula para que el dueño lo reclame con su link personal. También decide qué pasa con las inscripciones que pagó la cuenta que lo tenía.
- **La organización puede desvincular cualquier perfil de su padrón** y dejarlo libre. Es una decisión sobre el padrón: no toca el email ni la cuenta de nadie, y las inscripciones quedan en el perfil.

## Por qué

- **El buscador acotado no expone el padrón.** Sin 3 letras no muestra nada, y solo busca en la categoría del torneo.
- **Marcar los perfiles vinculados le da una salida al dueño real.** Se encuentra, ve que otra cuenta lo tiene y avisa con un toque, sin preguntarse si escribió mal su apellido.
- **El botón de reclamo es automático por excepción:** nadie tiene que escribir por WhatsApp, y la organización ve las dos cuentas para decidir. Un reclamo no cambia nada por sí solo, así que abrirlo no le sirve a quien quiera molestar.
- **Guardar la vinculación al pagar** hace que un flujo abandonado no deje nada. Reservar el perfil durante los 15 minutos evita que dos personas elijan el mismo a la vez.
- **Avisar sin frenar** es el mismo criterio que la importación del padrón ([devolucion-25.md](../devolucion-25.md), cambio C): el caso normal es automático, y la organización mira la lista cuando quiere. En un circuito donde los jugadores se conocen, el organizador mirando esa lista es la llave más confiable.
- **Desvincular es del padrón, no de la identidad.** La organización decide de quién es su perfil, nunca qué email tiene una persona.

## Qué se resigna

- **Un error sin homónimo ni reclamo no lo detecta el sistema.** Lo ve la organización en las vinculaciones nuevas, o el dueño cuando su perfil aparece vinculado a otra cuenta.
- **Cualquiera con un email verificado puede abrir un reclamo.** No cambia nada hasta que la organización decide.
- **La búsqueda deja ver qué perfiles de la categoría tienen cuenta.** Los nombres ya son públicos.
- **El nombre del padrón puede no coincidir** con como lo escribe el jugador. Si no se encuentra, la organización lo vincula con el link personal.

## Pendiente de código

- ~~**Un perfil por organización y cuenta:** `@@unique([organizacionId, usuarioId])` en `Jugador`.~~ Hecho. En PostgreSQL, varios perfiles sin cuenta (`usuarioId` en null) no chocan con esa restricción. Se quitó el `@@unique` del DNI.
- ~~**Cómo y cuándo se vinculó cada perfil**~~ Hecho: `Jugador.vinculadoEn` y `vinculadoPor`. Se completan al confirmarse el pago.
- **Estado de revisión en `Jugador`**, con el motivo: homónimo o reclamo. Para el reclamo, quién reclama y cuándo.
- ~~**La inscripción guarda el perfil elegido hasta el pago.**~~ Hecho: `Inscripcion.usuarioId` y `vinculaPor`, y la búsqueda excluye los perfiles sin cuenta con una reserva vigente. La vinculación se guarda al confirmarse el pago (`confirmarPago`), con la marca de homónimo si corresponde, y la persona toma el nombre del perfil si todavía no tenía.
- **En modo abierto, la inscripción existe antes que el perfil.** `Inscripcion.jugadorId` es obligatorio: o se crea el `Jugador` como pendiente al reservar y se borra si la reserva vence, o el campo pasa a opcional hasta el pago. Se decide al implementar.
- **Estado de solicitud** para los torneos con aprobación.
- **Desvincular** ya existe: `DELETE /api/organizaciones/:slug/jugadores/:id/cuenta` pone `usuarioId` en null ([decisión 007](007-vinculacion-de-cuentas-en-f02.md)).
- ~~**Límite por IP** de la búsqueda.~~ Hecho ([decisión 052](052-limite-de-pedidos.md)).
- ~~**Rutas públicas** para la convocatoria y la búsqueda; las que reservan piden la sesión.~~ Hecho: `GET /api/publico/:slug/torneos/:id` y `/padron?q=`, sin login; `GET` y `POST /api/inscripcion/:slug/torneos/:id`, con la sesión del código pero sin pedir un perfil, para ver la situación de la persona en el torneo y reservar el lugar.
