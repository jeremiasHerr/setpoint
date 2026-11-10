# 084 — "Necesita tu atención" va en rojo solo si hay algo vencido

**Estado:** aceptada — 10 de noviembre de 2026

## Contexto

El bloque "Necesita tu atención" del Inicio es rojo, y en design.md el rojo significa vencimiento. La referencia ([home.html](../pantallas/organizador/home.html)) suma ahí las vinculaciones para revisar ([decisión 051](051-vinculacion-con-el-padron.md)) con punto negro, porque no venció nada, pero dentro del mismo recuadro rojo, al lado de los partidos vencidos.

Los avisos de vencimiento todavía no se calculan, así que las vinculaciones para revisar son los primeros avisos reales del bloque. Muchas veces van a estar solas.

## Opciones consideradas

1. **Como la referencia:** el recuadro siempre en rojo y las vinculaciones con punto negro.
   - En contra: con solo vinculaciones, el Inicio muestra un recuadro rojo sin que haya vencido nada, y alarma de más.
2. **El recuadro va en rojo solo si algún aviso es de vencimiento;** si no, queda neutro, con borde gris y fondo blanco, con el mismo título y los mismos renglones.
   - En contra: se aparta de la referencia, y el bloque tiene dos aspectos.
3. **Las vinculaciones en un bloque aparte**, fuera de "Necesita tu atención".
   - En contra: un bloque más en la columna del Inicio, para algo que también pide atención.

## Decisión

Opción 2, elegida por el grupo. El punto de cada renglón sigue como en la referencia: rojo para lo vencido, negro para las vinculaciones.

## Por qué

- **El rojo conserva su significado.** Si aparece, algo venció; si no, no.
- **Es una línea de código** y no cambia los renglones ni dónde está el bloque.

## Qué se resigna

- **Con algo vencido, las vinculaciones quedan dentro del recuadro rojo**, como en la referencia. El punto negro es lo que las distingue.
