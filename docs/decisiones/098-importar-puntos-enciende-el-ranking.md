# 098 — Importar puntos enciende el ranking

**Estado:** aceptada — 14 de noviembre de 2026

## Contexto

Toda organización arranca con `usa_ranking` apagado, para que pueda empezar con un torneo suelto sin configurar nada ([07-configurabilidad.md](../07-configurabilidad.md) §1). Desde la [decisión 011](011-la-importacion-detecta-el-calendario.md), la importación crea las categorías y los torneos del calendario que trae la planilla. Una organización recién registrada que sube su ranking de siempre quedaba con los puntos cargados y el ranking apagado: no los veía en ningún lado hasta encenderlo a mano en *Tu circuito*. 07 §1.1 lo dejaba como propuesta.

## Opciones consideradas

1. **Encenderlo al confirmar**, si la importación trae puntos.
   - En contra: la importación cambia una configuración de la organización, además de su padrón.
2. **Dejarlo como está**: la organización lo enciende a mano.
   - En contra: lo que acaba de importar queda escondido, y nada le dice que tiene que ir a *Tu circuito*.

## Decisión

Opción 1, elegida por el grupo.

- **Al confirmar una importación con al menos un casillero con puntos**, en la misma transacción, se enciende `usa_ranking`.
- **La revisión lo dice antes**, junto con lo que se crea en el circuito: "También se activa el ranking, porque la planilla trae puntos".
- **Una planilla sin puntos**, solo con nombres, no lo toca.

## Por qué

- **Una organización que importa su ranking tiene un ranking.** Dejarlo apagado escondería lo que acaba de cargar.
- **Apagar el ranking no borra nada** (07 §1): si no lo quiere, lo apaga en *Tu circuito* y los puntos quedan guardados.

## Qué se resigna

- **La importación deja de tocar solo el padrón.** Se compensa diciéndolo en la revisión, antes de confirmar.
