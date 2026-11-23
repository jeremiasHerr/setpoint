# 131 — Las proyecciones van en la web pública

**Estado:** aceptada — 21 de noviembre de 2026.

> Se numeró primero como la 120, que ya era la del nombre del cuadro consuelo: dos PR tomaron el mismo número a la vez.

## Contexto

Las proyecciones de ranking (F20) dicen cuántos puntos sumaría un jugador y en qué puesto quedaría según hasta dónde llegue en un torneo que no cerró. La API ya las calcula (`GET /api/publico/:slug/torneos/:id/proyeccion/:jugadorId`) y faltaba la pantalla.

Las dos fuentes no coinciden. La pantalla de referencia, *Qué está en juego*, es de la app del jugador. F20, en cambio, dice que "se accede desde la ficha del jugador y desde la vista del torneo", y esas dos pantallas están en la web pública (decisiones 069 y 074). La API es pública y sirve para cualquiera de los dos lados.

## Opciones consideradas

1. **Web pública:** una página sin cuenta, `/c/:slug/torneos/:id/en-juego/:jugadorId`, a la que se llega desde la ficha.
   - En contra: la referencia es de la app, y cualquiera con el enlace ve lo que tiene en juego cualquier jugador.
2. **App del jugador:** una pantalla nueva, a la que se llega desde Mi zona.
   - En contra: F20 nombra la ficha y la vista del torneo, que en la app no existen. Hay que volver a generar el APK, con la cola del plan gratuito de EAS a días de la entrega. Y solo se puede ver la proyección propia.
3. **Las dos**, sobre la misma API.
   - En contra: son dos pantallas y dos PR a días de la entrega.

## Decisión

Opción 1, elegida por el grupo.

- **Se llega desde la ficha:** en la sección Torneos, el torneo que se está jugando y da puntos tiene el enlace "Ver qué tiene en juego". Desde la vista del torneo se llega por los nombres de las zonas, que ya abren la ficha. Así no hace falta sumar nada por jugador en la página en vivo.
- **La ficha dice qué torneos tienen proyección** (`conProyeccion`), con la misma regla que la API: la organización lleva ranking, el torneo es de un torneo del calendario y todavía no cerró. Sin eso, el enlace llevaría a un torneo suelto que no tiene nada que proyectar.
- **La pantalla habla en tercera persona** ("hoy tiene", "si llega a…"), porque la abre cualquiera, no solo el jugador.
- **Abajo de los escenarios se aclara que el puesto cuenta solo lo que los demás ya tienen asegurado.** La API proyecta así, y sin la aclaración el puesto parecería una promesa.

## Por qué

- **Es lo que pide F20,** y la ficha y la vista del torneo ya existen en la web.
- **No hace falta un APK nuevo** para mostrarlo en la entrega, y se abre desde el link que circula en el grupo de WhatsApp, sin instalar nada.
- **Que sea pública no expone nada nuevo:** todo lo que usa (el ranking, los cuadros) ya es público (decisiones 033 y 069).

## Qué se resigna

- **La app del jugador no muestra las proyecciones.** La referencia queda como diseño para cuando llegue.
- **La pantalla no le habla al jugador de "vos"** como la referencia, porque no sabe quién la está mirando.
