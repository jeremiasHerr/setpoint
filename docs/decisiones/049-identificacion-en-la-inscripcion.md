# 049 — Identificación en la inscripción: el DNI encuentra, el email comunica

**Estado:** aceptada — 25 de octubre de 2026. Cierra la decisión abierta 8 del [README](../README.md). Pendiente de código.

## Contexto

F12 pide que el jugador se inscriba y pague **sin crear una cuenta** ([10-features.md](../10-features.md)). La organización comparte el link del torneo en el grupo de WhatsApp, el jugador lo toca y tiene que quedar inscripto en su perfil del padrón, con su historial y sus puntos. Para eso el sistema tiene que saber quién es, sin contraseña.

La propuesta anterior ([04-flujo-jugador.md](../04-flujo-jugador.md) §5.3, versión 2.1) era un link con DNI: si el DNI no estaba, el jugador escribía su nombre y elegía su perfil de una lista. Quedaban abiertos el identificador (DNI o email, decisión abierta 8), qué pasa si alguien tipea mal su DNI y coincide con otro, y cómo se le avisa al jugador que quedó inscripto.

Dos datos del caso real pesan: el padrón de POLENTA **no tiene DNI ni email**, así que la primera inscripción de cada jugador no encuentra nada por DNI; y los jugadores se conocen entre sí, así que el organizador mirando la lista es más confiable que cualquier llave técnica.

## Opciones consideradas

### Con qué se identifica

1. **Solo el DNI**, como la propuesta anterior.
   - En contra: no hay a dónde mandarle el comprobante, ni con qué crear una cuenta después.
2. **Solo el email.** MercadoPago lo devuelve en el webhook sin pedirlo.
   - En contra: el que devuelve MercadoPago es el de quien paga, que puede no ser el jugador. Un email se cambia, se comparte en la familia y algunos proveedores reciclan las direcciones borradas. Y no se sabe de memoria tanto como el DNI.
3. **El DNI para encontrar al jugador y el email para comunicarse con él.**
   - En contra: se piden dos datos en lugar de uno, y uno es sensible.

### Cómo se encuentra quien todavía no tiene DNI en el padrón

1. **Lista de coincidencias por nombre**, como la propuesta anterior.
   - En contra: muestra una parte del padrón a cualquiera que tenga el link, incluidos perfiles que ya reclamó otro.
2. **Buscador acotado:** nada hasta escribir 3 letras, como mucho 5 resultados y solo de la categoría del torneo.
   - En contra: si el nombre del padrón está escrito muy distinto de como lo escribe el jugador, no se encuentra y tiene que pedirle a la organización.
3. **Que la organización cargue el DNI de todos antes del primer torneo** (era la pregunta 6 al organizador).
   - En contra: 77 DNI tipeados a mano, que la organización tiene que pedirle a cada jugador. Es la carga que la plataforma promete sacarle.

### Qué pasa con los casos dudosos

1. **La organización aprueba cada vinculación** antes de que valga.
   - En contra: frena la primera inscripción de todos, que es justo cuando el padrón no tiene DNI.
2. **Automático por excepción:** el caso normal no lo toca nadie y solo los posibles homónimos quedan para revisar, sin frenar la inscripción.
   - En contra: un error sin homónimo (alguien elige el nombre de otro que no se le parece) no lo detecta el sistema.
3. **Sin revisión:** la organización revierte si se entera.
   - En contra: con dos "Juan Pérez" en la categoría, la mitad de las veces el historial va al equivocado y nadie lo ve hasta el cierre del torneo.

## Decisión

DNI más email, buscador acotado y revisión por excepción.

- **El DNI identifica, el email comunica.** El DNI busca al `Jugador` en el padrón de la organización del torneo. El email recibe el comprobante y los avisos. Ninguno de los dos pide cuenta.
- **DNI encontrado:** la pantalla muestra el nombre y la categoría del perfil y el email guardado, **enmascarado**: las dos primeras letras y el dominio (`lu***@gmail.com`). Nunca el email completo.
- **Cambiar el email:** se puede. El comprobante va al email nuevo y al anterior le llega un aviso. Si el perfil tiene cuenta, el email de la cuenta **no se cambia desde el link**: el nuevo recibe el comprobante de esa inscripción, el de la cuenta recibe el aviso, y el de la cuenta solo se cambia desde la cuenta.
- **DNI no encontrado:** *"Es tu primera inscripción. Buscate por tu apellido"*. El buscador:
  - no muestra nada hasta 3 letras y como mucho 5 resultados;
  - busca solo en la categoría del torneo y muestra solo nombre y apellido;
  - compara sin tildes ni mayúsculas y palabra por palabra: alcanza con que coincida una, y primero van los que coinciden en más. Así "Lucas Matías Bravo" encuentra a "Lucas Bravo";
  - no muestra los perfiles que ya tienen DNI, ni los reservados por una inscripción en curso;
  - tiene un límite de búsquedas por IP, igual que la consulta por DNI.
