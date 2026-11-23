# Diseño

Sistema visual de Setpoint: **Última luz** ([decisión 105](decisiones/105-sistema-visual-ultima-luz.md)). Esta es la fuente de verdad para todo lo que se dibuje en la web y en la app: si algo no está acá, se resuelve con los tokens y componentes que sí están, no inventando uno nuevo.

El sistema está dibujado en el artifact **Última luz v2** (la landing, el Tablero, Cargar resultado y Cuándo juego). Las pantallas de referencia de cada flujo están en [pantallas/](pantallas/README.md) y en el canvas **SetPoint — Verde pelota**, con el sistema anterior: de ahí se toma la estructura de cada pantalla, no los colores.

---

## 1. Los dos contextos de uso

Todo el sistema sale de que hay dos personas usando esto en situaciones opuestas.

| | Organizador | Jugador |
|---|---|---|
| Dónde | Escritorio | Celular |
| Cuándo | Sentado, con tiempo, muchas veces de noche | Parado afuera del club, al sol, antes de jugar |
| Qué necesita | Densidad y escaneo: 78 partidos, 8 zonas, tablas | Una sola cosa por pantalla, tipografía grande, contraste alto |
| Trabajo principal | "Qué partidos faltan y a quién apurar" | "Cuándo juego, contra quién y dónde" |

**Es el mismo sistema con dos densidades, no dos diseños.** Los mismos colores, la misma tipografía, los mismos componentes; cambian las escalas.

---

## 2. Principios

1. **La atmósfera vive en un solo lugar.** El club al atardecer, pintado y enmarcado, está en el hero de la landing y en ningún otro lado. El producto es claro, sobrio y denso: fondo blanco (`papel`) en las pantallas del organizador y niebla en las públicas, tarjetas papel, bordes de 1px.
2. **El color dice un estado, no decora.** La lona es lo ganado, lo que clasifica y lo que se cobra. El azul es "con fecha" y "en curso", el amarillo "en preparación", el rojo "vencido", el ámbar y el petróleo los dos cuadros. La pelota es solo el logo. La acción no lleva color: el botón principal va en tinta, en el noche de la barra. Si un color aparece por adorno, algo está mal.
3. **Un objeto gráfico, repetido.** La barra de marcas es la misma en el tablero, en la landing, en el inicio y en el cupo de inscripciones, y es también el logo. La matriz de zona es la misma para el jugador y para el organizador. Nadie tiene que aprender dos lenguajes.
4. **El número se lee antes que la etiqueta.** Todo dato numérico va en mono y con más peso visual que su rótulo.
5. **Decir qué va a pasar antes de que pase.** Antes de guardar un resultado, la pantalla dice quién queda primero y quién va al cuadro consuelo. Antes de pagar, dice que el lugar se reserva 15 minutos.
6. **Bordes, no sombras.** En el producto, la jerarquía la dan el borde de 1px, la superficie noche y el espacio. La única sombra del sistema es la del demo de la landing, que se apoya sobre la pintura.
7. **Sentence case siempre.** Ni títulos ni botones ni etiquetas en mayúsculas. Los rótulos chicos (`pg`, `sets`, `zona D`) van en minúscula, en Instrument Sans 12,5 px, peso 500, `noche`; el mono es solo para cifras ([decisión 123](decisiones/123-inicio-en-noche-y-rotulos-sin-mono.md)).

---

## 3. Color

### Tokens

| Token | Hex | Para qué |
|---|---|---|
| `noche-900` | `#0B1220` | El fondo de la landing, la barra del organizador, el botón principal y el ícono de la app |
| `noche` | `#101A2C` | Texto principal, tarjeta noche |
| `noche-2` | `#1A2740` | Ítem activo de la navegación y celdas sobre noche |
| `borde-noche` | `#2E3D5A` | Bordes y separadores sobre noche |
| `pizarra-700` | `#3B4659` | Texto secundario sobre papel |
| `pizarra-500` | `#4A5468` | Rótulos, texto de apoyo, marca punteada |
| `pizarra-400` | `#9AA5B8` | Texto sobre noche, datos apagados, perdedor en una tabla |
| `borde-campo` | `#878FA1` | Borde de campo de formulario y de las celdas de la grilla de sets |
| `linea` | `#D8DCE5` | Borde de tarjeta y separador |
| `linea-suave` | `#ECEEF3` | Separador entre filas de tabla, hover del secundario |
| `niebla` | `#F4F5F8` | Fondo de las páginas públicas, encabezado de tabla, pie de tarjeta |
| `papel` | `#FFFFFF` | Tarjetas, tablas, campos y botones secundarios. El texto sobre noche es blanco, el mismo valor |
| `cal` | `#E9E2D6` | Texto de la bajada sobre la pintura y sobre `noche-900` |
| `lona` | `#62BB78` | Relleno de progreso y marcadores sobre noche |
| `lona-borde` | `#93D2A3` | Anillo del partido elegido |
| `lona-fondo` | `#E4F8E7` | Celda ganada, chip "nueva", fila tuya |
| `lona-texto` | `#1B6236` | La lona como texto o punto sobre papel: clasifica, pagada, ganador; interruptor prendido |
| `pelota` | `#CDF546` | **Solo** la barra levantada del logo sobre noche, el punto de la marca del circuito y una pelota dibujada |
| `azul` | `#3567D6` | Marca "con fecha" o "en curso" |
| `azul-texto` | `#2A55BC` | Chip de fecha |
| `azul-fondo` | `#E5EDFE` | Fondo del chip de fecha, columna En juego |
| `azul-borde` | `#8DAAEC` | Borde de la columna En juego |
| `amarillo` | `#B7801F` | Marca de "en preparación" |
| `amarillo-fondo` | `#FDF7E6` | Sin uso en el inicio desde la decisión 123 |
| `amarillo-borde` | `#E6CF94` | Su borde |
| `amarillo-claro` | `#D9A441` | Marca de la columna En preparación, sobre noche |
| `azul-claro` | `#6F97F0` | Marca de la columna En juego, sobre noche |
| `rojo` | `#E5484D` | Solo vencimientos. Marcas y rellenos |
| `rojo-texto` | `#C62A2F` | El mismo rojo para texto (el otro no llega a 4.5:1) |
| `rojo-fondo` | `#FEF6F6` | Fondo de fila o tarjeta vencida |
| `rojo-linea` | `#F3D3D4` | Borde de lo anterior |
| `ambar` | `#8F5200` | Chip del cuadro principal |
| `ambar-fondo` | `#FDF3E3` | Su fondo |
| `petroleo` | `#0F6170` | Chip del cuadro consuelo |
| `petroleo-fondo` | `#E5F4F6` | Su fondo |

