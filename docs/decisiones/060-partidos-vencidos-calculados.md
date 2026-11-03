# 060 — Un partido vencido se calcula al consultar, no se guarda

**Estado:** aceptada — 30 de octubre de 2026

## Contexto

El tablero (F15) tiene que señalar los partidos vencidos: los que pasaron su plazo sin jugarse, que según el reglamento resuelve la organización ([02-dominio.md](../02-dominio.md) §8.4). El schema tiene un estado `VENCIDA` para eso, pero ningún código lo escribe. Cada partido sí tiene su `fechaLimite`: la de las zonas sale del cronograma de la fase de grupos, y la de los cuadros, del plazo por ronda contado desde el cierre de las zonas.

## Opciones consideradas

1. **Calcularlo en cada consulta:** vencido es pasar la `fechaLimite` sin resultado.
   - En contra: el estado `VENCIDA` del schema sigue sin usarse, y si la app algún día lo muestra tiene que hacer la misma cuenta.
2. **Una tarea que lo guarda**, como la que pasa el torneo a grupos en curso ([decisión 029](029-grupos-en-curso.md)): cada hora, los partidos sin resultado con el plazo vencido pasan a `VENCIDA`.
   - En contra: hasta una hora de atraso y una tarea más que mantener. Además, cargar el resultado de un vencido tiene que pisar ese estado, y extender el plazo tendría que volverlo atrás.

## Decisión

Opción 1. `situacionDelPartido()` en `apps/api/src/modules/competencia/tablero.ts`:

- **Jugado:** tiene resultado (jugado, W.O. o abandono), aunque se haya cargado tarde.
- **Esperando:** un partido de cuadro sin sus dos jugadores. Nunca vence: lo que lo frena es el partido anterior.
- **Vencido:** sin resultado y con la `fechaLimite` pasada. El día de la fecha límite todavía no venció. Un partido con fecha acordada que no se jugó a tiempo también vence.
- **Con fecha:** anotada o confirmada (F14) y dentro del plazo.
- **Sin coordinar:** el resto.

Los días se cuentan en Argentina, con `hoy()` de `lib/fechas.ts`, como el resto de los plazos.

## Por qué

- **Es la misma idea que las tablas y el ranking:** se calculan en cada consulta a partir de los datos, sin un valor guardado que se pueda desincronizar.
- **Está al día siempre**, sin esperar a ninguna tarea.
- **Cargar el resultado de un vencido no necesita lógica extra:** con resultado, deja de estar vencido.

## Qué se resigna

- **El estado `VENCIDA` del schema queda sin uso.** Si apareciera en un partido, se trata como uno sin resultado.
- **No se puede listar los vencidos con una consulta a la base** (`where estado = VENCIDA`): hay que leer los partidos y calcular. Para los partidos de un torneo, que son menos de cien, no pesa.
