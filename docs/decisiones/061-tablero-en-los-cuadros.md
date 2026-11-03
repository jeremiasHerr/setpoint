# 061 — En los cuadros, el tablero muestra lo mismo por ronda

**Estado:** aceptada — 30 de octubre de 2026

## Contexto

La pantalla de referencia del tablero (`docs/pantallas/organizador/tablero.html`) solo muestra la fase de grupos: las barras zona por zona, el plazo, "Lo que falta" y la tabla de cada zona. Pero F15 pide "el avance completo del torneo", y los partidos de los cuadros también tienen plazo, también se coordinan y también pueden vencer.

## Opciones consideradas

1. **Lo mismo, por ronda:** el plazo de la ronda más atrasada, las barras por ronda de cada cuadro y "Lo que falta" con los partidos de cuadro pendientes y vencidos. Sin "Zona por zona".
   - En contra: es un armado que no tiene pantalla de referencia.
2. **Solo la fase de grupos:** en los cuadros, el tablero dice que la fase de grupos terminó y lleva a los cuadros.
   - En contra: los partidos de cuadro vencidos no tienen dónde verse.

## Decisión

Opción 1. El tablero tiene tres fases:

- **Grupos:** como la referencia. Cuando todos los partidos de zona tienen resultado, ofrece cerrar las zonas, que arma los cuadros ([decisión 026](026-cierre-de-zonas.md)). Era el botón que le faltaba a F08.
- **Cuadros:** una barra por ronda de cada cuadro ("Campeonato · semis"), el plazo de la ronda más atrasada y "Lo que falta". Los partidos que esperan al ganador de la ronda anterior se ven en las barras pero no en la lista. "Ver cuadros" lleva a la página de los cuadros. Con las finales jugadas, ofrece cerrar el torneo (F16).
- **Terminado:** las barras de los cuadros y "Ver el cierre".

## Por qué

- **La organización sigue el torneo desde un solo lugar**, de la primera fecha a la final, con las mismas piezas en cada fase.
- **El cálculo es el mismo:** la situación de un partido no depende de si es de zona o de cuadro ([decisión 060](060-partidos-vencidos-calculados.md)).

## Qué se resigna

- **La fase de cuadros no tiene diseño de referencia.** Se arma con las piezas de la fase de grupos; si después hay un diseño propio, se reemplaza.
- **La tabla de las zonas no se ve en los cuadros.** Ya no cambia, y la ubicación de cada uno está en los cuadros.