### Reglas

- **La pelota no es el acento.** Sobre papel no se ve (1,2:1) y sobre el cielo de la pintura peleaba con todo. Queda para el logo y para una pelota dibujada.
- **La lona tiene dos caras.** Como relleno de una marca (`lona`) lleva texto `noche-900` encima (7,93:1). Como texto o punto sobre papel va `lona-texto` (7,38:1). Sobre noche, un punto o una barra van en `lona`.
- **El botón principal es `noche-900` con texto blanco** (18,72:1), el mismo noche de la barra: el color queda para los estados. Sobre una superficie noche va dado vuelta, `papel` con texto `noche-900` ([decisión 115](decisiones/115-boton-principal-noche.md)).
- **Las columnas del inicio son recuadros `noche`** de radio 20, con las tarjetas de los torneos en `papel` adentro, sobre el fondo blanco de la página. El estado lo dice la marca de 9 px del título: En preparación en `amarillo-claro` (punteada), Inscripción en `lona`, En juego en `azul-claro` y Terminados en `pizarra-400`. Sobre noche van en blanco el título, la columna vacía y "Armar el próximo torneo"; la ayuda va en `pizarra-400` y el contador es una píldora `noche-2` con borde `borde-noche` ([decisión 123](decisiones/123-inicio-en-noche-y-rotulos-sin-mono.md)).
- **El rojo solo significa vencimiento.** No se usa para "error de formulario" ni para eliminar. Un partido que venció sin jugarse es lo único urgente del sistema.
- **La derrota se dibuja en pizarra, no en rojo.** En tablas y matrices, el ganador va en `noche` con peso 600 y el perdedor en `pizarra-400`.
- **Sobre noche, los números van en blanco.** El lima de antes sobre las tarjetas oscuras pasa a blanco: la fecha del próximo partido, los puntos propios, la conciliación.
- **Contrastes verificados:** `noche` sobre `niebla` 15,97:1 y sobre papel 17,41:1. `pizarra-500` sobre papel 7,61:1. `amarillo-claro`, `lona`, `azul-claro` y `pizarra-400` sobre noche, 6,9:1, 7,2:1, 5,3:1 y 7,00:1. `pizarra-400` sobre noche 7,00:1. Blanco sobre `noche-2` 14,91:1. `cal` sobre `noche-900` 14,55:1. `azul-texto` sobre `azul-fondo` 5,72:1. `rojo-texto` sobre `rojo-fondo` 5,23:1. `ambar` y `petroleo` sobre sus fondos, 5,66:1 y 6,28:1. `borde-campo` sobre papel 3,2:1, el mínimo para el borde de un control.

---

## 4. Tipografía

