# 141 — La importación lee PDF con texto y texto pegado; las imágenes quedan para después

**Estado:** aceptada — 23 de noviembre de 2026.

## Contexto

La devolución del 25% pidió más formatos en la importación (cambios G1 a G3 de [devolucion-25.md](../devolucion-25.md)): un PDF con texto, como los rankings exportados de Excel que nos pasó POLENTA; un ranking pegado como texto, copiado de WhatsApp o de la planilla; e imágenes. Hasta ahora solo se subían `.xlsx`, `.xls` y `.csv`.

La auditoría ([06-ia.md](../06-ia.md) §1, capa 4) verifica cada número contra su fila de la planilla. Para que valga con los formatos nuevos, cada fuente se convierte en las mismas filas numeradas que una planilla, y todo lo que viene después (el prompt, la auditoría, la importación por excepción, la revisión) no cambia.

Hay un caso que la planilla no tiene: **la celda vacía que no deja rastro.** En el Excel, un casillero vacío es una celda vacía. En un texto, "Ana 50 75 125" con tres torneos puede ser 50, 0, 75 o 50, 75, 0, y la suma da igual en los dos casos.

Quedaban tres decisiones: cómo se lee el PDF, cómo se pega el texto en la pantalla y qué formatos entran antes de la entrega.

## Opciones consideradas

**Cómo se lee el PDF**

1. **El texto con su posición (`unpdf`, que usa pdf.js),** y se rearma la tabla: cada renglón es una fila y cada número va a su columna.
   - En contra: es más código, y depende de cómo cada programa arma el PDF.
2. **El texto plano, línea por línea.**
   - En contra: un casillero vacío no se ve, y el modelo tendría que adivinar en qué torneo va cada número.
3. **El PDF entero al modelo, auditando contra el texto extraído.**
   - En contra: se pagan los tokens de imagen de cada página y se lee dos veces.

**Cómo se pega el texto**

1. **Dos opciones en la misma tarjeta, "Subir archivos" y "Pegar el texto".**
2. **Un cuadro de texto debajo de los archivos, en el mismo lote.**
   - En contra: el formulario queda más cargado para el caso de siempre, que es un archivo.

**Alcance**

1. **PDF con texto y texto pegado ahora; imágenes y PDF escaneados después.**
2. **Los tres juntos.**
   - En contra: las imágenes cambian el contrato de confianza (no hay texto contra el cual auditar) y suman una llamada con imagen y otro caso en la revisión, a una semana de la entrega.

## Decisión

Opción 1 en las tres, elegida por el grupo.

- **El PDF se lee con la posición de cada texto.** Los números van a su columna, y en un renglón con números la columna sin número queda como celda vacía, igual que en el Excel. Los textos van en orden, sin columna: en un PDF exportado de Excel un nombre largo o un encabezado se desborda sobre la celda de al lado. El ranking de Tercera exportado desde Excel se lee con las mismas celdas que la planilla (test `leer-formatos`).
- **Un PDF sin texto es un PDF escaneado,** y se rechaza con el motivo: "subí el Excel o pegá el ranking como texto".
- **El texto pegado se separa en celdas** por tabulación (lo que se copia de una planilla, que conserva las celdas vacías), por "|", por dos espacios o más, o, escrito a mano, con cada número como una celda. Las líneas se numeran como las ve la persona, contando las vacías.
- **Una línea con menos números que casilleros y acumulado, y sin celdas vacías, va a revisión** con el motivo "revisá en qué torneo va cada uno". Es un control de la auditoría, no del modelo.
- **El texto pegado es un archivo más del lote,** llamado "Texto pegado", con una sola hoja. La API lo recibe en el campo `texto`, hasta 50.000 caracteres.
- **Prompt `importacion-v2.2`:** la planilla puede venir de un PDF o de un texto, y un número de puesto al principio de la línea no es un casillero.

## Por qué

- **La auditoría sigue verificando cada número contra su origen.** Es lo que permite importar solo lo seguro ([decisión 118](118-importacion-por-excepcion.md)), y con el PDF y el texto se mantiene sin cambiar ningún control.
- **Con la posición, el PDF tiene el mismo nivel de confianza que el Excel.** Con el texto plano, una fila con un casillero vacío no se podría verificar, y en el ranking real de POLENTA hay muchos.
- **Mandar a revisión la línea ambigua es más barato que equivocarse.** Una fila mal importada sin revisión es peor que una fila de más en revisión (06-ia §1, Eval).

## Qué se resigna

- **Las imágenes y los PDF escaneados no se importan.** Quedan como estaban en 06-ia: el modelo lee la imagen y todas las filas pasan por revisión.
- **Un PDF que no sale de una planilla** (una tabla dibujada a mano, columnas que no se alinean) puede no leerse bien. Se probó con el PDF que exporta Excel.
- **`unpdf` solo publica ESM** y la API compila como CommonJS: sus tipos se declaran a mano en `importacion/unpdf.d.ts`, solo lo que se usa.
- **Un ranking pegado sin columnas y con casilleros vacíos** manda esas líneas a revisión, aunque el modelo las haya ubicado bien.
