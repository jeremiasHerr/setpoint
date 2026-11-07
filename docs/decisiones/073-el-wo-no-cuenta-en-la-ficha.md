# 073 — En la ficha, el W.O. no cuenta como partido jugado; el abandono sí

**Estado:** aceptada — 7 de noviembre de 2026

## Contexto

La ficha pública del jugador (F17) muestra cuántos partidos jugó, ganó y perdió. En la tabla de la zona, el W.O. y el abandono se computan igual, 6-0 6-0 para quien estuvo o siguió ([02-dominio.md](../02-dominio.md) §8.5), y desde la [decisión 059](059-abandono-sin-sets.md) ninguno de los dos guarda sets.

La [decisión 016](016-walkover-sin-sets-guardados.md) ya anticipaba que la ficha tendría que separar el W.O. "para no mostrar un partido que no existió".

## Opciones consideradas

1. **El W.O. no cuenta y el abandono sí.** Es lo que hace la ATP. Los dos figuran en la lista de partidos.
   - En contra: el récord de la ficha no coincide con la cuenta de la tabla de la zona.
2. **No cuenta ninguno de los dos:** solo los partidos con sets.
   - En contra: un abandono, que sí se jugó, no suma, y queda raro para quien ganó porque el rival se lesionó.
3. **Cuentan los dos, como en las tablas.**
   - En contra: a quien gana por W.O. le suma un ganado de un partido que no existió.

## Decisión

Opción 1, elegida por el grupo. `recordDelJugador()`, en `apps/api/src/modules/ficha/ficha.ts`:

- **Jugados:** los partidos con resultado, sin los W.O. Un abandono cuenta para los dos: ganado para quien siguió y perdido para quien abandonó.
- **Ganados y perdidos:** entre los jugados.
- **Los W.O. se cuentan aparte.** Si hay alguno, la ficha lo aclara debajo de los números ("Sin contar un W.O., que no se jugó"), para que no parezca que faltan partidos.
- En la lista, los dos figuran: el W.O. con "W.O." y el abandono con "ab.", como en la app.

## Por qué

- **Un W.O. no se jugó:** contarlo como ganado infla el récord de quien estuvo disponible, y contarlo como perdido castiga como derrota a quien no se presentó.
- **Un abandono sí se jugó:** empezó, y alguien no pudo seguir. Es el criterio de la ATP, que cualquiera que sigue el tenis reconoce.
- **No cambia ninguna tabla:** la zona sigue computando los dos 6-0 6-0. Solo cambia lo que dice la ficha de la persona.

## Qué se resigna

- **El récord de la ficha no es la suma de las tablas de zona:** un jugador con un W.O. a favor tiene un partido ganado en la tabla y uno menos en la ficha.
- **El abandono figura sin marcador:** desde la decisión 059 no se guarda lo que se jugó hasta el abandono.
