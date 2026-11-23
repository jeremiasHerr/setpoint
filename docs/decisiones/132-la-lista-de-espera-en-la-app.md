# 132 — La app muestra la lista de espera, sin anotar

**Estado:** aceptada — 21 de noviembre de 2026.

> Se numeró primero como la 123, que ya era la del inicio en noche: dos PR tomaron el mismo número a la vez.

## Contexto

Con el cupo lleno, el jugador se anota en la lista de espera desde la web: desde el link del torneo o desde su link personal (decisión 081). La pantalla de pago le muestra su puesto. La app, en cambio, no lo veía: `GET /api/auth/cuenta` devolvía las solicitudes, las aprobadas y las reservas, y descartaba a quien esperaba. Quien abría la app no encontraba la inscripción que acababa de hacer.

La referencia *Inscripciones en curso* no dibuja la lista de espera, y la app no tiene un flujo de inscripción: no muestra los torneos abiertos ni reserva lugares.

## Opciones consideradas

1. **Ver el puesto:** la app muestra en qué puesto está, en *Tus inscripciones* y en el aviso arriba de *Cuándo juego*. Anotarse sigue siendo desde la web.
   - En contra: desde la app no se puede anotar.
2. **Ver y anotarse desde la app.**
   - En contra: hay que construir en la app el flujo de inscripción entero, que hoy no existe, a días de la entrega.

## Decisión

Opción 1, elegida por el grupo.

- La cuenta devuelve las inscripciones en la lista de espera como `en_lista_espera`, con su puesto entre todos los que esperan en ese torneo y las horas que tendrá para pagar (decisión 076).
- **La lista termina con el sorteo** (decisión 082): con el sorteo confirmado, quien seguía esperando ya no aparece en curso.
- **Cuando le toca un lugar, pasa a "reservando"**, con "Pagar", como cualquier reserva. Como ese lugar es suyo por 24 horas, la hora de vencimiento lleva también el día cuando no vence hoy.
- La marca del estado lleva el puesto ("2° en lista de espera"), porque design.md §7 numera la lista por orden de llegada.

## Por qué

- **Es lo que le faltaba a quien ya se anotó:** saber que está en la lista y en qué puesto, sin buscar el link de la pantalla de pago.
- **No suma un flujo nuevo a la app:** reutiliza la cuenta, la tarjeta y el aviso que ya existen.

## Qué se resigna

- **Anotarse sigue siendo desde la web.** La app solo muestra lo que ya pasó.
- **No hay aviso cuando la lista termina sin que le toque.** Deja de aparecer, como en la pantalla de pago, que lo dice en la web.
