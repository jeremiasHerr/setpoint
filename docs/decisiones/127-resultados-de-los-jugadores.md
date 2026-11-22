# 127 — Los jugadores cargan su resultado desde la app y cuenta cuando lo confirma el rival

**Estado:** aceptada — 22 de noviembre de 2026. Cierra la decisión abierta 12 del [README](../README.md).

## Contexto

F06 dice que "cada circuito define si los resultados los carga únicamente la organización o si también pueden cargarlos los jugadores con confirmación del rival". El parámetro `quienCargaResultados` estaba en el schema desde el principio ([07](../07-configurabilidad.md) §1), pero ningún código lo usaba: los resultados los cargaba siempre la organización, a mano o desde los mensajes (F19).

La idea del grupo es que la organización siga cargando, y que además los jugadores puedan cargar el resultado de sus partidos si tienen la app y la sesión iniciada. Quedaban tres preguntas: cuándo cuenta lo que carga un jugador, si lo elige cada circuito y dónde se guarda mientras tanto.

## Opciones consideradas

**Cuándo cuenta**

1. **Cuando lo confirma el rival.** Hasta entonces no mueve tablas ni cuadros. Si el rival no tiene la app, o no contesta, lo confirma la organización.
   - En contra: un resultado puede quedar trabado hasta que alguien lo confirme.
2. **Al instante**, y el rival lo puede objetar.
   - En contra: un error de tipeo hace avanzar al ganador equivocado en el cuadro, y corregirlo choca con la [decisión 028](028-correccion-de-resultados.md) si el partido siguiente ya se jugó.
3. **Cuando lo confirma la organización**, como lo dudoso de F19.
   - En contra: le sigue dejando todo el trabajo a la organización, y no es lo que dice F06.

**Quién lo elige**

1. **Cada circuito, con `quienCargaResultados`**, desde *Tu circuito*.
   - En contra: un interruptor más.
2. **Siempre activo para todos.**
   - En contra: contradice F06 y lo que respondió POLENTA, que carga sola.

**Dónde se guarda mientras espera**

1. **En una tabla nueva, `ResultadoPropuesto`**: el partido, quién lo cargó, los sets, el estado y las fechas.
   - En contra: una migración.
2. **En campos nuevos de `Partido`.**
   - En contra: el partido mezcla lo que cuenta con lo que no, y se pierde el registro de los desacuerdos.

## Decisión

La primera de cada una, elegidas por el grupo.

- **Cuenta cuando lo confirma el rival.** Un `ResultadoPropuesto` pendiente no cambia el partido: lo que cuenta lo guarda `aplicarResultado()`, el mismo camino que usa la organización, con las mismas validaciones, el avance del cuadro y el recálculo de puntos. Si el rival lo rechaza, queda rechazado y cualquiera de los dos lo vuelve a cargar. Si la organización lo confirma desde el tablero, o carga ella el resultado, el pendiente se cierra.
- **Lo elige cada circuito:** `jugadoresCarganResultados` en *Tu circuito*, guardado en `quienCargaResultados`. Toda organización arranca en "solo la organización", y POLENTA sigue así.
- **Se guarda en `ResultadoPropuesto`**, con `organizacionId`, como toda entidad del dominio. Los datos se validan con Zod al entrar y al leerlos.
- **El jugador carga un partido jugado o un abandono, nunca un W.O.:** el W.O. lo decide el Comité ([02](../02-dominio.md) §8.4). Tampoco corrige un resultado que ya cuenta: eso sigue siendo de la organización.
- **Solo los dos jugadores del partido, desde la app y con sesión:** las rutas son las del jugador, bajo `/api/jugador/:slug` ([decisión 044](044-rutas-del-jugador.md)). Si el rival ya cargó uno, primero lo confirma o lo rechaza; el propio, mientras está pendiente, se puede cambiar.
- **Avisos push** ([decisión 047](047-avisos-push.md)): al rival cuando le cargan un resultado, y a quien lo cargó cuando se confirma o se rechaza.

## Por qué

- **Nada entra a las tablas sin que lo vean los dos.** Es la misma lógica que la fecha de F14, que los jugadores ya conocen: uno anota, el otro confirma.
- **No hay un camino nuevo para guardar un resultado.** Confirmar es llamar a lo mismo que la carga de la organización, así que las reglas de la 028 y los puntos de la 055 valen igual.
- **El circuito que no lo quiere no lo ve.** POLENTA carga por WhatsApp y F19, y no cambia nada para ellos.

## Qué se resigna

- **Un resultado puede quedar esperando** si el rival no contesta. La organización lo ve en el tablero y lo confirma con un toque.
- **El jugador no corrige:** si el resultado ya cuenta y está mal, se lo pide a la organización.
- **Quien no tiene la app no carga:** la web del jugador no tiene esta pantalla, porque la sesión del jugador vive en la app.
