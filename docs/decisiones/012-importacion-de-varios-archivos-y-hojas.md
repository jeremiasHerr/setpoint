# 012 — La importación acepta varios archivos y varias hojas

**Estado:** aceptada — octubre de 2026. Surge de la devolución del 25% ([devolucion-25.md](../devolucion-25.md), cambio F). Pendiente de código, con una migración planificada.

## Contexto

Hoy la importación recibe un archivo, lee solo su primera hoja (`leerPlanilla`) y la carga en una categoría elegida a mano. POLENTA tiene un archivo por categoría; otros circuitos pueden tener un libro con una hoja por categoría, o un archivo por torneo del calendario. Con una subida por categoría, una organización con varias categorías repite el proceso, y una hoja que no es la primera se ignora sin aviso.

`ImportacionPadron` guarda en una fila el archivo, la respuesta cruda, la propuesta y los tokens.

## Opciones consideradas

1. **Unir todo en una sola llamada**: todas las hojas en un mismo mensaje.
   - En contra: el tope de unos 100 jugadores por respuesta ([06-ia.md](../06-ia.md) §1) se alcanza enseguida; un error en una hoja invalida todas; la auditoría pierde la referencia de qué fila es de qué hoja.
2. **Cada archivo y cada hoja por separado, en paralelo, dentro de un lote.** `ImportacionPadron` pasa a ser el lote, y una tabla nueva guarda cada archivo/hoja con su estado, respuesta cruda y tokens. La auditoría suma un control entre hojas.
   - En contra: una migración, y la confirmación pasa a trabajar sobre varias propuestas.
3. **Dejarlo como está** y pedir una subida por categoría.
   - En contra: no responde a la crítica de que la importación pide mucho trabajo, y la hoja ignorada sigue siendo un error silencioso.

## Decisión

Opción 2, con este alcance:

| Caso | ¿Se soporta? |
|---|---|
| Un archivo por categoría (POLENTA) | Sí |
| Un archivo con varias hojas, una por categoría | Sí |
| Un archivo por torneo del calendario, con el mismo jugador en varios archivos | **No en esta versión** |

- Cada archivo/hoja se procesa por separado y en paralelo, con su propia auditoría y su reintento.
- **Control entre hojas:** el mismo jugador en dos hojas va a revisión, porque un jugador está en una sola categoría.
- `ImportacionPadron` pasa a ser el lote; una tabla por archivo/hoja guarda estado, respuesta cruda y tokens. La migración queda planificada.
- Límites: hasta **10 archivos de 2 MB** por lote.

## Por qué

- **Cada hoja es una unidad auditable.** La auditoría verifica cada número contra su fila; separar por hoja mantiene esa referencia y el tope de tamaño por respuesta.
- **Una hoja que falla no frena a las otras**, y el tiempo total es el de la hoja más larga, no la suma.
- **La tabla por archivo/hoja conserva lo que hoy se guarda por importación** (respuesta cruda, tokens, intentos) para auditar después, sin meter varias respuestas en un mismo campo JSON.
- **El archivo por torneo del calendario queda afuera** porque obliga a unir al mismo jugador entre archivos *antes* de auditar, y ese cruce no tiene contra qué verificarse: es identidad pura, sin un número en una celda que la respalde. Es otro problema, y POLENTA no lo necesita.

## Qué se resigna

- **Una migración** en la parte del sistema que ya estaba cerrada para la entrega del 25%.
- **Simplicidad de la confirmación**, que pasa a juntar las decisiones de varias hojas en una transacción.
- **Los circuitos que guardan un archivo por torneo del calendario** tienen que unirlos antes de importar, o cargar una categoría por vez con una sola columna. Queda como limitación conocida.
