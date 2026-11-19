# 114 — El botón principal lleva el texto en blanco, sobre lona-texto

**Estado:** aceptada — 19 de noviembre de 2026. Reemplaza, en el botón principal, el texto `noche-900` sobre `lona` de la [decisión 105](105-sistema-visual-ultima-luz.md).

## Contexto

El grupo pidió que "Crear mi circuito", el botón de la landing, llevara el texto en blanco, el mismo del logo "Setpoint" que está arriba sobre la pared oscura. El texto oscuro sobre el verde se veía apagado al lado del logo y del titular, los dos en blanco.

Blanco sobre `lona` (#62BB78) da 2,4:1. El mínimo para leer texto es 4,5:1, y por eso la 105 le había puesto texto `noche-900` (7,93:1).

El mismo verde con texto oscuro es el botón principal de todo el sistema: "Nuevo torneo" en el inicio, "Confirmar y publicar" en el sorteo, pagar en la inscripción y el botón del próximo partido en la app.

## Opciones consideradas

1. **Blanco sobre `lona-texto` (#1B6236), con borde `lona`.**
2. **Blanco sobre `lona`**, como se pidió.
   - En contra: 2,4:1 no pasa el mínimo de contraste, y al sol, en el celular, cuesta leerlo.
3. **Dejarlo como estaba**, con texto `noche-900`.
   - En contra: no responde a lo que se pidió.

Y, para el alcance: **solo la landing** o **todos los botones principales**.

## Decisión

Opción 1, en todos los botones principales. Las dos las eligió el grupo.

- **El botón principal es blanco sobre `lona-texto`**, con un borde de 1 px `lona`. Da 7,37:1.
- **Con el mouse se aclara** (brillo al 125 %, 5,3:1). Sale el token `lona-hover`, que ya no usa nadie.
- **Cambia en todos los lugares donde estaba:** la landing, el botón principal de la web, el sorteo en pantalla, el pago de la inscripción y, en la app, el botón principal, el del próximo partido y el de la zona. También el botón dibujado de la landing que muestra la app.
- **La lona como relleno de una marca** (el número en el pago, los casilleros del ranking de la app) sigue con texto `noche-900`. No es un botón.

## Por qué

- **El texto queda en el blanco del logo y se lee:** 7,37:1, el mismo contraste que `lona-texto` sobre papel. Es un token que ya existía.
- **Es un solo botón principal.** Si cambiaba solo en la landing, el "Nuevo torneo" del inicio sería otro botón con los mismos colores de antes.

## Qué se resigna

- **El verde del botón es más oscuro.** La lona clara queda para las marcas, el progreso y los bordes. Sobre las tarjetas noche de la app, el botón se distingue por su borde `lona` más que por el relleno.
- **La app cambia sin haberse probado en el celular**: hay que revisarla con Expo Go y generar un APK nuevo.
