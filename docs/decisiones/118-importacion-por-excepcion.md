# 118 — La importación por excepción y cómo se deshace

**Estado:** aceptada — 20 de noviembre de 2026.

## Contexto

En la devolución del 25% (cambio C) se decidió que la importación de la planilla fuera automática por excepción: se importa solo lo que pasa todos los controles, y la organización revisa lo que falló o es dudoso ([06-ia.md](../06-ia.md) §1). Como lo seguro se aplica sin que nadie lo mire, la importación entera se tiene que poder deshacer.

Hasta ahora cada fila esperaba una decisión de la organización, y nada sabía de qué importación había salido: un movimiento `IMPORTACION_INICIAL` no se distinguía de los de otra subida, y un jugador creado por la importación no se distinguía de uno cargado a mano.

## Opciones consideradas

**Cómo sabe cada movimiento de qué importación salió:**

1. **Una columna `importacionId` en `MovimientoRanking`**, con migración.
2. **Guardar los ids de los movimientos creados en el `resumen` de la importación**, sin migración.
   - En contra: es una lista que puede quedar desincronizada con la base (un movimiento borrado o revertido sigue en la lista), y la relación no la ve nadie que lea el schema.

**Cómo sabe qué jugadores creó:**

1. **Una columna `importacionId` en `Jugador`**, en la misma migración.
2. **Deducirlo:** los que no tienen movimientos de otro origen ni inscripciones.
   - En contra: no distingue a un jugador cargado a mano, sin actividad, que la importación vinculó. Deshacer lo borraría.

## Decisión

Las dos columnas, elegidas por el grupo. Además, al implementarlo:

- **Qué es una fila segura** es una función pura con tests (`por-excepcion.ts`): sin problemas de auditoría, y coincide con el padrón con confianza alta o es nueva con un apellido que no está en el padrón. La revisión se recalcula al aplicar, porque el padrón pudo cambiar desde la subida.
- **Dos pasos en la API.** `aplicar` confirma lo que se crea en el circuito y aplica las filas seguras; `confirmar` aplica las decisiones sobre las filas a revisar. Si no hay nada que crear en el circuito, la subida aplica lo seguro sola. Con categorías o torneos del calendario nuevos, una hoja sin categoría o el ranking por encender, se pregunta una vez antes.
- **Encender el ranking también se pregunta.** Es un cambio en la configuración de la organización, no en un jugador, como crear un torneo del calendario.
- **Deshacer** borra los movimientos de la importación y los jugadores que creó, salvo los que ya tienen una cuenta, inscripciones, partidos o puntos de otro origen. Lo que se creó en el circuito queda, y el ranking no se apaga.
- Con algo aplicado, la importación ya no se descarta: se deshace.

## Por qué

- **La relación queda en el schema.** Una clave foránea no se desincroniza, y deshacer es un `deleteMany` por esa columna.
- **Deshacer solo toca lo que creó la importación.** Un jugador cargado a mano nunca tiene `importacionId`, así que no se borra aunque no tenga actividad.
- **El jugador con actividad no se borra**, porque borrarlo se llevaría sus inscripciones y sus partidos. Pierde los puntos importados, que es lo que se quiso deshacer.
- **Las categorías y los torneos del calendario no se borran** porque pueden tener torneos creados después. Quitarlos es una decisión de Tu circuito, que ya sabe hacerlo.

## Qué se resigna

- **Una migración más** a pocos días de la entrega.
- **Los jugadores con actividad quedan en el padrón** después de deshacer. Hay que darlos de baja a mano si sobran.
- **Una fila segura no se puede excluir antes de importarla.** Si la organización no quería importar algo seguro, deshace y vuelve a subir la planilla sin esa fila.
