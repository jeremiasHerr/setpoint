# 147 — El padrón filtra a los jugadores sin categoría

**Estado:** aceptada — 24 de noviembre de 2026.

## Contexto

Quien entra al padrón por un torneo suelto queda sin categoría ([decisión 089](089-torneo-suelto-ajeno-al-circuito.md)), y la organización también puede dar de alta a alguien sin categoría. En *Jugadores* se filtraba por las categorías del circuito, y a ellos solo se los veía en "Todas", mezclados con el resto. El grupo preguntó si hacía falta una categoría para los jugadores que no son del circuito.

## Opciones consideradas

1. **Un filtro "Sin categoría",** al lado de las categorías del circuito.
   - En contra: no dice en qué torneo suelto jugó cada uno.
2. **Un filtro por cada categoría de los torneos sueltos** ("General", "Libre"), con quienes se inscribieron en ella.
   - En contra: un jugador puede estar en varias, se mezclan las categorías del circuito con las de un torneo, y hay que cambiar lo que devuelve la API.
3. **Una categoría del circuito para los de afuera.**
   - En contra: aparecería en el ranking, en *Tu circuito* y en *Nuevo torneo*, como si fuera un nivel de juego.
4. **Dejarlo como está:** "Todas" y el buscador.
   - En contra: en un padrón de 77 cuesta encontrar a los que no son del circuito.

## Decisión

Opción 1, elegida por el grupo.

- **El filtro "Sin categoría" va después de las categorías del circuito,** y aparece solo si hay alguien sin categoría.
- **Si el circuito no tiene categorías, no aparece:** nadie tiene una, y "Todas" ya los muestra a todos.
- **No cambia la base ni la API:** el padrón ya trae la categoría de cada jugador, o ninguna.

## Por qué

- **Es lo que el padrón ya sabe:** "Sin categoría" es lo que dice la fila de cada uno de ellos.
- **Encontrarlos es el paso previo a asignarles una categoría,** si después juegan en el circuito, como prevé la decisión 089.
- **No inventa un nivel de juego** que no existe.

## Qué se resigna

- **No distingue a quien entró por un torneo suelto de quien se cargó a mano sin categoría.**
- **No dice en qué torneo suelto jugó cada uno:** eso está en su ficha.
