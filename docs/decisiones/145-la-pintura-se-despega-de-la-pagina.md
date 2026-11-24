# 145 — La pintura se despega de la página

**Estado:** aceptada — 24 de noviembre de 2026. Reemplaza en parte a la [decisión 105](105-sistema-visual-ultima-luz.md): el velo oscuro arriba de la pintura del hero, y el color del cielo.

## Contexto

En el hero de la landing, la pintura del club enmarcada no se despegaba de la página. Medido sobre la pintura de la 105, las primeras 60 filas eran `#0B1221`, el mismo `noche-900` de la pared (relación de luminancia 1,00), y las siguientes no pasaban de 1,16. Arriba, además, un velo `noche-900` al 38 % oscurecía el cielo para que se leyera el titular. El marco solo se distinguía por un filete de 1 px.

La referencia fue el hero de Railway: página `#13111C`, cielo nocturno `#222B39` (relación 1,31), el titular blanco directo sobre el cielo y sin velo. Es de noche, y el marco se despega igual.

Como la pintura es código ([docs/pintura/](../pintura/README.md)), se pudo repintar con el mismo método y el mismo estilo.

## Opciones consideradas

1. **Cielo claro, de atardecer dorado, con el texto oscuro** sobre un velo claro.
   - En contra: en la maqueta, la bajada quedaba encima de los álamos y el alambrado y se leía mal. Arreglarlo pedía un velo que lavaba la pintura. Y deja de ser de noche, que es la idea de *Última luz*.
2. **Un paspartú claro** entre la pared y la pintura.
   - En contra: el cielo sigue oscuro, y queda como una foto enmarcada, anticuada.
3. **El texto afuera, sobre la pared, con la pintura dorada debajo.**
   - En contra: cambia la forma del hero, y la pintura aparece recién debajo del botón.
4. **Subir el cielo nocturno a un azul pizarra y sacar el velo**, como Railway.
   - En contra: la pintura cambia, y lo de abajo del horizonte no queda idéntico píxel a píxel. Algunas pasadas de lápiz dependen del color que tienen debajo, y al cambiar el cielo cambian los trazos, aunque se vea igual.

Se compararon las cuatro sobre la landing real, en la compu y en el celular.

## Decisión

Opción 4, elegida por el grupo.

- **El cielo de la pintura es un azul pizarra frío,** más claro que la pared: arriba, unas 1,4 veces su luminancia (`#262F45`), y más claro hacia el horizonte. Sigue siendo de noche, con estrellas, luna, reflectores y ventanas prendidas. Desde el horizonte para abajo la escena es la misma.
- **Detrás del titular, el cielo es tranquilo:** las nubes y el lápiz van más suaves, para que el titular blanco se lea sin velo, con más de 10:1.
- **Sin velo en la compu.** En el celular el texto baja hasta la cancha: un velo `noche-900` solo detrás de la bajada y el botón, transparente arriba para no tapar el borde.
- **Las imágenes tienen nombres nuevos** (`cancha-noche-*`), para que ningún navegador ni Cloudflare siga mostrando la vieja.
- **La vista previa de WhatsApp** ([decisión 144](144-vista-previa-del-link-del-torneo.md)) sale de la misma pintura.
- **El código de la pintura entra al repo,** en `docs/pintura/`, con cómo se exporta y un script que arma las imágenes de la web. La de la 105 queda al lado, como referencia.

## Por qué

- **El marco se despega por la pintura misma,** no por un adorno alrededor. Es de noche, como pide *Última luz*.
- **Es la que menos cambia el hero:** el mismo marco, el mismo titular, el mismo demo.
- **El titular se lee mejor que antes en la compu,** sin velo, porque el cielo detrás es tranquilo.
- **La pintura vivía solo en una carpeta temporal.** En el repo se puede volver a exportar y cambiar.

## Qué se resigna

- **La pintura de la 105 deja de usarse.** Queda en `docs/pintura/cancha-noche-v10.html`.
- **El cielo de abajo, a los costados, queda con menos textura** que en la original, y la arboleda del fondo, un poco más clara y brumosa.
- **En el celular sigue haciendo falta un velo,** aunque más corto.
- **Para exportar la pintura hace falta un navegador:** se abre con un servidorcito local y se exporta desde la consola. No hay un comando que la genere sola.
