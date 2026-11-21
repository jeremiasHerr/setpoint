# 125 — El aviso de pocos inscriptos es no llegar a las zonas

**Estado:** aceptada — 21 de noviembre de 2026.

## Contexto

El inicio del organizador tenía previsto un aviso para la inscripción que viene floja ("Primavera 26 tiene 5 de 32 inscriptos y cierra en 2 días"), pero no se calculaba: la decisión 080 lo dejó para otro PR porque la regla de "pocos inscriptos" no estaba escrita. La pantalla de referencia no lo dibuja.

Lo que sí está escrito es el piso: con menos de 3 pagos por zona no se puede cerrar la inscripción, porque la categoría quedaría sin poder sortearse (decisión 025). Hoy la organización se entera recién al tocar "Cerrar inscripción".

## Opciones consideradas

1. **No alcanzan para las zonas:** los que pagaron no llegan a 3 por zona, y faltan 3 días o menos para el cierre.
   - En contra: la API tiene que mandar en el listado cuántos hacen falta.
2. **Menos de la mitad del cupo,** con la misma ventana de 3 días.
   - En contra: la mitad es un número inventado. Con 20 de 32 no avisa, aunque sobren zonas.
3. **Cualquier lugar libre,** con la misma ventana.
   - En contra: avisaría casi siempre, y un aviso que aparece siempre se deja de leer.

## Decisión

Opción 1, elegida por el grupo.

- **La API manda los dos datos:** en cada categoría, `minimoParaSortear` (la cantidad de zonas por 3, la misma cuenta que bloquea el cierre), y en cada convocatoria, `diasParaElCierre`, contado en Argentina. La web arma el aviso con esos dos datos.
- **Se avisa faltando 3 días o menos,** cierre del día incluido. Antes todavía hay tiempo de que se anoten. Con la fecha ya pasada no se avisa: la inscripción sigue abierta hasta que la organización la cierra, y ahí es el cierre el que lo dice.
- **No va en "Necesita tu atención".** Ese bloque es rojo, y en el sistema el rojo solo significa vencimiento (design.md). El aviso va en un bloque propio, "Faltan inscriptos para sortear", con borde de 1 px y el punto noche de las vinculaciones para revisar.
- **La acción es "Copiar link":** el de la inscripción del torneo, para volver a mandarlo al grupo.

## Por qué

- **Avisa antes del problema que ya existe:** es la misma regla que después bloquea el cierre, no un umbral nuevo para discutir.
- **No hace falta configurar nada:** sale del formato que ya tiene cada torneo.

## Qué se resigna

- **Una inscripción floja pero suficiente no se avisa:** 7 de 32 con 2 zonas alcanza para sortear, aunque el cuadro quede chico.
- **Los 3 días son fijos,** sin campo en *Nuevo torneo*.
