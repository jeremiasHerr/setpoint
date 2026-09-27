# Pantallas de referencia

Una pantalla por archivo, en HTML autónomo: se abre con doble clic en el navegador y es exactamente lo que está en el canvas **SetPoint — Verde pelota**. El sistema visual (colores, tipografía, componentes, voz) está en [../design.md](../design.md).

Todos los nombres de personas son ficticios.

## Para qué sirven

Son **la referencia visual** de cada feature, no código para copiar. Están escritas con estilos en línea y datos fijos para que se vean bien; el código de verdad se escribe en React, con los componentes y los tokens del sistema de diseño, y los datos vienen de la API.

Al pedirle una pantalla a la IA, se le pasa **el archivo de esa pantalla y nada más**. Así lee medidas, colores y textos exactos, en vez de adivinarlos a partir de una captura.

## Índice

Ordenado por entrega.

| Entrega | Feature | Pantalla | Superficie | Ancho |
|---|---|---|---|---|
| 25% | F01 | [Registrar la organización](organizador/registro.html) | Web organizador | 870 px |
| 25% | F01 | [Tu circuito](organizador/tu-circuito.html) | Web organizador | 1280 px |
| 25% | F02 | [Padrón](organizador/padron.html) | Web organizador | 1280 px |
| 25% | F03 | [Importar padrón](organizador/importar-padron.html) | Web organizador | 1280 px |
| 25% | F04 | [Nuevo torneo](organizador/nuevo-torneo.html) | Web organizador | 1280 px |
| 50% | F05 | [Sorteo de zonas](organizador/sorteo.html) | Web organizador | 1280 px |
| 50% | F06, F07 | [Cargar resultado](organizador/cargar-resultado.html) | Web organizador | 1280 px |
| 50% | F07, F11 | [Mi zona](jugador/mi-zona.html) | App jugador | 390 px |
| 50% | F08, F10 | [Los dos cuadros](publico/cuadros.html) | Web pública | 1860 px |
| 50% | F09 | [Ranking](jugador/ranking.html) | App jugador | 390 px |
| 50% | F11 | [Cuándo juego](jugador/cuando-juego.html) | App jugador | 390 px |
| 75% | F02, F12 | [Cuenta e ingreso](jugador/cuenta-e-ingreso.html) | App jugador | 870 px |
| 75% | F12 | [El torneo](jugador/el-torneo.html) | App jugador | 390 px |
| 75% | F12 | [Inscripción y pago](jugador/inscripcion-y-pago.html) | App jugador | 1290 px |
| 75% | F13 | [Inscripciones](organizador/inscripciones.html) | Web organizador | 1280 px |
| 75% | F14 | [Anotar la fecha](jugador/anotar-fecha.html) | App jugador | 390 px |
| 75% | F15 | [Tablero del torneo](organizador/tablero.html) | Web organizador | 1280 px |
| 75% | F16 | [Cerrar el torneo](organizador/cierre.html) | Web organizador | 1280 px |
| 75% · 100% | F17, F18 | [Ficha y cara a cara](publico/ficha-y-cara-a-cara.html) | Web pública | 870 px |
| 100% | F20 | [Qué está en juego](jugador/que-esta-en-juego.html) | App jugador | 390 px |
| — | — | [Landing](publico/landing.html) | Web pública | 1280 px |

Sin pantalla: **F19** (resultados desde mensajes), en duda.

> Los anchos son los del diseño: 390 es un celular, 1280 un escritorio. Las pantallas del organizador tienen que funcionar también en una notebook de 1024; las del jugador, en cualquier celular.

## Cómo se trabaja una pantalla

**Una pantalla, una rama, un PR.** Nada de pedir un módulo entero de una vez.

1. **Rama:** `feat/web-padron`, `feat/mobile-cuando-juego`.
2. **Primero el plan, después el código.** En Claude Code, arrancar en modo plan (`Shift+Tab`), pasarle el prompt de abajo y leer el plan antes de aprobarlo. Es el momento de decir "este componente ya existe, usá ese" o "esto no, todavía no".
3. **Por partes dentro de la pantalla.** Primero la estructura con datos de ejemplo; después separar componentes; después conectar con la API. Un commit por paso.
4. **Quien la pidió la tiene que poder explicar.** Antes de abrir el PR, recorrer el código y entender cada archivo. Si hay algo que no se entiende, se pregunta o se reescribe. En la defensa van a preguntar por el código, no por el prompt.
5. **PR con captura** de la pantalla implementada al lado de la de referencia. El que revisa las compara.

## Prompt base

Copiar, completar lo que está entre `<>` y borrar lo que no aplique.

```
Implementá la pantalla <nombre> de la feature <Fxx>.

Referencia visual: docs/pantallas/<carpeta>/<archivo>.html
Sistema de diseño: docs/design.md
Reglas de la feature: docs/10-features.md, sección <Fxx>

Alcance de esta tarea:
- Solo esta pantalla. No crees otras pantallas ni rutas que no pido.
- Datos de ejemplo en un archivo aparte (mock), todavía sin llamar a la API.
- Reutilizá los componentes que ya existen en <apps/web/src/components>
  antes de crear uno nuevo. Si hace falta uno nuevo, genérico, va ahí;
  si es de dominio, va en features/<modulo>/.
- Colores y fuentes desde los tokens de design.md, no con hex sueltos.

No hagas:
- Lógica de backend, llamadas a la API ni validaciones de negocio.
- Otras pantallas del mismo flujo.

Antes de escribir código, mostrame el plan: qué componentes vas a crear,
dónde va cada archivo y qué vas a reutilizar.
```

Cuando la pantalla ya está y toca conectarla:

```
Conectá la pantalla <nombre> con el endpoint <GET /api/...>.
El schema de la respuesta está en packages/shared/src/schemas/<archivo>.ts.
Reemplazá el mock por una consulta con TanStack Query.
Agregá los estados de carga, vacío y error siguiendo design.md §7 y §9.
```

## Orden sugerido para la entrega del 25%

1. **Base compartida** (una sola vez, los tres juntos): tokens, fuentes y los componentes que aparecen en casi todo — encabezado del organizador, botón, campo, chip, tarjeta. Sin esto, cada pantalla reinventa el botón.
2. `registro` → `tu-circuito` → `padron` → `nuevo-torneo`
3. `importar-padron`, que depende de la funcionalidad de IA y conviene dejar para el final de la entrega.
