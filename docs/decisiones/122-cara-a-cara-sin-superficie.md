# 122 — El cara a cara es una pantalla con dos pasos, y todavía no filtra por superficie

**Estado:** aceptada — 21 de noviembre de 2026

*Tomada durante la implementación: revisar*

## Contexto

F18 pide comparar a dos jugadores del circuito: el resultado acumulado del cruce, cada enfrentamiento con su torneo e instancia, y un filtro por superficie de la cancha. Se accede desde la ficha ([decisión 074](074-entrada-a-la-ficha.md)) o con un buscador por apellido. La referencia dibuja la comparativa y el botón "Comparar con otro jugador", pero no cómo se elige al rival. Los clubes y las superficies todavía no existen como dato.

## Opciones consideradas

1. **Una pantalla con dos pasos:** `/c/:slug/jugadores/:id/cara-a-cara` lista con quiénes jugó el jugador, y `.../cara-a-cara/:rivalId` muestra la comparativa.
   - En contra: no se puede comparar a dos que nunca se enfrentaron (no habría nada que mostrar).
2. **Un buscador por apellido sobre todo el padrón.**
   - En contra: la mayoría de las elecciones llevarían a un cruce vacío, y hace falta otra consulta y otro componente.
3. **Una página para elegir y otra para comparar.**
   - En contra: dos pantallas para una sola tarea.

## Decisión

Opción 1. La API suma dos rutas públicas bajo `/api/publico/:slug/jugadores/:id`: `GET /rivales` y `GET /cara-a-cara/:rivalId`. Los ids se validan con un schema de Zod en `packages/shared`, y el cálculo es puro, en `apps/api/src/modules/ficha/cara-a-cara.ts`. El resumen cuenta el W.O. aparte y el abandono como jugado ([decisión 073](073-el-wo-no-cuenta-en-la-ficha.md)). Se vuelve a la ficha ([decisión 102](102-la-ficha-vuelve-a-donde-se-llego.md)). **El filtro por superficie no se muestra:** no existe el dato.

## Por qué

- **Se elige entre quienes tienen algo que mostrar:** cada opción lleva a una comparativa con al menos un partido.
- **La ruta no cambia cuando llegue la app:** "Cómo te fue con él" usa las mismas dos consultas.
- **Sin datos de contacto:** los jugadores se identifican por nombre, categoría y puesto.

## Qué se resigna

- **No hay filtro por superficie** ni la frase de cierre de la referencia ("en polvo están 2 a 2") hasta que los clubes tengan superficie.
- **No se compara a quien nunca jugó con el jugador,** ni hay un buscador por apellido.
- **Quien está dado de baja del padrón no aparece** como rival, aunque tenga partidos.
