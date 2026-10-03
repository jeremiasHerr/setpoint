# 001 — Dónde se calcula el ranking

**Estado:** aceptada — 3 de octubre de 2026

## Contexto

El ranking no se guarda: se deriva de `MovimientoRanking` tomando, por cada casillero de etapa, el movimiento más reciente, y sumando los casilleros ([02-dominio.md](../02-dominio.md) §7). El padrón (F02) es la primera pantalla que necesita los puntos y el puesto de cada jugador, y después lo van a usar el ranking público (F09), el sorteo (F05), el cierre de torneo (F16) y las proyecciones (F20).

Había que decidir en qué capa vive ese cálculo.

## Opciones consideradas

1. **Función pura en TypeScript.** Prisma trae los movimientos de la organización y una función sin acceso a la base resuelve el reemplazo y la suma.
   - En contra: trae todos los movimientos a memoria en cada consulta.
2. **Consulta SQL con `DISTINCT ON`**, la de referencia de las notas de [schema.sql](../schema.sql), ejecutada con `$queryRaw`.
   - En contra: SQL crudo fuera de Prisma y sin tipos. Los tests necesitan un Postgres levantado, y las proyecciones de F20 no la pueden reutilizar porque trabajan sobre movimientos que todavía no existen.
3. **Columna de puntos guardada en `Jugador`**, actualizada al cerrar cada torneo.
   - En contra: es el valor mutable que 02-dominio §7.3 descarta, porque puede quedar desincronizado de los movimientos. Además obliga a una migración.

## Decisión

Opción 1. El cálculo vive en `apps/api/src/modules/ranking/ranking.ts`, como dos funciones puras:

- `puntosVigentes(movimientos)` — puntos de cada jugador, por casillero con reemplazo.
- `asignarPuestos(puntos)` — puesto de cada jugador; los empatados comparten puesto.

Quien las llama es responsable de pasarles los movimientos de **una sola categoría**.

## Por qué

- **Se testea sin base de datos.** Los tests reproducen los acumulados reales de Tercera 2026 (165, 110, 100) y los casos borde del reemplazo, y corren en milisegundos.
- **F20 la reutiliza tal cual:** proyectar "si llegás a semis" es agregar un movimiento hipotético a la lista y volver a llamar a la función.
- **El volumen no lo justifica todavía.** POLENTA tiene 77 jugadores y 5 etapas: unos cientos de movimientos por año.
- Es el mismo criterio que [08-repositorio.md](../08-repositorio.md) fija para `competencia/`: lógica pura, que recibe datos y devuelve resultados.

## Qué se resigna

- **Eficiencia con padrones grandes.** Con miles de jugadores o muchos años de historial habría que filtrar los movimientos en la consulta o pasar a la opción 2. La firma de las funciones no cambiaría.
- **La ventana de 12 meses no se aplica.** La consulta de referencia de `schema.sql` además descarta movimientos de más de 12 meses; `ranking.ts` no lo hace, y `Organizacion.ventanaRankingMeses` queda sin uso. Se sigue a 02-dominio §7.2, que es la fuente de autoridad y define el ranking como reemplazo por casillero, "no una suma rodante". Consecuencia: los puntos de una etapa que deja de jugarse no vencen solos.
- **Los ajustes manuales** (movimientos sin etapa) se suman todos, sin reemplazo entre ellos. Todavía ninguna funcionalidad los crea.

## Tests

Se incorpora **Vitest** como runner de la API (`npm test`). Se eligió sobre `node:test` porque corre TypeScript sin configuración, tiene modo watch y es el mismo que usaría la web con Vite; a cambio suma una dependencia de desarrollo. Los tests viven en `apps/api/tests/`, espejando los módulos.
