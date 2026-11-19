# 113 — El inicio pasa a niebla, con las columnas en borde

**Estado:** aceptada — 19 de noviembre de 2026.

## Contexto

El inicio era la última pantalla del organizador en fondo `papel`. design.md pide fondo `niebla` y tarjetas `papel`, y las demás pantallas ya pasaron.

El inicio tiene algo que las otras no: las cuatro columnas de la [decisión 094](094-inicio-en-columnas.md) (en preparación, inscripción, en juego, terminados) llevaban un relleno `linea-suave` (#ECEEF3). Sobre papel se distinguían; sobre niebla (#F4F5F8) casi no.

## Opciones consideradas

1. **Niebla, con las columnas como estaban.**
   - En contra: las columnas apenas se separan de la página, y las cuatro etapas del torneo se leen como una sola superficie.
2. **Niebla, con las columnas sin relleno y con un borde de 1 px `linea`.**
3. **Seguir en papel**, como excepción, cambiando solo el margen del celular.
   - En contra: sería la única pantalla del organizador con otro fondo, y design.md no tiene por qué hacerle una excepción.

## Decisión

Opción 2, elegida por el grupo.

- **Fondo `niebla`**, en la vista con torneos y en la primera vez.
- **Las columnas pierden el relleno** y llevan un borde de 1 px `linea`. Las tarjetas de los torneos siguen en `papel`.
- **En la primera vez**, las dos tarjetas de los caminos pasan a `papel`, y la nota de la planilla es una caja `niebla` con borde, como en *Tu circuito*.
- **Margen de 16 px debajo de 768**, como el resto de las pantallas del organizador.

## Por qué

- **Es el mismo lenguaje que el resto del sistema:** fondo niebla, tarjetas papel y bordes de 1 px. No hace falta un gris más.
- **Las cuatro columnas se siguen leyendo como el recorrido de un torneo**, que es lo que pidió la decisión 094.

## Qué se resigna

- **Las columnas dejan de ser bloques de color:** son un contorno, y con pocas tarjetas se ven más vacías que antes.
