# 157 — Las páginas públicas llevan el logo de Setpoint, que es un link al inicio

**Estado:** aceptada — 27 de noviembre de 2026.

## Contexto

Las páginas públicas (ranking, torneo, en vivo, ficha, cara a cara, proyecciones, inscripción, pago y link personal) seguían con la marca de antes de la [decisión 105](105-sistema-visual-ultima-luz.md): un cuadrado noche con una pelota, al lado del nombre del circuito. El resto de la web ya usaba las marcas de Setpoint. Además, el ranking, que se comparte por link, no tenía cómo salir: sin menú y sin historial, quien lo abría desde WhatsApp quedaba encerrado, y la organización no volvía a su Inicio.

## Opciones consideradas

**A dónde lleva el logo y la vuelta del ranking:**

1. **Quien administra, a su Inicio; quien no tiene sesión, nada:** el ranking ya es la página pública del circuito.
   - En contra: el jugador sigue sin salida, y el logo sería link para unos y no para otros.
2. **Quien administra, a su Inicio; quien no tiene sesión, a la landing de Setpoint.**
   - En contra: la landing le habla a organizadores, no a jugadores.
3. **Siempre a `/inicio`.**
   - En contra: el jugador sin cuenta cae en el ingreso de administradores.

**Cómo va el encabezado:**

1. **El logo completo, una raya y el nombre del circuito.**
   - En contra: en el celular, con el chip de la categoría al lado, un nombre largo se recorta.
2. **Solo las marcas, sin la palabra, al lado del nombre del circuito,** como estaba la pelota.
   - En contra: un ícono que lleva a Setpoint sin decir Setpoint se entiende menos.

## Decisión

La opción 2 de la vuelta y la 1 del encabezado, elegidas por el grupo.

- **El logo es un link en las nueve páginas:** con sesión de administrador, a `/inicio`; sin sesión, a `/`. No depende de la organización: el logo es de Setpoint y lleva a tu Setpoint.
- **El ranking suma una vuelta arriba,** con la misma regla: "← Inicio" o "← Setpoint".
- **Sin circuito** (el pago antes de cargar y el link personal que ya no anda), solo el logo.

## Por qué

- **Una sola marca en toda la web.** La pelota quedó del sistema anterior, y design.md ya la reserva para el logo.
- **Nadie queda encerrado** en una página que llegó por WhatsApp.
- **El logo hace lo mismo en todas las páginas,** y la sesión se lee del navegador, sin pedirle nada a la API.

## Qué se resigna

- **El jugador sin cuenta va a una página que no es para él.** No hay una página pública del jugador en la web: lo suyo está en la app.
- **El circuito pierde protagonismo** en el encabezado: pasa a segundo lugar después de Setpoint, y en el celular un nombre largo se recorta.
- Un administrador de otro circuito que abre el ranking vuelve a su propio Inicio, que es lo esperable.
