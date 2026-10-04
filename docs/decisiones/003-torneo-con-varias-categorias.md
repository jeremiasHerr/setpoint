# 003 — Un torneo que se juega en varias categorías

**Estado:** aceptada — 3 de octubre de 2026

## Contexto

La convocatoria de POLENTA es una sola: "Torneo Primavera 26, Tercera y Segunda", con el mismo importe, formato y cronograma para las dos categorías. La pantalla *Nuevo torneo* ([nuevo-torneo.html](../pantallas/organizador/nuevo-torneo.html)) la carga en un único formulario, con las categorías como opciones a elegir.

Pero en el schema cada `Torneo` es de **una** categoría (`categoriaId` obligatorio). La v2 del schema eliminó `TorneoCategoria` a propósito: el sorteo, los partidos, las tablas y el ranking son siempre de una categoría, y así ninguna de esas consultas necesita un JOIN extra. Para agrupar las categorías de un mismo evento quedó la columna `Torneo.edicion`, con `@@unique([organizacionId, edicion, categoriaId])`.

Al implementar la creación de torneos (F04) había que decidir cómo se representa lo que la organización ve como un solo torneo.

## Opciones consideradas

1. **Una fila `Torneo` por categoría, agrupadas por `edicion`.** Es lo que el schema ya supone.
   - En contra: crear, editar y publicar tocan varias filas que tienen que quedar iguales. El cupo y el importe se repiten en cada una.
2. **Una entidad nueva (`Edicion` o `Convocatoria`) que agrupe los torneos**, con los datos compartidos en una sola fila.
   - En contra: obliga a una migración y a revisar cada consulta que hoy lee esos datos del `Torneo`. Es un modelo más para explicar en la defensa, para un agrupamiento que la columna `edicion` ya resuelve.

## Decisión

Opción 1. La API expone la **convocatoria** como recurso (`/api/organizaciones/:slug/torneos`) y por debajo la guarda como un `Torneo` por categoría:

- Todos los torneos de la convocatoria tienen los mismos valores, salvo `categoriaId` y `cupo`.
- `edicion` es el nombre de la convocatoria. Por eso el nombre no se puede repetir dentro de una organización (`NOMBRE_REPETIDO`).
- El `id` de la convocatoria es el del primer torneo (el de menor id), y es el que va en la URL. Al editar el borrador ese torneo se conserva aunque cambien las categorías, así el id no cambia.
- El cupo se define por categoría, como pide la convocatoria ([02-dominio.md](../02-dominio.md) §12). El formato es uno solo para todas.

## Por qué

- **No cambia el modelo de datos.** El schema ya fue corregido y entregado con este diseño, y todo lo que viene después (sorteo, resultados, cierre, ranking) trabaja sobre un torneo de una categoría.
- **La complejidad queda en un solo lugar.** Solo el módulo de torneos sabe que una convocatoria son varias filas. El resto del sistema ve torneos comunes.

## Qué se resigna

- **Formatos distintos por categoría** dentro de la misma convocatoria. Si Segunda quisiera jugar con 4 grupos y Tercera con 8, tendrían que ser dos convocatorias con nombres distintos.
- **Datos duplicados.** Los campos compartidos se repiten en cada fila. Se escriben siempre juntos, en una transacción, para que no queden distintos.
- **Cambiar categorías después de publicar.** En borrador, cambiar las categorías borra y recrea los torneos secundarios. Una vez que hay inscripciones eso ya no se puede hacer.
