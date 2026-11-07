# 072 — La instancia que alcanzó un jugador en cada torneo se calcula con sus partidos

**Estado:** aceptada — 7 de noviembre de 2026

## Contexto

La sección Torneos de la ficha ([decisión 071](071-la-ficha-suma-los-torneos.md)) dice hasta dónde llegó el jugador en cada torneo: "Finalista", "Cuartos de final · Cuadro consuelo".

La única instancia guardada es la del movimiento de ranking que escribe el cierre (F16). Existe solo en los torneos con ranking ya cerrados, y es la instancia que da puntos: todo el cuadro consuelo figura como participación, también su campeón ([decisión 056](056-instancias-fuera-de-la-tabla-de-puntos.md)). Un torneo suelto, o de una organización sin ranking, se cierra sin movimientos ([decisión 057](057-cierre-sin-ranking.md)).

## Opciones consideradas

1. **Calcularla con los partidos de cuadro, al consultar.**
   - En contra: cada consulta hace una cuenta más, sobre los cuadros de todos los torneos del jugador.
2. **Leer la instancia del movimiento de ranking.**
   - En contra: un torneo sin ranking, o que todavía se juega, queda sin instancia, y el cuadro consuelo dice "participación".
3. **Guardarla en la inscripción al cerrar el torneo.**
   - En contra: una migración, y la corrección después del cierre ([decisión 055](055-correccion-despues-del-cierre.md)) también tendría que actualizarla.

## Decisión

Opción 1, elegida por el grupo. `instanciaEnElTorneo()`, en `apps/api/src/modules/ficha/ficha.ts`, mira el último partido de cuadro del jugador en el torneo, sin contar los cancelados:

- **Sin partidos de cuadro:** está en la zona, si el torneo no cerró las zonas, o quedó en la zona, si las cerró y no pasó a ningún cuadro.
- **Sin resultado:** está jugando esa ronda ("En semis").
- **Lo perdió:** quedó en esa ronda ("Semifinalista", "Cuartos de final"), con los nombres de la tabla de puntos.
- **Ganó la final:** es campeón.
- Si fue en el cuadro consuelo, se dice cuál ("Cuadro consuelo").

Las rondas se cuentan desde la final con todos los partidos del cuadro, no solo los del jugador. Así, quien entra con bye en la segunda ronda queda en la ronda correcta.

La línea que explica la barra más alta de *Puntos por torneo del calendario* ("Los 75 de Invierno 26 son de haber llegado a la final del Campeonato") sí usa la instancia del movimiento, porque explica los puntos, no hasta dónde llegó.

## Por qué

- **Es la misma idea que las tablas y los partidos vencidos** ([decisión 060](060-partidos-vencidos-calculados.md)): se calcula a partir de los partidos, sin un valor guardado que se pueda desincronizar.
- **Sirve para cualquier torneo:** con o sin ranking (Liga Amateur del Valle no lleva), cerrado o en juego.
- **Puede decir lo que pasó en el cuadro consuelo**, que para el jugador cuenta aunque dé los mismos puntos que perder en la zona.

## Qué se resigna

- **Una consulta más por ficha:** los partidos de cuadro de los torneos del jugador, para saber cuántas rondas tiene cada cuadro. Son unas decenas por torneo.
- **La ficha y el ranking pueden nombrar distinto el mismo torneo:** "Campeón · Cuadro consuelo" en Torneos y participación en el movimiento. Es a propósito: uno dice hasta dónde llegó y el otro, qué puntos le dio.
