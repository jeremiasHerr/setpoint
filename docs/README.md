# Plataforma de gestión de torneos de tenis

**Trabajo Final — Tecnicatura Universitaria en Desarrollo Web, UNCo FaI**
Grupo de 3 · Entrega: fines de noviembre de 2026

**Versión de la documentación:** 2.0 — 25 de agosto de 2026
**Cambio principal de la v2.0:** incorporación del reglamento y datos reales del circuito POLENTA Team Tenis. Se corrigen el modelo de ranking, el formato de torneo (aparece la zona Complementaria) y la cascada de desempates.

---

## Índice

| Documento | Contenido |
|---|---|
| [01-vision.md](01-vision.md) | Pitch, problema que resuelve, relevamiento de competencia |
| [02-dominio.md](02-dominio.md) | **Reglas reales del circuito.** Formato, sistema de juego, desempates, ranking, plazos |
| [03-flujo-organizacion.md](03-flujo-organizacion.md) | Qué hace la organización desde la web |
| [04-flujo-jugador.md](04-flujo-jugador.md) | Qué hace el jugador desde la app |
| [05-pagos.md](05-pagos.md) | Integración con MercadoPago |
| [06-ia.md](06-ia.md) | Las tres funcionalidades de IA |
| [07-configurabilidad.md](07-configurabilidad.md) | Qué se parametriza por organización y qué queda fijo |
| [08-repositorio.md](08-repositorio.md) | Estructura de carpetas, ramas, tags de entrega y forma de trabajo |
| [09-setup-inicial.md](09-setup-inicial.md) | Guía paso a paso para inicializar el proyecto |

> **02-dominio.md documenta el caso POLENTA**, que es el cliente de validación. **07-configurabilidad.md** define qué de eso se parametriza para otras organizaciones y qué queda fijo. Leer los dos juntos.

> **02-dominio.md es la fuente de autoridad sobre el dominio.** Sus reglas salen del reglamento escrito de POLENTA y de las respuestas del organizador, no de supuestos nuestros. Ante cualquier contradicción con el resto de los documentos, manda ese.

---

## Stack

TypeScript · React (web) · React Native + Expo (móvil) · Express + Prisma (API) · PostgreSQL / Neon · MercadoPago · Docker

Monorepo con workspaces: `apps/api`, `apps/web`, `apps/mobile`, `packages/shared`.

---

## Cliente real

**POLENTA Team Tenis**, circuito amateur sin fines de lucro organizado por un grupo de jugadores independientes. Datos actuales:

| | |
|---|---|
| Jugadores | 77 |
| Categorías | Segunda y Tercera |
| Torneos por año | 4 estacionales + Master |
| Inscripción | $45.000 ARS |
| Coordinación actual | Grupo de WhatsApp |
| Ranking actual | Planilla Excel manual |
| Cobro actual | Transferencia + envío de comprobante |

---

## Decisiones abiertas

| # | Decisión | Bloquea | Estado |
|---|---|---|---|
| 1 | ¿Qué `modo_sorteo` usa POLENTA: automático, asistido o manual? (ver [07](07-configurabilidad.md) §2.1) | Prioridad de implementación | Consultar |
| 2 | ¿Desde qué instancia paga las canchas la organización? El reglamento dice "fases de Campeonato y Complementaria", la respuesta 9 dice cuartos y la 23 dice octavos | Modelo de sedes | Consultar |
| 3 | El ranking del PDF tiene 5 casilleros (incluye "Pretemporada"), pero la respuesta 15 menciona 4 torneos + Master. ¿Pretemporada **es** el Master? | Modelo de ranking | Consultar |
| 4 | ¿Se implementa la zona Complementaria completa, o se recorta el alcance para llegar a noviembre? | Alcance del proyecto | **Decidir en grupo** |
| 5 | ¿El resultado lo carga la organización a mano, o se extrae del mensaje de WhatsApp con IA? | Alcance de [06](06-ia.md) | **Decidir en grupo** |
| 6 | ¿Se implementan los tres modos de sorteo o solo `manual` + `automatico` para v1? | Alcance | **Decidir en grupo** |
| 7 | **Cambio de categoría:** si un jugador de Tercera pasa a Segunda, ¿qué pasa con sus puntos de Tercera? ¿Se transfieren, quedan congelados, o el jugador desaparece de esa tabla? | Modelo de ranking | Consultar |
| 8 | ¿DNI o email como identificador en el flujo de inscripción por link? (ver [04](04-flujo-jugador.md) §5.8) | Flujo de inscripción | **Decidir en grupo** |
| 9 | **Coordinación de partidos:** ¿la app es donde se *negocia* la fecha (propuestas, contrapropuestas, notificaciones) o solo donde se *registra* lo ya acordado por WhatsApp? Son órdenes de magnitud distintos de trabajo | Alcance del módulo de partidos | **Decidir en grupo** |

### Resueltas

