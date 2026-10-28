# 059 — El abandono se carga como el W.O.: sin sets, 6-0 6-0 para quien siguió

**Estado:** aceptada — 28 de octubre de 2026. Reemplaza la [decisión 027](027-abandono.md).

## Contexto

Con la [decisión 027](027-abandono.md), un abandono guardaba lo que se jugó y se computaba como un W.O. En la pantalla *Cargar resultado*, eso obligaba a escribir al menos el set en que se abandonó. Si la grilla quedaba vacía, el botón "Guardar" se deshabilitaba sin decir por qué, y un abandono antes de ganar un game había que cargarlo escribiendo 0 a 0.

Probando la pantalla, la organización pidió lo contrario: que al marcar el abandono los casilleros queden bloqueados, como si fuera un W.O., y que se guarde 6-0 6-0 para quien siguió jugando.

## Opciones consideradas

1. **Permitir el abandono con o sin sets**: la grilla vacía también se guarda.
   - En contra: el mismo estado a veces tiene marcador y a veces no, y la pantalla tiene que explicar las dos formas.
2. **Seguir pidiendo el marcador**, con un aviso que diga qué falta.
   - En contra: obliga a la organización a cargar un marcador que no cambia ninguna tabla, porque el abandono ya cuenta 6-0 6-0.
3. **Cargarlo como el W.O.**: casilleros bloqueados, solo se elige quién siguió, no se guardan sets.
   - En contra: se pierde el marcador real (ver lo que se resigna).

## Decisión

Opción 3.

- **El abandono no lleva sets.** El contrato es `{ tipo: 'abandono', ganadorId }`, igual que el del W.O. Si llegan sets, se descartan al validar.
- **La tabla lo cuenta 6-0 6-0 a favor de quien siguió**, como antes: se arma al calcular, con el estado y el ganador ([decisión 016](016-walkover-sin-sets-guardados.md)). No se guardan sets 6-0.
- **En la pantalla, al marcar "Fue walkover" o "Hubo abandono", los casilleros quedan vacíos y bloqueados**, y se elige quién ganó o quién siguió jugando.
- **Los abandonos cargados antes conservan sus sets.** No cuentan para la tabla (nunca contaron), y las pantallas que los muestran siguen mostrándolos. Al corregir uno, se guarda sin sets.
- **Se sigue distinguiendo del W.O. por el estado**: en el cuadro y en la app dice "ab.", no "W.O.".

## Por qué

- **Es lo que pidió la organización:** cargar un abandono es elegir quién siguió, nada más.
- **El marcador no cambia ninguna tabla.** Para los desempates, el abandono ya valía 6-0 6-0; los sets que se cargaban solo se mostraban.
- **W.O. y abandono se cargan igual**, con una sola regla en la API, en la web y en la validación compartida. Desaparece la validación del set a medias, que era la parte más difícil de explicar.

## Qué se resigna

- **Se pierde el marcador real del abandono** ("6-3 2-1, abandonó"). Es lo que la 027 quería conservar para la ficha del jugador (F17) y el cara a cara (F18): ahí un abandono va a figurar sin games.
- **No queda registro de si el partido llegó a empezar**, más allá de que la organización eligió "abandono" y no "W.O.".
