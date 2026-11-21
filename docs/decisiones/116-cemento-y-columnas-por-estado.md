# 116 — El organizador pasa al cemento, con las columnas del inicio por estado

**Estado:** aceptada — 19 de noviembre de 2026. Reemplaza en parte la [decisión 113](113-columnas-del-inicio-con-borde.md) (el fondo niebla y las columnas sin relleno) y la franja negra de la [094](094-inicio-en-columnas.md).

## Contexto

El fondo `niebla` (#F4F5F8) casi no se distinguía de las tarjetas `papel`: 1,09:1. El grupo pidió un fondo más oscuro y más color, y que debajo de la barra todo fuera del mismo fondo, sin la franja noche del bloque del circuito.

Se compararon sobre capturas de la app un modo oscuro (noche, grafito, pizarra, el azul de la cancha dura, el verde de cancha), con la evaluación de un agente crítico, y varias versiones claras.

## Opciones consideradas

1. **Un modo oscuro**, con el encabezado y las tarjetas en noche.
   - En contra: es un tema completo. Los tokens tienen nombres de material y no de función, y a una semana de la entrega había que recorrer y corregir cada pantalla.
2. **Claro, con un fondo gris más oscuro y el color en los estados.**
3. **Claro, con un color de marca nuevo en la barra:** verde de cancha, azul o ladrillo.
   - En contra: el grupo quiere la barra en el mismo noche que rodea la landing.

## Decisión

Opción 2, elegida por el grupo. Se lee mejor de día y al sol, y es el cambio más chico.

- **La barra va en `noche-900`,** el noche de la landing.
- **Debajo, todo va sobre `cemento` (#DFE3EA)** en las pantallas del organizador. El bloque del circuito del inicio y la franja del torneo dejan de ser bandas propias; la franja se separa con un borde `linea-cemento`. Las páginas públicas siguen en `niebla`.
- **El bloque del circuito pierde los torneos del calendario.** "Primavera 26 · inscripción" repetía lo que dice la columna Inscripción, y los otros decían "sin edición todavía". El calendario está en *Tu circuito*. Sin ellos, el nombre, las cifras y los botones entran en una fila.
- **Las columnas del inicio llevan el color de su estado:**
  - En preparación, en amarillo: relleno `amarillo-fondo` (#FDF7E6), borde `amarillo-borde` (#E6CF94) y marca `amarillo` (#B7801F).
  - Inscripción, en lona: `lona-fondo` y `lona-borde`.
  - En juego, en azul: `azul-fondo`, que pasa de #ECF1FD a #E5EDFE, y un borde nuevo `azul-borde` (#8DAAEC). La marca pasa de noche a `azul`.
  - Terminados queda neutra, con borde `linea-cemento`.
- **Las notas sueltas sobre el cemento van en `papel` con borde `linea`,** como las demás tarjetas: el relleno `niebla` quedaba como un hueco desteñido (nota de "Importar padrón" del inicio vacío, "¿Son muchos?", "¿Solo querés probar?", "¿No sabés cuál es?" y el aviso de participación del cierre).
- **`pizarra-500` pasa de #626D82 a #4A5468:** el de antes daba 4,05:1 sobre el cemento, y el nuevo da 5,91:1.

## Por qué

- **Las tarjetas se separan del fondo** (1,29:1, contra 1,09:1), sin bordes más gruesos ni sombras.
- **El color dice algo:** dónde está cada torneo. Es lo que pide design.md, que el color marque un estado y no decore. Lo terminado queda neutro porque ahí no hay nada que hacer.
- **El azul necesita más que la lona para leerse igual,** porque el cemento ya tira a azul: por eso tiene un relleno más saturado y un borde más fuerte.

## Qué se resigna

- **El amarillo se parece al ámbar** del chip del cuadro principal, aunque van en lugares distintos.
- **La columna En preparación tiene color aunque esté vacía,** que es lo más común.
- **El sistema tiene dos fondos:** cemento en el organizador y niebla en las páginas públicas.
- **El modo oscuro queda afuera.**
