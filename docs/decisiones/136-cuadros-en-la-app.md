# 136 — Los cuadros se dibujan en la app, desde Mi zona

**Estado:** aceptada — 22 de noviembre de 2026.

## Contexto

Con las zonas cerradas, *Mi zona* le dice al jugador a qué cuadro pasó, y "Ver el cuadro" abría la pestaña Cuadros de la página en vivo en el navegador (decisión 069). La app no dibujaba los cuadros: hacía falta rehacer las piezas del cuadro de la web, que la app no tiene (lo dejó anotado el PR #162 en F11).

La API pública de los cuadros ya existe (`GET /api/publico/:slug/torneos/:id/cuadros`) y no pide login, como la de la ficha que la app ya usa. En el celular, la web muestra los cuadros de a una ronda (decisión 038).

## Opciones consideradas

1. **Desde Mi zona:** "Ver el cuadro" abre una pantalla nueva de la app en lugar de la web.
   - En contra: para verlos hay que pasar por Mi zona.
2. **Una pestaña nueva, "Cuadros":** siempre a mano.
   - En contra: en la fase de zonas queda vacía casi tres semanas, y suma una pestaña a la barra (decisión 045).

## Decisión

Opción 1, elegida por el grupo.

- **Una pantalla apilada, `cuadros/[id]`,** con el id del torneo, sobre la misma ruta pública que la web. La sesión solo dice de qué circuito.
- **Una ronda a la vez, con chips por ronda,** como el celular en la web. Si hay dos cuadros, un chip por cuadro, con el nombre del consuelo que elige la organización.
- **Abre en el cuadro al que pasó el jugador y en la ronda donde juega o jugó por última vez,** que es lo que busca quien entra desde Mi zona. Su partido lleva el borde noche y "· vos" al lado de su nombre.
- **Quien pasa directo por un bye** aparece en su lugar, tenue, con "pasa directo a semis" (decisión 083).
- **La lógica del cuadro es una copia de la de la web** (`features/cuadros/cuadro.ts`): dónde va cada partido, quién pasa directo y en qué ronda abre. Es pura y chica, y cada app ya tiene sus propias piezas (decisión 034).

## Por qué

- **Es donde el jugador se entera de que pasó al cuadro:** el botón ya estaba ahí, y deja de mandarlo afuera de la app.
- **No hace falta API nueva:** la ruta pública ya devuelve todo, incluidos los byes.

## Qué se resigna

- **La lógica del cuadro queda en dos lugares,** la web y la app. Si cambia dónde va cada partido, cambia en los dos. Moverla a `packages/shared` queda para después de la entrega.
- **Para verlo en el celular hace falta un APK nuevo.**
- **Fuera de Mi zona no hay entrada a los cuadros en la app;** desde la página en vivo se siguen viendo en la web.
