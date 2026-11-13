# 089 — El torneo suelto es ajeno al circuito

**Estado:** aceptada — 12 de noviembre de 2026

## Contexto

Al crear un torneo desde el inicio sin haber armado el circuito, *Nuevo torneo* pedía elegir una categoría y, sin ninguna cargada, mandaba a *Tu circuito*. Eso contradice la promesa del inicio: un torneo suelto no tendría que pedir configurar nada antes ([decisión 088](088-dos-caminos-iguales-en-el-inicio.md)).

Además, una organización con circuito puede querer un torneo "por diversión" que no tenga nada que ver con él: que no sume al ranking, que no use sus categorías y en el que se anote cualquiera.

Lo que lo complica:
- **Todo torneo tiene una categoría** en la base, y el padrón, la inscripción y las pantallas cuelgan de ella.
- **La inscripción exige que el jugador sea de la categoría del torneo** (`OTRA_CATEGORIA`). Con una categoría propia del torneo, nadie del padrón podría anotarse.
- **Quien entra al padrón por primera vez queda en la categoría del torneo.**

## Opciones consideradas

1. **La categoría del torneo suelto se marca "suelta"**: una columna nueva en `Categoria`.
   - En contra: hay que filtrar la marca en los lugares que listan las categorías del circuito.
2. **Torneo sin categoría:** la categoría del torneo pasa a ser opcional.
   - En contra: no se puede dividir un torneo suelto por nivel, y hay que revisar todas las pantallas que muestran "Nombre · Categoría" y la cuenta de cupos. Es demasiado a dos semanas de la entrega.
3. **Una categoría "General" automática**, del circuito.
   - En contra: aparece en *Tu circuito* sin que nadie la eligiera, y el torneo queda atado al padrón de esa categoría.

## Decisión

Opción 1, elegida por el grupo.

- ***Nuevo torneo* pregunta "¿De qué es este torneo?":** *Del circuito* o *Suelto*. Sin categorías en el circuito no pregunta: es suelto.
- **Del circuito:** se eligen sus categorías y, con el ranking activo, el torneo del calendario ("No suma al ranking" si no se elige ninguno). Es lo de antes.
- **Suelto:** las categorías se escriben en el torneo. Arranca con "General", porque quien no divide por nivel no tiene que escribir nada. No suma a ningún casillero.
- **Las categorías sueltas** se crean al guardar el torneo, en la misma transacción. Otro torneo suelto con el mismo nombre reutiliza la misma. No pueden llamarse como una del circuito (`CATEGORIA_DEL_CIRCUITO`): el nombre es único en la organización, y así no se confunden.
- **No aparecen** en *Tu circuito*, el ranking, el alta del padrón ni la importación. Guardar *Tu circuito* no las desactiva.
- **En un torneo suelto se anota cualquiera del padrón**, por el link, la búsqueda o a mano, sin `OTRA_CATEGORIA`. El link personal de cada jugador también lo muestra.
- **Quien entra al padrón por un torneo suelto queda sin categoría**, y la organización le asigna una si después juega en el circuito.
- **Publicado, el tipo queda fijo**, como las categorías: cambiarlo cambiaría quién se puede inscribir.

## Por qué

- **No cambia ninguna tabla salvo una columna**, y el resto del sistema (sorteo, tablero, cuadros, cierre) ya funciona igual con cualquier categoría. Un torneo sin casillero ya cerraba sin puntos ([decisión 057](057-cierre-sin-ranking.md)).
- **Un torneo suelto se puede seguir dividiendo por nivel**, que es lo que hace cualquier torneo de club.
- **Cumple la promesa del inicio:** se crea un torneo sin configurar nada.

## Qué se resigna

- **"Torneo suelto" cambia de significado.** Antes era cualquier torneo sin torneo del calendario; ahora es el ajeno al circuito. El del circuito que no suma se muestra como "No suma al ranking". La decisión abierta 15 (cómo se llama en la interfaz un torneo sin etapa) sigue abierta para lo demás.
- **Si el circuito suma una categoría con el nombre de una suelta**, la suelta pasa a ser del circuito, porque el nombre es único.
- **Las categorías sueltas no se pueden renombrar ni borrar** desde ninguna pantalla. Quedan para los torneos que las usaron.
