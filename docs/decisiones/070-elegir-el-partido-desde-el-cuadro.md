# 070 — En Cargar resultado, el partido se elige desde las zonas y el cuadro dibujado, arriba de la carga

**Estado:** aceptada — 4 de noviembre de 2026. Reemplaza la elección del partido de la [decisión 031](031-como-se-llega-a-cargar-resultado.md) (la lista por secciones detrás de "Cambiar partido"). La ruta sigue igual.

## Contexto

Desde la decisión 031, *Cargar resultado* abre en el primer partido sin resultado, y para ir a otro hay que tocar "Cambiar partido" y buscarlo en una lista por zona y por ronda. Probándola, el grupo pidió no pasar partido por partido: ver el cuadro como una rama y elegir en él el partido al que se le carga el resultado.

## Opciones consideradas

1. **El cuadro arriba y la carga abajo.** La pantalla se ensancha. Arriba, una pestaña por zona y una por cuadro: cada zona con sus partidos, y cada cuadro dibujado como en la página pública. Tocar un partido lo abre abajo.
   - En contra: la pantalla deja de tener el ancho de 720 px de la referencia, y con el cuadro arriba la carga queda más abajo.
2. **El cuadro con la carga en un panel al costado.**
   - En contra: en una notebook de 1024 px el cuadro no entra junto al panel.
3. **La rama solo en los cuadros**, y las zonas con la lista de antes.
   - En contra: dos formas de elegir en la misma pantalla.

## Decisión

Opción 1, elegida por el grupo.

- **Arriba, "Elegí el partido"**, con una pestaña por zona y una por cuadro. Cada pestaña dice cuántos partidos faltan. Abre en la del partido abierto.
- **Las zonas muestran sus partidos como tarjetas**, con los que faltan primero y lo que pasó ("ganó Roa", "venció").
- **Los cuadros se dibujan con `CuadroCompleto`**, el mismo de la página pública. En una pantalla angosta van de a una ronda, como en el celular ([decisión 038](038-cuadros-en-el-celular.md)). Un partido que espera a los ganadores de la ronda anterior no se puede elegir.
- **El partido abierto se marca** con borde negro y anillo lima. Tocar otro lo abre en `/torneos/:id/resultados/:partidoId`.
- **Abajo, la carga de siempre**, con el ancho de la referencia. Desaparece "Cambiar partido".
- **La rama sale de `GET /api/organizaciones/:slug/torneos/:id/cuadros`**, que ya existía. La API no cambia. Se pide bajo la clave de los partidos, así guardar un resultado refresca también la rama.

## Por qué

- **Es como la organización piensa el torneo:** en un cuadro se busca la llave, no una fila.
- **Reutiliza el cuadro público**, con los mismos codos y las mismas medidas: lo único nuevo es que tocar un partido lo elige.
- **Ver la rama mientras se carga** dice dónde va el ganador sin leer la vista previa.

## Qué se resigna

- **La pantalla es más larga.** Para guardar hay que bajar hasta la carga.
- **La lista por secciones se borra** (`SelectorDePartido`): en la fase de grupos, ya no se ven todas las zonas de una vez.
