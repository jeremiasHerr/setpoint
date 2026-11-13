# 088 — El inicio vacío muestra los dos caminos con el mismo peso

**Estado:** aceptada — 12 de noviembre de 2026. Se aparta de la referencia [home.html](../pantallas/organizador/home.html), estado 1.

## Contexto

La primera vez que una organización entra, el inicio no tiene torneos. La referencia pone como camino principal crear un torneo, con un borde negro y la etiqueta "Lo más rápido", y el circuito con ranking abajo, como una tarjeta chica de "segunda opción".

Al probarlo, la segunda tarjeta parecía un agregado. Un circuito con ranking, como POLENTA, que es el caso de validación, tenía que leer la letra chica para encontrar su camino.

## Opciones consideradas

1. **Dejarlo como la referencia:** el torneo primero y el circuito como secundario.
   - En contra: el circuito con ranking, que es el caso de validación, queda escondido.
2. **Dos tarjetas iguales, una al lado de la otra**, con lo que distingue a cada una en la etiqueta: "Lo más rápido" y "Con ranking anual".
   - En contra: la pantalla ya no dice por cuál empezar a quien no sabe qué elegir.
3. **Preguntar primero qué querés armar** y mostrar solo un camino.
   - En contra: un paso más, y obliga a elegir algo que se puede hacer después.

## Decisión

Opción 2, pedida por el grupo.

- **Las dos tarjetas tienen el mismo borde, tamaño y forma:** ícono, título con etiqueta, descripción, tres pasos y un botón principal, alineados abajo.
- **Crear un torneo:** ícono "+" en lima, "Lo más rápido", "Te lleva 2 minutos".
- **Armar un circuito:** ícono de ranking en negro, "Con ranking anual", "Ahora o después de tu primer torneo".
- **La columna de la derecha no cambia:** el resumen y el Excel, que sirve para los dos caminos.
- **Mientras carga, se ve solo el encabezado**, sin "Cargando tu organización…", que solo parpadeaba.

## Por qué

- **Ninguno de los dos caminos es el "correcto":** un torneo suelto y un circuito con ranking son los dos casos que la plataforma soporta ([07](../07-configurabilidad.md) §1).
- **La etiqueta alcanza para decidir:** quien quiere probar rápido ve "Lo más rápido"; quien tiene un ranking ve el suyo.
- **Sigue sin obligar a elegir:** cualquiera de los dos deja hacer el otro después, y la pantalla lo dice.

## Qué se resigna

- **La pantalla ya no empuja hacia el torneo suelto**, que era la puerta de entrada pensada para probar la plataforma sin configurar nada.
- **La referencia queda desactualizada en este estado.** No se reescribe: esta decisión documenta el cambio.
