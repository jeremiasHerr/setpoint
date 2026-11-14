# 063 — Al tablero se llega desde el Sorteo, y las otras pantallas del torneo vuelven a él

**Estado:** aceptada — 30 de octubre de 2026. Las migas de *Cargar resultado* y del *Cierre* están reemplazadas por la [decisión 095](095-navegacion-del-torneo.md): las pantallas del torneo comparten una franja con pestañas. "Ir al tablero" y los botones de vuelta al tablero siguen.

## Contexto

Mientras no existía el tablero, la página del torneo era el *Sorteo de zonas*: desde ahí se entraba a *Cargar resultado* ([decisión 031](031-como-se-llega-a-cargar-resultado.md)), y las migas de esa pantalla volvían al Sorteo. Al cierre se llega desde *Cargar resultado* ([decisión 058](058-como-se-llega-al-cierre.md)). Las dos decisiones dicen que la entrada cambia cuando llegue el tablero.

El inicio tiene diseñada una tarjeta "En juego" para cada torneo, pero hoy llega siempre vacía: el inicio no lee partidos.

## Opciones consideradas

1. **Desde el Sorteo y las migas:** el Sorteo confirmado lleva al tablero, y las migas y los botones de vuelta de *Cargar resultado* y del *Cierre* apuntan a él.
   - En contra: toca tres pantallas, aunque solo en sus enlaces, y el inicio sigue sin mostrar los torneos en juego.
2. **Además, el inicio:** llenar la tarjeta "En juego", que ya está diseñada.
   - En contra: la API del inicio tiene que empezar a leer partidos, y es otra pantalla en el mismo PR.

## Decisión

Opción 1.

- **La ruta es `/torneos/:id/tablero`**, sobre `GET /api/organizaciones/:slug/torneos/:id/tablero`.
- **En el Sorteo confirmado**, el botón "Cargar resultados" pasa a ser "Ir al tablero". Desde el tablero se carga cualquier resultado.
- **En *Cargar resultado*,** la edición de las migas, "Cancelar" y "Volver al tablero" llevan al tablero.
- **En el *Cierre*,** las migas, "Volver al tablero" y "Ver el tablero" llevan al tablero. "Cerrar el torneo" se sigue ofreciendo en *Cargar resultado* al cargar el último resultado, y ahora también en el tablero.

## Por qué

- **Es lo que anunciaban las decisiones 031 y 058:** el tablero pasa a ser la página del torneo, y las otras pantallas no cambian más que sus enlaces.
- **El PR queda en una pantalla.** El inicio tiene su propio trabajo pendiente: leer partidos para "En juego" y los torneos terminados.

## Qué se resigna

- **Desde el inicio no se llega al tablero de un torneo en juego.** Y como una categoría con el sorteo confirmado deja de verse en el inicio ([03-flujo-organizacion.md](../03-flujo-organizacion.md) §3), tampoco al Sorteo: después de confirmarlo, se vuelve al tablero desde las pantallas del torneo o con su URL. Es la misma limitación que ya tenía *Cargar resultado*, y se resuelve llenando la tarjeta "En juego" del inicio.
