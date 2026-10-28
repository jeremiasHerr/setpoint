# 058 — Al cierre del torneo se llega desde Cargar resultado

**Estado:** aceptada — 27 de octubre de 2026

## Contexto

La pantalla de referencia *Cerrar el torneo* tiene, en el encabezado, las pestañas Zonas / Cuadros / Cierre, que son las del tablero del torneo (F15). El tablero todavía no existe. Es el mismo problema que la [decisión 031](031-como-se-llega-a-cargar-resultado.md) resolvió para *Cargar resultado*.

## Opciones consideradas

1. **Desde Cargar resultado**, cuando ya no falta ningún resultado de los cuadros.
   - En contra: es otra entrada provisoria que el tablero va a reemplazar.
2. **Las pestañas de la referencia**, apuntando a lo que hay: Zonas al Sorteo, Cuadros a la página pública.
   - En contra: Zonas y Cuadros llevarían a pantallas que no son las del diseño, y es navegación que el tablero va a rehacer.
3. **Desde el inicio**, en la tarjeta del torneo en juego.
   - En contra: el inicio todavía no sabe nada de partidos, y habría que sumárselo solo para esto.

## Decisión

Opción 1.

- **La ruta es `/torneos/:id/cierre`.**
- **Al guardar el último resultado de los cuadros**, *Cargar resultado* dice "Los campeones están definidos" y ofrece "Cerrar el torneo".
- **Si no falta ningún resultado y hay cuadros**, la lista de partidos también ofrece "Cerrar el torneo".
- **La pantalla no tiene pestañas.** Las migas son "<edición · categoría> / Cierre", y la edición lleva a *Cargar resultado*.
- **Con el torneo ya cerrado, la misma ruta muestra lo que pasó**: los campeones y los puntos que se otorgaron.

## Por qué

- **Se llega en la demo sin escribir la URL**, justo cuando corresponde: al cargar el resultado que define a los campeones.
- **No hace falta que otra pantalla sepa cuándo se puede cerrar:** *Cargar resultado* ya tiene la lista de partidos.

## Qué se resigna

- **Cuando llegue el tablero, la entrada cambia** y probablemente aparezcan las pestañas de la referencia. Esta pantalla no se toca.
- **"Cerrar el torneo" se sigue ofreciendo con el torneo ya cerrado**, porque la lista de partidos no trae el estado del torneo. Lleva a la misma pantalla, que muestra que ya se cerró.
