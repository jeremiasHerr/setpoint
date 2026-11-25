# 155 — En la compu, el ranking se ve como planilla y la ficha en dos columnas

**Estado:** aceptada — 25 de noviembre de 2026.

## Contexto

El ranking público y la ficha del jugador son una columna de 370 px en el medio de la pantalla, pensada para el celular. En la compu sobra el 70 % del ancho, y en el ranking los puntos de cada torneo del calendario solo se ven abriendo la fila de un jugador, de a uno por vez. Es lo opuesto a la planilla con la que el circuito llevaba el ranking, donde se ve todo junto.

## Opciones consideradas

1. **El ranking como planilla y la ficha en dos columnas.**
   - En contra: cada página tiene dos diseños para mantener.
2. **Solo el ranking como planilla.**
   - En contra: la ficha, a la que se llega desde el ranking, seguiría siendo una columna angosta, y las dos páginas públicas quedarían distintas en la compu.
3. **Solo ensanchar la columna.**
   - En contra: sigue siendo una lista de celular agrandada, y no aprovecha la planilla que el circuito ya sabe leer.

## Decisión

Opción 1, elegida por el grupo, desde 1024 px.

- **Ranking:** una tabla con Pos, Jugador, una columna por torneo del calendario (en el orden de la API) y Total. No hay filas que se abran: el nombre es el link a la ficha ([decisión 074](074-entrada-a-la-ficha.md)).
- **Ficha:** a la izquierda, los datos, los puntos por torneo y los torneos; a la derecha, los partidos.
- **Ancho máximo de 1040 px** en las dos, para que las columnas no se estiren.
- **Debajo de 1024 px no cambia nada.** El celular conserva la fila que se abre.

## Por qué

- **La planilla es lo que el circuito ya sabe leer,** y deja comparar casilleros entre jugadores sin abrir nada.
- **Las dos páginas públicas quedan con el mismo ancho,** y la ficha deja de ser una tira angosta.
- **Los datos son los mismos:** la API ya trae los casilleros de cada fila, así que no se toca.

## Qué se resigna

- **Dos diseños por página para mantener:** la tabla del celular y la planilla de la compu (`TablaRanking` y `PlanillaRanking`) muestran lo mismo y hay que cambiarlas juntas.
- **El año de cada casillero** va en el título del encabezado, no a la vista, porque una columna es de un torneo y cada jugador puede tener un año distinto.