- ~~¿Distribución directa o serpentina?~~ **Serpentina**, configurable
- ~~¿Cuántos clasifican por grupo?~~ **Dos a Campeonato, dos a Complementaria**
- ~~¿El cuadro final es eliminación simple?~~ **Sí**, ambos cuadros
- ~~¿Se soporta dobles?~~ **No.** Solo single
- ~~¿Quién carga los resultados?~~ **La organización**
- ~~Tabla de puntos~~ **100 / 75 / 50 / 25 / 15 / 10**
- ~~Ventana del ranking~~ **12 meses, por reemplazo de casillero**
- ~~Cómputo de W.O.~~ **6-0 6-0 a favor del rival**
- ~~¿Un torneo es multisede?~~ **Sí en fase de grupos** (cada partido donde quieran), sede única en eliminatorias
- ~~¿El padrón tiene teléfono?~~ Irrelevante en POLENTA: usa `modo_inscripcion: cerrada`, sin registro abierto
- ~~¿Puede alguien de afuera inscribirse a un torneo de POLENTA?~~ **No**, porque POLENTA usa `modo_inscripcion: cerrada`. Pero la plataforma soporta torneos abiertos y con aprobación para otros circuitos
- ~~¿Inscribirse suma puntos al ranking?~~ **No.** Los puntos los da la instancia alcanzada al cerrar el torneo
- ~~¿Cómo aparece un jugador nuevo en el ranking?~~ Entra al padrón con 0 puntos y sube al jugar. No hay un acto de "agregarse al ranking"
- ~~Tabla de puntos: ¿fija o configurable?~~ **Configurable por organización** ([07](07-configurabilidad.md) §1)
- ~~¿La foto del partido es obligatoria?~~ **No.** Es regla interna de POLENTA. El sistema permite adjuntar fotos, opcionalmente
- ~~¿El modelo de ranking por casilleros es una particularidad de POLENTA?~~ **No.** Es el modelo de la ATP: ventana rodante con reemplazo al volver el torneo

---

## Preguntas pendientes para el organizador

Lista para llevar a la próxima charla. Las respondidas se tachan.

### Ranking y categorías

1. **Cambio de categoría:** si un jugador de Tercera pasa a Segunda, ¿qué pasa con sus puntos de Tercera? ¿Quedan congelados, siguen envejeciendo por reemplazo de casillero, o el jugador sale de esa tabla?
   *Contexto: el reglamento dice que cada categoría tiene ranking independiente y que se acumulan puntos solo en la categoría que se juega, pero no aclara qué pasa con los puntos previos.*
2. ¿Es común que alguien cambie de categoría a mitad de año?
3. El ranking del PDF tiene 5 casilleros e incluye "Pretemporada", pero mencionaste 4 torneos + Master. ¿Pretemporada **es** el Master?

### Inscripción y padrón

4. ¿Alguna vez alguien de afuera del grupo quiso anotarse a un torneo? ¿Cómo lo manejaron?
5. **Pedir el Excel del ranking** en su formato original, no el PDF. Define qué columnas tiene y qué tan sucio viene.
6. ¿Estarías dispuesto a cargar el DNI de los jugadores en el padrón, o preferís que el sistema no lo pida?

### Organización del torneo

7. ¿Qué modo de sorteo prefieren: que el sistema sortee solo, que sortee en pantalla durante la reunión, o cargar a mano el resultado del sorteo físico?
8. ¿Desde qué instancia paga las canchas la organización? El reglamento dice "fases de Campeonato y Complementaria", pero mencionaste cuartos en una respuesta y octavos en otra.

### Resultados

9. **Pedir capturas reales del grupo de WhatsApp** donde llegan los resultados (con los datos personales difuminados). Define qué tendría que entender el modelo de IA.

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| **78 partidos por torneo y dos cuadros paralelos.** El motor de competencia es más grande de lo estimado | Priorizar Campeonato; Complementaria como incremento posterior (decisión abierta 4). Es parámetro del torneo, no supuesto fijo |
| **Sobregeneralizar la configurabilidad** y no llegar a noviembre | [07](07-configurabilidad.md) fija el límite: solo se parametriza lo barato y lo que varía de verdad |
| Partidos que nunca se coordinan y bloquean el cierre de la zona | Tablero de avance con alertas de plazo; W.O. según reglamento |
| Los webhooks de MercadoPago necesitan URL pública | ngrok en desarrollo; verificar antes de la demo |
| Sobreventa de cupos por concurrencia | Reserva con vencimiento + lista de espera |
| La demo depende de una cuenta de Neon externa | `docker-compose` con Postgres local, autosuficiente |
| El insumo de la extracción de resultados no está confirmado | El desarrollo es el mismo para captura, foto o texto libre. Las otras dos funcionalidades de IA no dependen de esto |
| Exposición de datos de contacto en pantallas públicas | Ninguna vista pública incluye teléfono ni email |

---

## Glosario

| Término | Significado |
|---|---|
| **Etapa** | Torneo estacional del circuito (Primavera, Verano, Pretemporada, Otoño, Invierno) |
| **Zona / grupo** | Grupo de 4 jugadores que juegan todos contra todos en la primera fase |
| **Campeonato** | Cuadro eliminatorio de los 2 primeros de cada zona |
| **Complementaria** | Cuadro eliminatorio de los 2 últimos de cada zona |
| **Cabeza de serie** | Jugador mejor rankeado de cada grupo |
| **Casillero** | Posición del ranking correspondiente a una etapa; se reemplaza cada año |
| **Punto de oro** | Punto único que define el game al llegar a 40-40, sin ventajas |
| **Super tie-break** | Tie-break a 10 puntos que reemplaza al tercer set |
