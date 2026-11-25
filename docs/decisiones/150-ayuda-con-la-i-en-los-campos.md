# 150 — La (i) junto al rótulo abre qué es el campo

**Estado:** aceptada — 24 de noviembre de 2026. Suma a la ayuda en contexto de la [decisión 134](134-primeros-pasos-y-ayuda-en-contexto.md), que no cambia.

## Contexto

En *Nuevo torneo* hay campos cuyo rótulo no alcanza para saber qué se pide: "Fase de grupos", "Cada ronda eliminatoria", "Empieza", "Cupo", "Cierra". Algunos tienen una explicación debajo, siempre a la vista; otros, ninguna. El grupo propuso el ícono de información al lado del campo.

design.md decía que la ayuda va debajo del campo y que las explicaciones largas van en una caja, "sin ícono de ayuda ni signo de pregunta".

## Opciones consideradas

1. **La (i) abre la explicación debajo del rótulo, dentro de la página,** y otro toque la cierra.
   - En contra: al abrirse empuja el resto del formulario hacia abajo.
2. **La (i) abre un globito flotante:** con el mouse o el foco en la compu, con un toque en el celular.
   - En contra: en el celular no se puede pasar el mouse, el globito puede tapar el campo, y hay que acomodarlo para que no se salga de la pantalla.
3. **Sin ícono: la explicación siempre a la vista** debajo de cada campo que no la tiene.
   - En contra: suma texto fijo a un formulario que ya es largo.

## Decisión

Opción 1, elegida por el grupo.

- **Es una "i" en un círculo, no un "!":** el signo de exclamación se lee como un error o una advertencia.
- **Va al lado del rótulo,** en el color del rótulo, y se toca en 44 aunque el dibujo sea de 15. Abierta, la "i" pasa a noche.
- **La explicación se abre entre el rótulo y el campo,** en `pizarra-500`, de 13: una o dos oraciones que dicen qué es el dato y qué hace el sistema con él.
- **Es una propiedad del campo, `ayuda`:** el campo que la recibe muestra la (i).
- **En *Nuevo torneo* la llevan los campos sin explicación:** Grupos, Clasifican a Campeonato, Fase de grupos, Cada ronda eliminatoria, Empieza, Importe, Cupo y Cierra. Las explicaciones que ya estaban a la vista siguen igual: dicen consecuencias que no conviene esconder.

## Por qué

- **Funciona igual en el celular y en la compu,** sin depender de pasar el mouse.
- **No tapa nada:** la explicación ocupa su lugar en la página, y la lee un lector de pantalla con el botón que dice si está abierta.
- **El formulario no suma texto fijo:** la explicación aparece solo si alguien la pide.

## Qué se resigna

- **Al abrirla, el campo de esa columna baja respecto de los de al lado,** en la compu.
- **Hay dos formas de ayuda en la misma pantalla:** la (i), que dice qué es el dato, y el texto a la vista, que dice una consecuencia.
