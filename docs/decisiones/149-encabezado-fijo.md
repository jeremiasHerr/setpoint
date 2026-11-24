# 149 — El encabezado del organizador queda fijo al bajar

**Estado:** aceptada — 24 de noviembre de 2026.

## Contexto

Al editar un torneo, el formulario tiene seis secciones y en el celular es largo. Al bajar hasta Plazos o Inscripción, la franja noche con el menú quedaba arriba, fuera de la vista, y para ir a otra pantalla había que volver a subir. El grupo pidió que el encabezado acompañe al bajar.

## Opciones consideradas

1. **La franja fija en todas las pantallas del organizador.**
   - En contra: ocupa 60 px fijos en el celular.
2. **Fija solo en *Nuevo torneo* y *Editar*, con una línea debajo con el nombre y si ya se guardó.**
   - En contra: esa pantalla se comporta distinto que las demás, y en el celular ocupa unos 100 px.
3. **Una barra fina que aparece al bajar, con el nombre, el guardado y el link para volver.**
   - En contra: es un componente nuevo con una animación más, y la opción más cara.

## Decisión

Opción 1, elegida por el grupo.

- **La franja noche queda fija arriba en todas las pantallas del organizador,** también en las de un torneo. La franja del torneo, con las migas y las pestañas, sigue en la página.
- **Los paneles laterales que ya quedaban fijos** (*Cómo queda* en *Nuevo torneo* y el panel del padrón) bajan para quedar debajo de la franja, y la carga de *Cargar resultado* se ubica debajo de ella al abrir un partido.
- **Va por encima de los menús de las filas** y por debajo del sorteo en pantalla.

## Por qué

- **El menú está siempre a un toque,** en el formulario largo y en las tablas largas del padrón y el tablero.
- **Todas las pantallas del organizador se comportan igual.**
- **Es un cambio en un solo componente,** sin pantallas nuevas.

## Qué se resigna

- **En el celular, 60 px de la pantalla quedan siempre ocupados.**
- **El estado del guardado de *Editar* no queda a la vista al bajar:** sigue junto al título.
