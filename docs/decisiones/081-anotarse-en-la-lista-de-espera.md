# 081 — Se anota en la lista de espera quien tiene perfil en el padrón

**Estado:** aceptada — 8 de noviembre de 2026

## Contexto

La lista de espera ya funcionaba del lado de la organización ([decisión 076](076-lista-de-espera-24-horas.md)): cuando se libera un lugar, el primero de la lista lo tiene reservado 24 horas. Pero nadie podía anotarse. Con el cupo lleno, el link del torneo decía "la organización lo avisa en el grupo", y la lista solo tenía gente porque la cargaba el seed.

Las pantallas ya estaban dibujadas: el botón "Anotarme en la lista de espera" en [el-torneo.html](../pantallas/jugador/el-torneo.html) (estado 4), y el lugar en la lista y el lugar liberado en [inscripcion-y-pago.html](../pantallas/jugador/inscripcion-y-pago.html) (estados 5 y 6). Anotarse sigue el mismo camino que inscribirse: el email, el código y el perfil.

Faltaba decidir quién puede anotarse. El perfil se elige igual en los tres modos de inscripción, pero quien no está en el padrón se inscribe con un perfil pendiente ([decisión 054](054-perfil-pendiente.md)), que hoy vive lo que dura una reserva.

## Opciones consideradas

1. **Solo quien tiene perfil en el padrón**: el suyo, el del "¿Sos…?" o el que encuentra buscándose, en cualquier modo de inscripción. Quien no está en el padrón ve "no quedan lugares".
   - En contra: en un torneo abierto, los jugadores nuevos no tienen lista de espera.
2. **También los nuevos de los torneos abiertos**, con un perfil pendiente que espera en la lista.
   - En contra: ese perfil pendiente vive semanas, y hay que descartarlo cuando la lista termina, lo que obliga a escribir en la base al confirmar el sorteo ([decisión 082](082-la-lista-termina-con-el-sorteo.md)).

## Decisión

Opción 1, elegida por el grupo.

- **`POST /api/inscripcion/:slug/torneos/:id/lista-de-espera`**, con el mismo body que la reserva (`jugadorId`, `vinculaPor`, `codigoLink`). Los chequeos del perfil son los mismos que al reservar, y además pide que el torneo tenga lista de espera (`SIN_LISTA_DE_ESPERA`) y que no queden lugares (`HAY_LUGARES`: con lugar, se reserva y se paga).
- **Es un pedido aparte, no un "si no hay lugar, te anoto"**: nadie termina en la lista sin haberlo elegido. Si el cupo cambia mientras elige su perfil, la pantalla vuelve a leer el torneo y el botón cambia solo.
- **Va al final, con el número siguiente** al último que se anotó en ese torneo, en una transacción serializable como la reserva. Anotarse otra vez devuelve el mismo lugar.
- **No paga nada.** El perfil se vincula al pagar, como en una reserva ([decisión 051](051-vinculacion-con-el-padron.md)), cuando le toque un lugar.
- **El perfil queda apartado mientras espera**: no aparece en la búsqueda, y nadie más lo puede elegir, en ese torneo ni en otro. Si otra persona pudiera pagarlo en otro torneo, quedaría vinculado a ella antes de que a quien espera le toque el lugar.
- **La pantalla de pago muestra el puesto** ("6º en la lista de espera", cuántos hay antes) y, cuando le toca el lugar, hasta qué día y hora es suyo, en lugar de la cuenta regresiva de minutos.

## Por qué

- **POLENTA usa la inscripción cerrada**: en su circuito, todos los que pueden anotarse están en el padrón.
- **No se suma nada al perfil pendiente**: sigue viviendo lo que dura una reserva, y nada tiene que descartarlo cuando la lista termina.
- **La opción 2 se puede sumar después** sin deshacer nada: es otra forma de llegar al mismo pedido.

## Qué se resigna

- **En un torneo abierto o con aprobación, quien no está en el padrón no tiene lista de espera.** Si se libera un lugar, lo ve libre en el link, como cualquiera.
- **El link personal** (`/i/:codigo`) todavía no ofrece la lista: con el cupo lleno sigue diciendo "sin lugares".
- **La app no muestra la lista**: *Inscripciones en curso* sigue mostrando solo las solicitudes y las reservas.
