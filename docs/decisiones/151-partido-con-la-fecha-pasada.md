# 151 — El tablero distingue el partido con la fecha pasada y sin resultado

**Estado:** aceptada — 25 de noviembre de 2026.

## Contexto

La final Antileo–Sanhueza de la Copa Alta Barda tenía fecha acordada el 14 de noviembre y no tenía resultado. El tablero la contaba entre los "con fecha" y decía "También hay 1 partido con fecha acordada que todavía no se jugó", como si estuviera por jugarse. Un partido cuya fecha ya pasó no está por jugarse: casi seguro se jugó y falta que alguien cargue el resultado.

## Opciones consideradas

1. **Una situación nueva en la API, `falta_cargar`,** calculada al consultar, como el vencido.
   - En contra: suma un valor a `situacionesDelPartido`, que consumen la web y la API.
2. **Solo en la web,** separando dentro de `con_fecha` los que tienen la fecha pasada.
   - En contra: parte la regla entre la API y la web, y no llega a la app ni a la página en vivo.
3. **Solo cambiar el texto** del pie del tablero.
   - En contra: no avisa nada: el partido sigue escondido en un pie plegado.

## Decisión

Opción 1, elegida por el grupo.

- **`falta_cargar`:** el partido tiene fecha acordada, el día y la hora ya pasaron y no tiene resultado. Se calcula al consultar, sin cambiar el schema (decisión 060).
- **"Fecha acordada" es el mismo criterio que `con_fecha`:** estado anotada o confirmada, o una fecha acordada guardada.
- **Gana sobre `vencido`:** si la fecha acordada ya pasó, el partido es `falta_cargar` aunque también haya pasado la fecha límite.
- **En el tablero** tiene su propia lista, después de los vencidos y antes de los sin coordinar, con la acción *Cargar resultado*. El pie "con fecha acordada" deja de contarlos.

## Por qué

- **La acción que corresponde es pedir y cargar el resultado,** no dar un W.O. por un partido que los dos se comprometieron a jugar. Por eso gana sobre el vencido.
- **Una sola regla, en la API,** que usan el tablero y el avance del inicio, y que pueden usar la app y la página en vivo sin repetirla.
- **No se guarda nada:** como el vencido, no se desincroniza.

## Qué se resigna

- **Supone que el partido se jugó,** aunque pudo suspenderse. En ese caso la organización lo resuelve desde *Más*: extender el plazo o dar el W.O.
- **Un partido sin hora no existe:** la fecha acordada siempre tiene hora, así que alcanza con compararla con el momento de la consulta.
