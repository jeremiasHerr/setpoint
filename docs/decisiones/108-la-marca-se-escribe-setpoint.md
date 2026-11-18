# 108 — La marca se escribe Setpoint

**Estado:** aceptada — 18 de noviembre de 2026.

## Contexto

Con la landing de Última luz ([decisión 105](105-sistema-visual-ultima-luz.md)), la palabra del logo pasó a decir "Setpoint", con una sola mayúscula. El resto seguía diciendo "SetPoint": el título de la pestaña y la vista previa al compartir el link, el remitente y los asuntos de los emails, el nombre de la app debajo del ícono, los encabezados de la app y la documentación. Convivían dos grafías de la misma marca.

## Opciones consideradas

1. **"Setpoint" en todo:** producto, emails, app y documentación.
   - En contra: toca 33 archivos, y los documentos que ya se entregaron, como el del 25 %, decían "SetPoint".
2. **"Setpoint" solo en el producto**, y la documentación sigue con "SetPoint".
   - En contra: conviven dos grafías, y en la defensa el documento no coincide con la pantalla.
3. **Volver el logo a "SetPoint".**
   - En contra: vuelve la mayúscula del medio, que en Funnel Display se lee más como una marca técnica que como una palabra.

## Decisión

Opción 1, elegida por el grupo.

- **Se escribe "Setpoint" en todo texto:** la web (título y `og:title`), los emails (remitente, asuntos y cuerpo), la app (el nombre debajo del ícono y los encabezados), los comentarios del código y la documentación.
- **No cambian los nombres de cosas que existen afuera**, para que se puedan encontrar: el canvas *SetPoint — Verde pelota*, el canvas *Landing SetPoint* y el artifact *Cinco direcciones de SetPoint*.
- **No se reescriben los HTML de referencia de `docs/pantallas/`** ni las exploraciones de la [104](104-logo-marcas.md) en `docs/logos/`, como el resto de su sistema visual.
- **El dominio, los paquetes y las rutas no cambian:** ya eran en minúscula (`setpoint.com.ar`, `@setpoint/shared`).

## Por qué

- **Una sola grafía**, la del logo, en todo lo que se ve y en lo que se lee para la defensa.
- **"Setpoint" se lee como una palabra**, como el término del tenis, y no como dos pegadas.
- **El cambio es mecánico** y se revisa con una búsqueda: lo que queda con "SetPoint" son los nombres externos y las referencias viejas.

## Qué se resigna

- **Los documentos ya entregados dicen "SetPoint".** La próxima entrega dice "Setpoint".
- **El remitente de la versión publicada** sale de la variable `CORREO_REMITENTE` de Railway, que hay que cambiar a mano.
- **El nombre de la app debajo del ícono** cambia recién con el próximo APK.
