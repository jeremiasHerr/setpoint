# 008 — Qué fecha lleva un movimiento importado desde la planilla

**Estado:** aceptada — 5 de octubre de 2026

## Contexto

Al confirmar una importación del padrón (F03), cada casillero con puntos de la planilla se convierte en un `MovimientoRanking` con motivo `IMPORTACION_INICIAL`. El movimiento necesita una `fecha`, pero la planilla no la tiene: dice "Otoño 26", no qué día se jugó. El modelo `Etapa` tampoco tiene fechas.

La fecha importa porque el ranking ([decisión 001](001-calculo-del-ranking.md)) toma, por cada casillero de etapa, **el movimiento más reciente**. Un movimiento importado tiene que quedar después del mismo casillero del año anterior y antes de cualquier torneo real de esa etapa y ese año, para que el resultado real lo reemplace.

`ranking.ts` no aplica la ventana de 12 meses (ver "Qué se resigna" en la 001): la fecha solo ordena dentro de un mismo casillero.

## Opciones consideradas

1. **1° de enero del año del casillero.** La etapa y el año quedan además en `detalle` ("Planilla: Otoño 2026").
   - En contra: es una fecha inventada, y el historial la muestra como "1 ene". Si algún día se aplica la ventana de 12 meses, esos casilleros vencerían antes de tiempo.
2. **Agregar `mesInicio` a `Etapa`** con una migración y fechar el movimiento el día 1 de ese mes.
   - En contra: suma una migración, un campo nuevo en la configuración del circuito (F01) y un valor de respaldo para cuando venga vacío. Las etapas que cruzan de año, como "Verano 25/26", siguen siendo ambiguas.
3. **Derivarla del orden de la etapa** repartiendo el año: con 5 etapas, Primavera en enero, Verano en marzo, y así.
   - En contra: los meses no coinciden con el calendario real. Si un torneo real cerró antes que la fecha inventada de su etapa, reimportar la planilla le pisaría el resultado.

## Decisión

Opción 1. `fechaDelCasillero(anio)` en `apps/api/src/modules/padron/importacion/confirmacion.ts` devuelve el 1° de enero del año, en UTC.

## Por qué

- **Es correcta con el cálculo que existe.** Un torneo real de esa etapa y ese año siempre cierra después del 1° de enero, así que su movimiento le gana al importado. Y el importado de 2026 le gana al de 2025.
- **No necesita migración ni configuración nueva.** Funciona para cualquier circuito, sin pedirle más datos al organizador.
- **La idempotencia queda simple:** el mismo casillero es el mismo jugador, la misma etapa, el mismo año y los mismos puntos.

## Qué se resigna

- **La fecha real del historial importado.** El jugador ve "1 ene 2026" en un casillero de Otoño. El `detalle` dice de qué etapa vino.
- **Compatibilidad con una ventana rodante.** Si en el futuro se aplica `ventanaRankingMeses`, habrá que revisar esta decisión: lo más probable es que haga falta la opción 2.
