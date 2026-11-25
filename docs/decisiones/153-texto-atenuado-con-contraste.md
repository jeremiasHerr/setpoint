# 153 — El texto atenuado sobre fondos claros tiene su propio gris

**Estado:** aceptada — 25 de noviembre de 2026.

## Contexto

`pizarra-400` (`#9AA5B8`) da 2,49:1 sobre papel y se usaba como texto sobre fondos claros: el "le ganó a" de la página en vivo, los totales "/ 24" del inicio, las siembras del sorteo, los perdedores de las tablas, los ceros de la ficha. El proyecto pide contraste accesible (AA, 4,5:1 para texto). El mismo token es el texto de apoyo sobre noche, donde da 7,00:1 y se lee bien.

## Opciones consideradas

1. **Un token intermedio, `pizarra-450`,** para el texto atenuado sobre fondos claros.
   - En contra: un token más que mantener en dos archivos, y un criterio que recordar.
2. **Pasar a `pizarra-500` el texto sobre fondos claros.**
   - En contra: da 7,6:1 y queda cerca de `pizarra-700`; se pierde un escalón de jerarquía entre el texto de apoyo y el secundario.
3. **Oscurecer `pizarra-400`.**
   - En contra: sobre noche cae a cerca de 3,7:1 y rompe la franja del organizador, las tarjetas noche y las columnas del inicio.

## Decisión

Opción 1, elegida por el grupo.

- **`pizarra-450` es `#586275`:** 6,14:1 sobre papel, 5,63:1 sobre niebla y 4,77:1 sobre `cal`.
- **`pizarra-400` queda para texto sobre noche y para lo que no es texto:** bordes, puntos, íconos y estados deshabilitados.
- **La web ya lo aplica.** La app tiene 24 usos de `pizarra400`, varios dentro de tarjetas noche, y se revisan aparte: el token ya está en `tokens.ts` y los usos sobre fondos claros quedan pendientes.

## Por qué

- **Conserva los tres escalones de gris:** apoyo, secundario y principal siguen distinguiéndose.
- **No toca nada sobre noche,** que ya cumplía.
- **El valor sale del fondo más exigente:** `cal` pedía algo más oscuro que el `#677184` que se probó primero.

## Qué se resigna

- **Un token más, copiado en `index.css` y en `tokens.ts`** (decisión 034).
- **Un criterio que recordar:** "400 solo sobre noche". Nada impide usarlo mal en una pantalla nueva.
- **La app sigue con el contraste anterior** hasta revisar sus usos.
