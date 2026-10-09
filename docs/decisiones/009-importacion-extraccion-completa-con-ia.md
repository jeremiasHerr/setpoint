# 009 — Cómo interpreta la IA la planilla del padrón

**Estado:** aceptada — 5 de octubre de 2026. **Modificada en parte** por la devolución del 25% ([devolucion-25.md](../devolucion-25.md)): la extracción completa sigue en pie, pero "nada se guarda sin revisión humana" pasa a ser revisión **por excepción** (cambio C), y las etapas pueden detectarse en la planilla en lugar de venir configuradas ([decisión 011](011-la-importacion-detecta-el-calendario.md)).

## Contexto

F03 ([10-features.md](../10-features.md)) carga el padrón desde la planilla Excel que el circuito ya usa: una fila por jugador, una columna por etapa y, a veces, un total. Las planillas varían en el orden de las columnas, los títulos, las filas de totales, las notas, las celdas vacías y cómo está escrito cada nombre ([06-ia.md](../06-ia.md) §1).

Hay tres problemas: entender qué columna es cada etapa y de qué año, ubicar los puntos de cada jugador y reconocer si es alguien que ya está en el padrón. Había que decidir qué parte de eso hace el modelo y qué parte el código.

## Opciones consideradas

1. **Mapeo de columnas.** El modelo ve el encabezado y unas filas de muestra, y devuelve qué columna es el nombre, cuál es cada etapa y cuál el total, y qué filas no son jugadores. El código lee los números con ese mapeo. La identidad se resuelve aparte, con el modelo o con similitud de texto.
   - En contra: supone que la planilla es una tabla limpia con un solo encabezado. Se rompe con encabezados repetidos en el medio, nombres repartidos en dos columnas, totales intercalados o una etapa partida en dos columnas, y cada caso termina siendo un `if` nuevo. La identidad sigue necesitando una segunda pasada.
2. **Extracción completa.** El modelo lee la planilla entera, fila por fila con su número, junto con el padrón y las etapas, y devuelve cada jugador ya interpretado: fila, nombre, casilleros con puntos, acumulado y con quién del padrón coincide, con un grado de confianza.
   - En contra: el modelo escribe los números, así que puede inventar uno. Cuesta más tokens, porque reescribe la planilla, y tarda más.

## Decisión

Opción 2, con el riesgo de los números cubierto en código: la respuesta se audita contra la planilla antes de mostrarla. Cada número tiene que estar en su fila, el acumulado tiene que ser la suma de los casilleros, la fila tiene que existir y el id tiene que ser del padrón. Hay un reintento con los problemas como feedback y nada se guarda sin revisión humana. Las seis capas están en [06-ia.md](../06-ia.md) §1.

## Por qué

- **La variabilidad de las planillas es justamente lo que la IA resuelve bien**, y lo que con un mapeo habría que programar caso por caso. El eval da 626/626 en cinco planillas distintas, incluida una que no es de jugadores.
- **El riesgo de inventar números es verificable.** Con el archivo a mano, comprobar que un número está en su fila es una función pura de menos de 100 líneas, con tests. No hace falta confiar en el modelo: alcanza con auditarlo.
- **Una sola llamada resuelve todo**, la identidad incluida, con el padrón en contexto. El modelo ve "J. Painemil" junto a "Juan Painemil" y avisa que no es exacto.
- **El costo no pesa:** unos US$ 0,02 y 20 segundos por categoría, para algo que se hace pocas veces por año.

## Qué se resigna

- **Costo y tiempo.** Con el mapeo, la salida serían unas pocas líneas. Acá el modelo reescribe cada número: casi todo el costo es salida, y una categoría grande tarda cerca de un minuto.
- **Determinismo.** La misma planilla podría interpretarse distinto en dos corridas (se usa `temperature: 0`, pero no es una garantía). Lo compensan la auditoría, la revisión humana y la idempotencia de la confirmación.
- **Planillas grandes.** Toda la planilla viaja en un mensaje y vuelve en una respuesta de hasta 16.000 tokens. Con unos 146 tokens por jugador, entran **unos 100 jugadores por planilla**. POLENTA tiene 77 entre sus dos categorías y se importa una categoría por vez, así que sobra. Una planilla más grande termina en error ("se cortó por max_tokens"), y habría que partirla en tandas de filas.
- **Dependencia de un servicio externo.** Sin API key, o con la API caída, la importación termina en error. El alta manual (F02) sigue funcionando.
