# SetPoint en dos minutos

## El problema

Los circuitos amateur de tenis se organizan con **Excel y WhatsApp**. El ranking vive en una planilla que actualiza una sola persona. Los cuadros, los horarios y los resultados se pierden entre mensajes del grupo. Las inscripciones se cobran por transferencia y se verifican a mano, comprobante por comprobante. Los desempates de zona se calculan con el reglamento al lado.

SetPoint es una plataforma para que cualquier circuito organice sus torneos y su ranking sin eso.

**Caso de validación:** POLENTA Team Tenis, un circuito real de Neuquén con 77 jugadores en 2 categorías. Sus reglas y sus datos sirven para probar que el sistema resuelve un caso real. No son el molde: cada circuito configura su formato, su calendario y su tabla de puntos ([07-configurabilidad.md](07-configurabilidad.md)).

## Quiénes lo usan

| | Desde dónde | Para qué |
|---|---|---|
| **La organización** | Web | Carga sus jugadores, crea los torneos, hace el sorteo, carga resultados y cierra |
| **El jugador** | App móvil (APK) | Se inscribe y paga, anota la fecha de sus partidos, consulta cuándo juega |
| **Cualquiera** | Link público, sin cuenta | Ve el ranking, los cuadros y la ficha de cada jugador |

## Los 4 flujos principales

1. **Puesta en marcha.** La organización se registra y sube la planilla que ya usa. La IA reconoce a los jugadores, sus puntos y el calendario del circuito; la organización revisa solo lo dudoso.
2. **Inscripción.** La organización publica un torneo y comparte el link. El jugador se inscribe y paga con MercadoPago; el lugar se confirma solo, sin comprobantes.
3. **Competencia.** El sistema arma las zonas, los jugadores anotan la fecha de cada partido, la organización carga los resultados. Las posiciones y los desempates se calculan solos, y los cuadros avanzan.
4. **Cierre.** La organización cierra el torneo y cada jugador recibe los puntos de la instancia que alcanzó. El ranking se actualiza solo, con cada punto trazable hasta su origen.

## Arquitectura

```
  Web (React)          App (React Native + Expo)
  organización              jugador
        \                     /
         API (Express + Prisma) ──── PostgreSQL
           |            |
      MercadoPago    IA (Claude, solo desde el backend)
```

Monorepo con los tipos y validaciones compartidos (Zod). Todo levanta con `docker compose up`.

## Qué hace la IA

**Importa los datos de un circuito que ya existe.** La organización sube su planilla de ranking, tal como la tiene, y la IA la interpreta: quién es cada jugador, si ya está cargado, qué puntos tiene en cada torneo del calendario, e incluso qué torneos y categorías tiene el circuito.

**Es automática por excepción.** La IA extrae, el código audita cada número contra el archivo, y lo que pasa todos los controles se importa solo. La organización revisa únicamente lo que falló o es dudoso: *"Importamos 74 jugadores. Revisá estos 3"*.

**Lo que no hace la IA:** zonas, posiciones, desempates y ranking son reglas fijas, y se calculan con código testeado. La IA se usa donde los datos son ambiguos, no donde las reglas son claras.

Detalle en [06-ia.md](06-ia.md).
