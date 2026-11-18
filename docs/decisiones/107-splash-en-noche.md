# 107 — El splash de la app va en noche

**Estado:** aceptada — 18 de noviembre de 2026.

## Contexto

Al regenerar los íconos del APK con el dibujo de la [decisión 105](105-sistema-visual-ultima-luz.md), quedaba por definir el splash, la pantalla que aparece al abrir la app mientras cargan las fuentes. Con la [104](104-logo-marcas.md) era blanco, con el ícono adentro de su recuadro negro.

Desde Android 12, el sistema usa esa imagen como ícono animado y la recorta con un círculo de dos tercios de su tamaño. Un recuadro con esquinas puede quedar cortado.

## Opciones consideradas

1. **Noche, como el ícono:** fondo `noche-900` y las marcas sueltas, blancas con la levantada en `pelota`.
   - En contra: se pasa de una pantalla oscura a la app, que es clara.
2. **Niebla, como la app:** fondo `niebla` y las marcas en `noche` con la levantada en `lona`.
   - En contra: el ícono que se toca es oscuro y el splash, claro.
3. **Como hasta ahora, con el dibujo nuevo:** fondo blanco y el ícono en su recuadro.
   - En contra: Android 12 puede cortar las esquinas del recuadro, y el blanco no es el `niebla` de la app.

## Decisión

Opción 1, elegida por el grupo.

- **El fondo del splash y el del ícono adaptable son `noche-900`**, el mismo del ícono y de la pared de la landing.
- **La imagen son las marcas solas, sin recuadro**, centradas en un lienzo transparente y dentro del círculo de dos tercios: Android no les corta nada.
- **Los archivos** (`apps/mobile/assets/`) y los de `docs/logos/` tienen el dibujo de la 105. En los dos SVG de `docs/logos` con la palabra, "Setpoint" está en trazos de Funnel Display 600, como el logo de la web.

## Por qué

- **Del ícono al splash no hay corte:** se toca un cuadrado noche con las marcas y se abre una pantalla noche con las mismas marcas.
- **Las marcas sueltas no dependen de cómo recorte cada versión de Android.**
- **Es el logo en su versión sobre noche**, la misma que la barra de la landing; no hace falta una variante nueva.

## Qué se resigna

- **Un salto de oscuro a claro** al terminar el splash, cuando aparece la app en `niebla`.
- **Hay que generar otro APK** para que los íconos y el splash nuevos lleguen al celular ([decisión 036](036-apk-con-eas.md)).