- **No está en la lista:** depende de `modo_inscripcion` ([07](../07-configurabilidad.md) §2.6). Cerrada: *"Pedile a la organización que te agregue al padrón"*, con el contacto del circuito. Con aprobación: deja nombre, apellido y email y queda como solicitud, sin reservar lugar ni cobrar. Abierta: deja nombre, apellido y email y se le crea el perfil.
- **La vinculación se guarda al confirmarse el pago**, con el webhook aprobado, igual que el perfil nuevo del modo abierto. Mientras dura la reserva de 15 minutos, el perfil queda reservado y no aparece en la búsqueda; si la reserva vence o el pago se rechaza, vuelve a aparecer y no queda nada guardado.
- **Posible homónimo:** si el perfil elegido tiene otro igual o parecido en la categoría, la inscripción sigue (paga y queda inscripto) pero la vinculación queda **pendiente de revisión**. La organización la confirma, la pasa al otro perfil o da de alta a la persona como jugador nuevo. Vale para la búsqueda y para la propuesta "¿Sos…?" con cuenta ([decisión 051](051-identidad-en-la-cuenta.md)); no para el link personal ([decisión 050](050-link-personal-de-inscripcion.md)) ni para el DNI ya asociado. El jugador no ve la revisión: su inscripción no cambia.
- **El comprobante sale con el webhook aprobado**, nunca con la vuelta del checkout ([05-pagos.md](../05-pagos.md) §4). Lleva al pie *"¿No te inscribiste vos? Avisale a la organización"*.

## Por qué

- **El DNI es el dato que encuentra a una persona sin ambigüedad:** es único, no cambia y todo adulto lo sabe de memoria. El email sirve para lo que el DNI no puede: mandarle algo. Por eso no es uno *o* el otro.
- **Enmascarar el email** evita que quien sabe un DNI ajeno vea el email de otra persona, y alcanza para que el dueño lo reconozca.
- **El nombre resuelve el DNI mal tipeado** que coincide con el de otro jugador, que era un punto abierto de 04 §5.9 en la versión 2.1: el error se ve antes de pagar. El nombre y la categoría ya son públicos en el ranking ([decisión 033](033-ranking-publico.md)).
- **El buscador acotado no expone el padrón.** Sin 3 letras no muestra nada, y como los perfiles con DNI no aparecen, nadie puede elegir uno que ya reclamó otro.
- **Guardar la vinculación al pagar** hace que un flujo abandonado no deje nada: ni un perfil con el DNI de quien no pagó, ni perfiles sueltos en el padrón. Reservar el perfil durante los 15 minutos evita que dos personas elijan el mismo a la vez.
- **Revisar por excepción** es el mismo criterio que la importación del padrón ([devolucion-25.md](../devolucion-25.md), cambio C): el caso normal es automático y la organización mira solo lo dudoso. El homónimo es el único caso en que el sistema sabe que puede estar equivocándose.
- **El aviso al email anterior** cubre a quien inscribió a otro con su DNI: aunque haya cambiado el email, la persona real se entera.
- **El email de una cuenta no se cambia desde un link que solo pide un DNI.** Es el email con el que se recupera la contraseña: cambiarlo sin la contraseña sería quedarse con la cuenta.

## Qué se resigna

- **Pedir el DNI**, que es un dato sensible. Se guarda cifrado y no aparece en ninguna pantalla pública (04 §5.10). A quien no quiera darlo, el link no le sirve: la organización puede inscribirlo a mano ([05](../05-pagos.md) §8).
- **Quien prueba DNIs sabe de quién es cada uno** (nombre y categoría). Lo frena el límite por IP.
- **El buscador deja ver qué perfiles de la categoría todavía no tienen DNI.** Los nombres ya son públicos.
- **Un error sin homónimo no lo detecta el sistema.** Lo detecta la persona real cuando no se encuentra en la búsqueda y le escribe a la organización, que lo corrige desde el padrón.
- **El email no se verifica al inscribirse.** Si está mal escrito, el comprobante no llega; el número de inscripción en la pantalla final es el respaldo.
- **Un email más cuando se cambia:** el aviso al anterior.

## Pendiente de código

- **Cifrar `Jugador.dni`.** El campo existe y es único por organización (`@@unique([organizacionId, dni])`), pero se guarda en texto plano. Cifrado con un vector aleatorio no se puede buscar por igualdad: hace falta además un hash para buscar (índice ciego). Se decide al implementar.
- **Estado de la vinculación en `Jugador`:** pendiente de revisión, con qué perfil parecido y cuándo.
- **La inscripción guarda el DNI y el email hasta el pago.** Con el webhook aprobado pasan al perfil; si el perfil tiene cuenta, el email nuevo queda solo en la inscripción.
- **En modo abierto, la inscripción existe antes que el perfil.** `Inscripcion.jugadorId` es obligatorio: o se crea el `Jugador` como pendiente al reservar y se borra si la reserva vence, o el campo pasa a opcional hasta el pago. Se decide al implementar.
- **Estado de solicitud** para los torneos con aprobación.
- **Desvincular desde el padrón** borra el DNI y el email del perfil, y la cuenta si tiene. Hoy `DELETE /jugadores/:id/cuenta` solo quita la cuenta ([decisión 007](007-vinculacion-de-cuentas-en-f02.md)).
- **La búsqueda excluye los perfiles con una inscripción `pendiente_pago` vigente**, y la consulta por DNI también mira los DNI pendientes de esas reservas, para que quien vuelve retome el pago.
- **Límite por IP** de la búsqueda y de la consulta por DNI. La API no tiene ninguno; la [decisión 006](006-recuperar-la-contrasena.md) ya lo dejó pendiente para la recuperación de la contraseña.
- **Rutas públicas** bajo `/api/publico/:slug` ([decisión 033](033-ranking-publico.md)). Sin sesión, la consulta del estado del pago ("Confirmando el pago") usa un código que no se pueda adivinar, no el número de inscripción.
- **Envío del comprobante y del aviso al email anterior**, con `apps/api/src/lib/correo.ts` ([decisión 006](006-recuperar-la-contrasena.md)).