Cuatro familias, de Google Fonts, cada una con un solo rol:

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Funnel+Display:wght@600&family=Newsreader:opsz,wght@6..72,500&display=swap" rel="stylesheet">
```

- **Funnel Display 600** (`font-display`) — títulos de página del producto y de la landing, el nombre del rival en la tarjeta del próximo partido, el partido que se está cargando. Tracking −0.02em.
- **Newsreader 500** (`font-serif`) — **solo el titular del hero de la landing**, con `opsz` 72 y tracking −0.028em. Es la única frase que vende una emoción; en el producto parecía el título de un documento.
- **Instrument Sans** (`font-sans`) — interfaz, nombres, títulos de sección, copy. Pesos 400 / 500 / 600.
- **Geist Mono** (`font-mono`) — **solo cifras**: marcadores, puntos, plazos, horarios, importes, fechas cortas, contadores y códigos. Los rótulos, metadatos, migas, chips y encabezados de tabla son texto y van en Instrument Sans 12,5 px, peso 500, `noche`; un metadato secundario de una fila va en `pizarra-500`, 13 px, peso 400 ([decisión 123](decisiones/123-inicio-en-noche-y-rotulos-sin-mono.md)). Siempre con `font-variant-numeric: tabular-nums`.

```css
.mono {
  font-family: "Geist Mono", ui-monospace, "SF Mono", Consolas, monospace;
  font-variant-numeric: tabular-nums;
}
```

El mono es lo que da el acabado de producto y lo que hace que las tablas queden alineadas sin trabajo extra.

### Escala móvil (390 de ancho)

| Uso | Tamaño | Familia y peso | Tracking |
|---|---|---|---|
| Título de pantalla | 26–30 | Display 600 | −0.02em |
| Nombre del rival | 34 | Display 600 | −0.02em |
| Título de sección | 20 | Sans 600 | −0.01em |
| Dato principal (nombre en lista) | 17–19 | Sans 500 | — |
| Cuerpo | 16–17 | Sans 400 | — |
| Rótulo | 15 | Sans 500 | — |
| Mono grande (puntos, marcador, fecha) | 24–52 | Mono 500 | −0.02 a −0.04em |
| Mono chico (fecha, zona, rótulo de casillero) | 15 | Mono 400/500 | — |

**Piso duro: 15px.** Ningún texto baja de ahí en móvil, y los datos van de 17 para arriba. Las pantallas de referencia del jugador tienen rótulos de 10 a 14: al implementarlas suben a 15. Si algo no entra, se reorganiza, como los casilleros del ranking, que van sin el año.

### Escala escritorio (1280)

| Uso | Tamaño | Familia y peso |
|---|---|---|
| Título de página | 28 | Display 600 |
| Título de sección | 15–20 | Sans 600 |
| Fila de tabla | 14–15 | Sans 400/500/600 |
| Rótulo de columna | 12,5 | Sans 500, `noche` |
| Cuerpo / ayuda | 13–15 | Sans 400 |

### Landing

| Uso | Tamaño | Familia y peso |
|---|---|---|
| Titular del hero | 36 en el celular, hasta 68 | Serif 500 |
| Bajada del hero | 16–19, en `cal` | Sans 400 |
| Título de sección | 30–40 | Display 600 |

---

## 5. Medidas

| | Móvil | Escritorio |
|---|---|---|
| Alto de toque / botón principal | **56** | 40–48 |
| Botón secundario | 52 | 32–40 |
| Alto de fila de lista | 52–60 | 38 (denso) / 52–64 (con acción) |
| Padding lateral de pantalla | 16–18 | 28 |
| Separación entre bloques | 16–22 | 16–24 |

**Radios:** 999 para las píldoras de estado (`--r-chip`) · **8** para botones, campos y chips de filtro (`rounded-control`) · **12** para tarjetas y tablas (`rounded-tarjeta`) · **20** para la tarjeta noche, el modal y el marco del hero (`rounded-superficie`).

**Bordes:** 1px `linea` por defecto. 2px `noche` para el campo enfocado y para el partido destacado. En el producto nunca hay sombras.

---

## 6. Componentes

### Logo

Las marcas de una zona: tres barras de partido jugado y la cuarta, levantada, que es el set point ([decisión 104](decisiones/104-logo-marcas.md), con el dibujo de la [105](decisiones/105-sistema-visual-ultima-luz.md)). Al lado, "Setpoint" en Display 600 con tracking −0.02em. Así se escribe la marca en todo texto, con una sola mayúscula ([decisión 108](decisiones/108-la-marca-se-escribe-setpoint.md)). El ícono es un poco más alto que las mayúsculas (1,1em): 18px de texto en el producto y 24 en la landing.

- **Sobre noche:** las barras en blanco y la levantada en `pelota`.
- **Sobre claro:** las barras en `noche` y la levantada en `lona`, porque la pelota no se ve sobre papel.
- **Ícono** (favicon, app): un cuadrado `noche-900` con radio 14/64 y la marca adentro, con la versión sobre noche. En el ícono adaptable de Android la marca va a dos tercios, por el recorte del sistema.
- **Splash de la app:** fondo `noche-900` y la marca sola, sin recuadro, en la versión sobre noche ([decisión 107](decisiones/107-splash-en-noche.md)).
- **Al pasar el mouse**, el set point recorre la zona: el acento arranca en la primera barra, la levanta y pasa a la siguiente, hasta volver a la última, en un segundo. Corre completa aunque el mouse se vaya enseguida, y no vuelve a arrancar hasta terminar. Responde a una acción, como toda animación fuera del demo de la landing, y con "reducir movimiento" no se mueve.

En la app es el mismo dibujo, con cuatro `View` para no sumar `react-native-svg` por un logo, y sin la palabra: va al lado del nombre del circuito. La marca de la organización en las páginas públicas de la web es otra cosa: un cuadrado `noche` con un punto `pelota`, al lado de su nombre.

### Encabezado del organizador

Franja `noche-900` de 56 de alto, el mismo noche que rodea la landing: el logo, la organización en `pizarra-400` y, a la derecha, el menú. Debajo va el fondo blanco de la página, con el bloque del circuito del inicio y la franja del torneo sin bandas propias ([decisión 123](decisiones/123-inicio-en-noche-y-rotulos-sin-mono.md)); lo oscuro del inicio son las columnas. Ítem activo con fondo `noche-2` y texto blanco; los demás en `pizarra-400`, blancos con el mouse encima.

**Debajo de 768 px** no entra en una fila: el menú, las iniciales y Salir van en un panel que abre el botón "Menú" ([decisión 109](decisiones/109-menu-del-organizador-en-el-celular.md)). El panel baja en `noche-900`, con las secciones en filas de 48 y, abajo, las iniciales con el nombre completo de la organización y Salir. Detrás va el velo del modal de confirmación, y se cierra con Escape, tocando el velo o al elegir una sección.

### Botones

| Variante | Fondo | Texto | Cuándo |
|---|---|---|---|
| Principal | `noche-900` | blanco | La acción principal de cada lugar, del jugador o del organizador: pagar, escribirle al rival, guardar, publicar, cargar resultado |
| Principal sobre noche | `papel` | `noche-900` | La misma acción sobre una superficie noche: "Crear mi circuito" en la landing, el sorteo en pantalla y las tarjetas noche de la app |
| Secundario | `papel` + borde 1px `linea` | `noche` | Todo lo demás |
| Sobre noche | transparente + borde `borde-noche` | blanco | Acción alternativa dentro de una tarjeta noche |

Nunca hay flechas pegadas al texto del botón. El texto dice la acción completa: "Anotar y avisarle a Pablo", no "Continuar".

**Estados en la web.** Con el mouse, el principal pasa a `pizarra-700` (9,52:1), el principal sobre noche y el secundario toman `linea-suave`. Al apretar, el botón se achica apenas. Con el teclado, un anillo `noche` de 2px separado 2px del borde: es un outline, no una sombra. Deshabilitado, opacidad 40% y sin reacción.

### Chips

Dos objetos distintos:

- **Chip de filtro u opción** (zona A, Campeonato, "Fue walkover"): rectángulo de radio 8 y alto 34, borde 1px `linea`, fondo `papel`, texto `pizarra-700`. Activo: fondo `noche`, texto blanco 600; el número que lleva al lado va en mono.
- **Píldora de estado** (radio 999, alto 24, 12; la fecha en mono): `sáb 21 · 10:00` en `azul-fondo` con `azul-texto`; `sin fecha` con un contorno punteado 1,5px `pizarra-500`; `principal` en `ambar-fondo` con `ambar`; `consuelo` en `petroleo-fondo` con `petroleo`.

### Pestañas del torneo

Solo en la franja de las pantallas de un torneo, debajo del encabezado del organizador ([decisión 095](decisiones/095-navegacion-del-torneo.md)). La franja va sobre el fondo blanco de la página, con borde inferior `linea`. Texto de 15, alto 40–44. Activa: `noche`, peso 600 y subrayado de 2px `noche`. Disponible: `pizarra-700`, peso 500. Apagada: `pizarra-400`, y al tocarla, una línea debajo de la franja dice por qué. Son distintas de los chips a propósito: los chips filtran dentro de una pantalla (Confirmados, Reservando), las pestañas cambian de pantalla.

**En el celular**, debajo de 640, las cinco no entran en una fila y van en una grilla de tres columnas: Inscripciones, Zonas y Tablero arriba; Resultados y Cierre abajo ([decisión 110](decisiones/110-pestanas-del-torneo-en-el-celular.md)). Cada pestaña ocupa su celda, sin margen, y la fila de arriba lleva una línea de base `linea-suave`.

### Migas de pan

En las pantallas internas de la organización, las que no están en el menú: las del torneo, *Editar el torneo* e *Importar planilla* y *Revisar vinculación* en el padrón ([decisión 100](decisiones/100-migas-de-pan.md)). Una línea arriba del título: los niveles de arriba como links `pizarra-500` (`noche` al pasar), separados por el chevron del set en `pizarra-400`, y el último, donde se está, sin link en `pizarra-700`. Texto de 14; en la franja del torneo, la última miga es el nombre del torneo en `noche` con peso 500. Cada miga lleva siempre al mismo lugar, nunca "atrás" en el historial.

### Campos

Alto 56 en móvil y 48 en escritorio, radio 8, fondo `papel`, borde 1px `borde-campo`. El campo activo lleva borde 2px `noche`. El valor va en mono si es un número. La grilla de sets de *Cargar resultado* usa el mismo campo, de 56 de alto, con el número en mono 22.

### Interruptor

40×24, bolita de 18 en `papel`. **Prendido:** fondo `lona-texto`. **Apagado:** fondo `pizarra-400`. Los dos estados se distinguen de un vistazo sobre papel y sobre niebla, por color y por la posición de la bolita.

### Tarjeta noche

Fondo `noche`, radio 20, padding 20–22, texto blanco y rótulos en `pizarra-400`. Es el recurso de jerarquía más fuerte del sistema y se usa para **una sola cosa por pantalla**: el próximo partido, el ranking propio, la conciliación, el resumen del torneo. En la tarjeta del próximo partido, el rival va en Display 34, la fecha en mono 26 blanco y el botón principal.

### Barra de marcas

El objeto gráfico central del sistema. Una fila de rectángulos de 2–3px de radio y 18–44 de alto, uno por unidad real (un partido, un lugar del cupo), agrupados con `gap: 3px` y separados en bloques con `gap: 18–20px` cuando hay agrupación.

| Estado | Marca | En el tablero | En las inscripciones |
|---|---|---|---|
| Hecho | `noche` | Jugado | Pagado |
| En curso | `azul` | Con fecha | Reservando |
| Pendiente | contorno punteado 1,5px `pizarra-500` | Sin coordinar | Libre |
| Vencido | `rojo` | Vencido | — |

Un partido de cuadro que espera a los ganadores de la ronda anterior va lleno en `linea`: todavía no tiene estado. Las cuatro clases salen de un solo lugar en el código (`components/marcas.ts`).

Aparece en el tablero (48 partidos en 8 bloques de 6, con la letra de zona debajo y la cuenta `4/6` en mono, y los jugados sobre el total, `32 / 48`, en el encabezado de su tarjeta: [decisión 106](decisiones/106-tablero-sin-panel-del-plazo.md)), en el inicio, en inscripciones (32 lugares) y en la landing. **Es siempre el mismo objeto**, y el logo es una zona de esa barra.

### Matriz de zona

La fase de grupos como todos contra todos. Fila = el jugador, columna = el rival.

- Ganó: fondo `lona-fondo`, marcador en peso 600
- Perdió: marcador en `pizarra-400`
- Con fecha: la fecha corta en mono `pizarra-500`
- Sin coordinar: recuadro punteado 1,5px `pizarra-500`, vacío
- Diagonal: `linea-suave`, sin contenido

En escritorio se le suman columnas de `pg`, `sets` y `games` a la derecha. En móvil se muestra sola y las posiciones van abajo.

### Tabla de posiciones

Fila de 52–60. Punto de 7px a la izquierda del nombre: `lona-texto` si clasifica, `linea` si no. La línea de corte es una regla de 1px `noche` con el texto centrado encima. Debajo de la tabla, **el desempate explicado en palabras**: "Bustos y Ledesma están igualados en partidos y sets. Desempata games ganados: 23 contra 17."

### Cuadro eliminatorio

Columnas por ronda con rótulo en minúscula. Tarjeta de 190×62 con dos filas de 31; el ganador con fondo `lona-fondo` y peso 600. **En las tarjetas va el resultado en sets (2-0, 2-1), no el marcador completo**: es lo que hace legible un cuadro de 16. Las llaves se dibujan con codos de 1px `linea`. La final pendiente del cuadro principal lleva borde 2px `noche` y una franja `lona-fondo` con la fecha y la hora en `lona-texto`; la del consuelo, borde `borde-campo` y franja `linea-suave`. El partido elegido en *Cargar resultado* suma un anillo de 2–3px `lona-borde`. Donde hubo un bye no hay partido: el lugar lleva una tarjeta del mismo alto, sin fondo, con el apellido de quien pasa directo en `pizarra-500` y el rótulo "pasa directo a semis" en `pizarra-400` ([decisión 083](decisiones/083-el-bye-se-ve-en-el-cuadro.md)).

### Errores

El rojo es solo vencimiento: un error no es rojo ([decisión 099](decisiones/099-los-errores-no-son-rojos.md)). Un solo componente para toda la web y el flujo del jugador:

- **Aviso**: bloque con borde 1px `noche`, radio 8–12, texto 15 `noche`. Para el error de un formulario entero o de una acción ("No pudimos ingresar"). La primera frase puede ir en negrita: "**Ese código no es.** Revisá que sea el último que te mandamos".
- **Mensaje de error**: una línea en `noche`, peso 500, debajo del campo o de la acción que falló. El campo lo nombra en su `aria-describedby`.

Lo que hay que revisar, como una fila de la importación, se marca con borde `noche`, como la marca "para revisar" de *Revisar vinculación*.

### Confirmación

Para lo que no se deshace: cerrar la inscripción, confirmar el sorteo, cerrar las zonas, rechazar una solicitud y dar de baja ([decisión 096](decisiones/096-confirmar-lo-que-no-se-deshace.md)). Un modal de hasta 560 de ancho, radio 20, borde 1px `linea` y sin sombra, sobre un fondo `noche` al 40 % desenfocado 4 px. Arriba, el título con la acción y a quién afecta ("Dar de baja a Diego Antileo"); debajo, lo que va a pasar, una línea por consecuencia y con los números del torneo. Al pie, sobre `niebla`, Cancelar y la acción en el botón principal del organizador, con el mismo texto que el botón que lo abrió. Se cancela con Escape o con un clic en el fondo, y el foco nunca arranca en la acción.

### Esqueleto de carga

Mientras una pantalla espera a la API no se escribe "Cargando…": va un esqueleto de barras `linea` con radio 6, que late entre opacidad 1 y 0,5 (quieto con "reducir movimiento"). **Aparece recién a los 200 ms**, así que una respuesta rápida no hace parpadear nada. Formas en la web: `pagina`, `lista` y `bloque`; en la app, `tarjeta` y `lista`. Para el lector de pantalla dice "Cargando" ([decisión 093](decisiones/093-esqueleto-de-carga.md)).

### Hero de la landing

El único lugar con atmósfera. Sobre `noche-900`, un marco de radio 20 con un filete interior `cal` al 20 %, que nunca es más ancho que alto, con la pintura del club al atardecer anclada abajo y un velo `noche-900` arriba para que el titular se lea sobre el cielo. Adentro: el titular en Newsreader, la bajada en `cal` y un solo botón, "Crear mi circuito", el principal dado vuelta sobre la noche: `papel` con texto `noche-900`. Debajo, el demo del producto, con la única sombra del sistema (`shadow-demo`). Después del marco, todo el contenido va en una sola hoja `niebla` de radio 20 sobre la pared `noche-900`: *Cada uno ve lo que necesita*, las funciones (en filas, no en tarjetas) y las preguntas. El pie vuelve a la pared oscura. El demo es el **único momento de animación** del sitio: recorre el flujo real (Tablero, Cargar resultado y de vuelta), se puede pausar, arranca recién cuando está a la vista y con "reducir movimiento" queda quieto en la vista previa de la zona.

---

## 7. Vocabulario de estados

### Partido

| Estado | Cómo se ve |
|---|---|
| `pendiente` (sin coordinar) | Marca punteada; en una fila, la píldora `sin fecha` punteada y los días que quedan |
| `anotada` / `confirmada` | Marca azul; en una fila, la píldora de fecha en azul: `sáb 14 · 10:00` |
| `jugada` | Marca noche. Marcador en tinta, ganador en peso 600, perdedor en pizarra |
| `vencida` | Rojo. En una fila, un punto rojo antes de la zona, y la zona y el plazo en `rojo-texto`. El fondo `rojo-fondo` va en el encabezado del grupo de vencidos, no en cada fila |

### Inscripción

`reservando` (marca azul, con reloj de 15 minutos corriendo, en rojo cuando queda poco) · `pagada` (marca noche; punto `lona-texto` en las listas) · `en lista de espera` (numerada por orden de llegada) · `libre` (marca punteada) · `solicitud` (torneo con aprobación: punto hueco con borde `pizarra-400`, con "Aprobar" y "Rechazar" en la fila; no ocupa lugar en la barra de marcas hasta que paga).

Desde la [decisión 054](decisiones/054-perfil-pendiente.md), la solicitud tiene tres momentos. Para el jugador se escriben en minúscula al lado de un punto:

| Estado | Cómo se ve |
|---|---|
| `en revisión` | El mismo punto hueco con borde `pizarra-400` de la solicitud |
| `aprobada` | Punto lleno `noche`, con "Pagar". **No es lona**: la lona es de `pagada`, y todavía no pagó |
| `no aprobada` | Sin punto ni color: se avisa una vez, con un texto, y desaparece |

Una reserva vencida se avisa igual que una no aprobada: una vez, con texto, sin rojo. El rojo es para lo que vence mientras se mira, no para lo que ya pasó.

### Perfil pendiente

Un perfil `pendiente` (de una solicitud o una reserva de alguien que no estaba en el padrón) **no se muestra en el padrón ni en ninguna pantalla pública**: solo aparece en las solicitudes de la pantalla Inscripciones de la organización, con su nombre y su email. Un perfil `descartado` no se muestra en ningún lado.

### Vinculación

Cómo está conectado un perfil del padrón con la persona ([04-flujo-jugador.md](04-flujo-jugador.md) §5). Se ve en el padrón y en las inscripciones, nunca en una pantalla pública.

| Estado | Cómo se ve |
|---|---|
| Sin vincular | Rótulo en `pizarra-500` debajo del nombre: `sin vincular`. Es el estado de todo el padrón importado, no un problema |
| Vinculado | El email de la cuenta en `pizarra-500` debajo del nombre. Para el jugador que busca su perfil, el rótulo `vinculado` al lado del nombre, sin el email |
| `nueva` | Chip `lona-fondo` con texto `lona-texto` en minúscula, el mismo de "nuevo" en el padrón: la vinculación se hizo desde la última visita de la organización |
| `para revisar` | Chip en minúscula con borde 1px `noche`, sin relleno. **No es rojo**: no venció nada, es un caso dudoso que espera una decisión |

**Motivos de revisión.** Debajo del chip, o en la lista "Para revisar", va el motivo en palabras: *"hay otro Juan Pérez en Tercera"* (posible homónimo) o *"otra cuenta dice que es suyo"* (perfil reclamado).

### Torneo

`borrador` · `publicado` · `inscripciones cerradas` · `zonas generadas` · `grupos en curso` · `cuadros` · `finalizado`. Se muestran como chip en minúscula.

---

## 8. Cómo se escriben los datos

| Dato | Formato | Ejemplo |
|---|---|---|
| Fecha corta | día abreviado + número, minúscula | `sáb 14` |
| Fecha y hora | separados por punto medio | `sáb 14 · 10:00` |
| Fecha larga | día de semana completo | `domingo 22 de septiembre` |
| Marcador de set | guion simple, espacio entre sets | `6-4 3-6 10-8` |
| Marcador en cuadro | sets ganados | `2-1` |
| Sets y games en tabla | par con guion | `4-0`, `26-15` |
| Puntos | número solo, la palabra al lado | `95 puntos` |
| Dinero | punto como separador de miles | `$45.000` |
| Plazo | en días, no en fechas | `quedan 6 días` |
| Torneo del calendario abreviado | tres letras minúscula | `prim` `ver` `pre` `oto` `inv` |
| Código de verificación | mono, seis dígitos en dos grupos de tres | `482 913` |
| Número de inscripción | mono, sin puntos ni numeral | `100482` |

**El email no se enmascara.** Lo ven su dueño, que lo verificó o lo acaba de escribir, y las organizaciones en las que se inscribió, para contactarlo. Nunca aparece en una pantalla pública.

---

## 9. Voz

Español rioplatense, voseo, sentence case. Se le habla al usuario de vos y en presente.

- **Sí:** "Anotá la fecha", "Te falta coordinar", "Quedan 4 lugares", "Todavía nadie anotó la fecha"
- **No:** "Registrar encuentro", "Partidos pendientes de coordinación", "Cupos disponibles: 4"

Cada pantalla dice la consecuencia, no solo la acción: *"Pablo recibe un aviso y confirma con un toque. Recién ahí queda agendado para los dos."*

Nada de emoji en producto.

### Vocabulario

La interfaz usa términos genéricos, no los del código ni los de un circuito en particular ([devolucion-25.md](devolucion-25.md), cambios A3 y D). Equivalencia completa con el código en [02-dominio.md](02-dominio.md) §0.

| Se dice | No se dice | Nota |
|---|---|---|
| **Torneo del calendario** | Etapa | "El Primavera es un torneo del calendario" |
| **Edición** | Torneo (para una categoría de un torneo del calendario) | "Primavera 26 · Tercera". Un torneo suelto es un "torneo suelto", y la convocatoria que crea varias categorías es un "torneo" ([decisión 129](decisiones/129-nombres-que-quedaban-abiertos.md)) |
| **Cuadro consuelo**, o el nombre que configure la organización | Complementaria | POLENTA lo configura como "Complementaria"; en sus pantallas se ve así |
| Campeonato | — | Queda así ([decisión 129](decisiones/129-nombres-que-quedaban-abiertos.md)) |
| Jugadores | Padrón | En el menú, las migas y el título de la pantalla. En las frases sigue "padrón" ([decisión 129](decisiones/129-nombres-que-quedaban-abiertos.md)) |

**Estado.** Las pantallas implementadas ya usan estos términos, y el cuadro consuelo usa el nombre que configura cada organización ([decisión 120](decisiones/120-nombre-del-cuadro-consuelo.md)). Los HTML de referencia no se rehacen y conservan los términos viejos: cuáles, en [pantallas/README.md](pantallas/README.md).

### Ayuda en contexto

([devolucion-25.md](devolucion-25.md), cambio H; [decisión 134](decisiones/134-primeros-pasos-y-ayuda-en-contexto.md)). **No hay tutorial** que resalte pasos en pantalla: es caro de hacer y la gente lo saltea. La explicación aparece donde hace falta:

- Debajo del campo o la sección que explica, en `pizarra-500`, cuerpo 13–14 en escritorio. Una o dos oraciones que digan la consecuencia, como el resto de la voz: *"Cada torneo del calendario es un casillero del ranking. Cuando se juega Primavera 26, sus puntos reemplazan los de Primavera 25."*
- Para explicaciones largas, una caja `niebla` con radio de tarjeta, sin ícono de ayuda ni signo de pregunta.
- **Tarjeta "Primeros pasos"** en el inicio del organizador: tres pasos con check (*Importá tus jugadores · Creá tu primer torneo · Compartí el link de inscripción*) que **se tildan solos** cuando se cumplen. Borde `linea`, no tarjeta noche: no es el dato principal de la pantalla. Desaparece cuando están los tres. "Compartí el link" se tilda con la primera inscripción pagada.

---

## 10. Iconos

SVG en línea, trazo de 1.7–1.9, grilla de 16/18/20/24, `stroke-linecap: round`, con el color de un token (`stroke-pizarra-500`, `currentColor`), nunca un hex. Nunca emoji ni glifos unicode como ícono. El set actual: búsqueda, chevron, reloj, cámara, compartir, mensaje, check, cuadro, calendario, tarjeta, archivo, barras, engranaje.

Un ícono sin texto dice qué hace en `aria-label` y en `title`, y tiene un área de toque de 44 aunque el dibujo sea de 20. El engranaje abre la configuración de algo: hoy, *Editar el torneo* desde su tarjeta en el inicio ([decisión 101](decisiones/101-engranaje-para-editar.md)).

---

## 11. Pantallas y features

El canvas *Verde pelota* tiene **21 pantallas**, en el orden en que se usan, con el sistema anterior. Las **5 del rediseño de la inscripción y la vinculación** (octubre de 2026, [decisiones 049 a 051](decisiones/049-identidad-e-ingreso-con-codigo.md)) están solo en HTML, en [pantallas/](pantallas/README.md), y van marcadas con *nueva*. El artifact *Última luz v2* redibuja con el sistema nuevo la landing, el Tablero, Cargar resultado y Cuándo juego.

| Pantalla | Superficie | Feature |
|---|---|---|
| Cuándo juego | App del jugador | F11 |
| Mi zona | App del jugador | F07, F11 |
| Ranking | App del jugador | F09 |
| Anotar la fecha | App del jugador | F14 |
| El torneo | Web del jugador (por link) y app | F12 |
| Identificación · *nueva* | Web del jugador (por link) y app, con el código | F12 |
| Link personal · *nueva* | Web del jugador (por link) | F02, F12 |
| Inscripción y pago | Web del jugador (por link) y app | F12 |
| Código · *nueva* | Email | F12 |
| Comprobante · *nueva* | Email | F12 |
| Cuenta e ingreso | App del jugador: ingresar con email y código | F02, F12 |
| Qué está en juego | Web pública ([decisión 131](decisiones/131-las-proyecciones-en-la-web-publica.md)) | F20 |
| Registrar la organización | Web del organizador | F01 |
| Tu circuito | Web del organizador | F01 |
| Padrón | Web del organizador | F02 |
| Revisar vinculación · *nueva* | Web del organizador | F02 |
| Tablero del torneo | Web del organizador | F15 |
| Cargar resultado | Web del organizador | F06, F07 |
| Cerrar el torneo | Web del organizador | F16 |
| Inscripciones | Web del organizador | F13 |
| Sorteo de zonas | Web del organizador | F05 |
| Importar padrón | Web del organizador | F03 |
| Nuevo torneo | Web del organizador | F04 |
| Landing | Web pública | — |
| Los dos cuadros | Web pública | F08, F10 |
| Ficha y cara a cara | Web pública | F17, F18 |

**Sin pantalla:** F19, registro de resultados a partir de mensajes. Está condicionada al tiempo y a confirmar con el profesor ([devolucion-25.md](devolucion-25.md), cambio I); se diseña solo si se confirma. Además, la importación por excepción (F03) cambia la pantalla *Importar padrón*, que hay que rediseñar: hoy muestra todas las filas para decidir.

---

## 12. Implementación

### Tokens en la web

La web usa Tailwind 4: los tokens están en el bloque `@theme` de `apps/web/src/index.css`, y **el nombre de la clase es el nombre del token**: `bg-noche`, `text-pizarra-500`, `border-linea`, `bg-lona-fondo`, `font-display`, `rounded-tarjeta`. Nunca un hex en un componente.

```css
@theme {
  --color-noche-900: #0B1220;
  --color-noche: #101A2C;
  --color-noche-2: #1A2740;
  --color-borde-noche: #2E3D5A;
  --color-pizarra-700: #3B4659;
  --color-pizarra-500: #4A5468;
  --color-pizarra-400: #9AA5B8;
  --color-borde-campo: #878FA1;
  --color-linea: #D8DCE5;
  --color-linea-suave: #ECEEF3;
  --color-niebla: #F4F5F8;
  --color-papel: #FFFFFF;
  --color-cal: #E9E2D6;
  --color-lona: #62BB78;
  --color-lona-borde: #93D2A3;
  --color-lona-fondo: #E4F8E7;
  --color-lona-texto: #1B6236;
  --color-pelota: #CDF546;
  --color-azul: #3567D6;
  --color-azul-texto: #2A55BC;
  --color-azul-fondo: #E5EDFE;
  --color-azul-borde: #8DAAEC;
  --color-amarillo: #B7801F;
  --color-amarillo-fondo: #FDF7E6;
  --color-amarillo-borde: #E6CF94;
  --color-amarillo-claro: #D9A441;
  --color-azul-claro: #6F97F0;
  --color-rojo: #E5484D;
  --color-rojo-texto: #C62A2F;
  --color-rojo-fondo: #FEF6F6;
  --color-rojo-linea: #F3D3D4;
  --color-ambar: #8F5200;
  --color-ambar-fondo: #FDF3E3;
  --color-petroleo: #0F6170;
  --color-petroleo-fondo: #E5F4F6;

  --font-sans: "Instrument Sans", "Helvetica Neue", Arial, sans-serif;
  --font-display: "Funnel Display", "Helvetica Neue", Arial, sans-serif;
  --font-serif: "Newsreader", Georgia, serif;
  --font-mono: "Geist Mono", ui-monospace, "SF Mono", Consolas, monospace;

  --radius-control: 8px;
  --radius-tarjeta: 12px;
  --radius-superficie: 20px;
}
```

El texto sobre noche usa el `text-white` de Tailwind: es el mismo valor que `papel`, con otro rol.

### Tokens en React Native

La app tiene su copia de los tokens en `apps/mobile/src/lib/tokens.ts`, con los mismos valores que `apps/web/src/index.css` ([decisión 034](decisiones/034-tokens-de-la-app.md)), en camelCase: `colores.noche`, `colores.pizarra500`, `colores.lonaFondo`. Si cambia un valor de este documento, cambia en los dos archivos. Los estilos se escriben con `StyleSheet` y esos tokens ([decisión 035](decisiones/035-estilos-de-la-app.md)).

- **Las fuentes van dentro de la app**, porque en el celular no hay Google Fonts. Salen de los paquetes `@expo-google-fonts/instrument-sans`, `@expo-google-fonts/geist-mono` y `@expo-google-fonts/funnel-display`, se cargan con `useFonts` en `src/app/_layout.tsx` y la splash espera a que estén. Es en tiempo de ejecución y no con el plugin de `expo-font` porque Expo Go no lee el plugin. Newsreader no está en la app: es solo de la landing.
- **El peso se elige con la familia, nunca con `fontWeight`.** En Android cada peso es una fuente aparte: `fontFamily: fuentes.display[600]`, no `fontWeight: '600'`.
- **`tabular-nums` se escribe `fontVariant: ['tabular-nums']`**, que en los tokens es `tabular`.
- **`papel` y `blanco` valen lo mismo**: `papel` es la superficie y `blanco`, el texto sobre noche.
- **Las medidas de la escala móvil también son tokens** (`medidas.toque` = 56, `medidas.margen` = 16), porque en la app se repiten en cada pantalla.

### Notas para quien implemente

- La tarjeta noche no lleva sombra ni gradiente. Si parece plana, es correcto.
- Las tarjetas y las tablas llevan fondo `papel` explícito: el fondo de la página es `papel` o `niebla`, y las tarjetas se separan con su borde `linea`. Sin el borde se funden con el papel.
- Toda tabla y toda matriz usan `tabular-nums`. Sin eso, las columnas bailan.
- El cuadro eliminatorio se arma con columnas de altura fija y `justify-content: space-around` anidado: cada par de partidos queda centrado respecto del siguiente, y los codos son bordes de 1px con `border-left: none`.
- Nada de scroll horizontal en móvil. Si una tabla no entra, se reorganiza (así se resolvieron los cinco casilleros del ranking).

---

## 13. Decisiones de diseño abiertas

- La matriz de zona está pensada para grupos de 4. Un circuito que arme zonas de 5 o 6 necesita otro tratamiento de esa tabla.
- Falta la versión móvil del tablero del organizador. Hoy es solo escritorio, que es lo que el reparto web/móvil define, pero conviene revisarlo con el organizador real.
