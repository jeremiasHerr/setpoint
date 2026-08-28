# Visión y posicionamiento

## 1. El pitch

> Hoy, organizar un torneo de tenis amateur significa esto: el cuadro y los horarios viven en un grupo de WhatsApp, donde se pierden entre veinte mensajes en media hora. El ranking está en un Excel en la computadora de una sola persona, que lo actualiza cuando puede. Los setenta y ocho resultados de cada torneo se leen del grupo y se transcriben a mano. Las inscripciones se cobran por transferencia: el jugador manda el comprobante, alguien lo verifica, alguien lo anota. Y cuando dos empatan en la zona, hay que ir al reglamento y hacer las cuentas de sets y games a mano.
>
> Nada de eso está mal por descuido. Está así porque no había otra herramienta.
>
> **Nuestra plataforma no reemplaza el WhatsApp: lo descarga.** El cuadro, los horarios y el ranking dejan de ser mensajes que se pierden y pasan a ser un link siempre disponible y siempre actualizado. El jugador entra desde el celular, ve cuándo juega, contra quién y dónde, sin preguntarle a nadie. La organización deja de ser el cuello de botella por el que pasa cada consulta.
>
> Las zonas se arman con siembra por ranking. Los desempates los resuelve un algoritmo con las reglas del reglamento escritas de antemano, no una discusión. Las inscripciones se cobran con MercadoPago y quedan conciliadas por torneo, con lista de espera incluida. Y el ranking se actualiza solo, con cada punto trazable hasta el partido que lo generó.
>
> **Para el jugador, la diferencia es tener su historial.** Cuántos partidos ganó, contra quién, cómo evolucionó en el año, si alguna vez le ganó al que le toca el sábado. Eso hoy no existe en ningún lado: se pierde apenas termina el torneo.
>
> No inventamos el problema. Circuitos con veinticinco años de trayectoria ya lo resolvieron para la web de escritorio, y ninguno tiene una app instalable. Ahí es donde entramos.

---

## 2. El problema, en concreto

Datos reales del circuito POLENTA, que es nuestro cliente:

| Dolor actual | Cómo se resuelve hoy |
|---|---|
| Ranking de 77 jugadores en 2 categorías | Planilla Excel manual, actualizada por una persona |
| 78 resultados por torneo | Se leen del grupo de WhatsApp y se anotan a mano |
| Coordinación de fechas entre jugadores | Mensajes en el grupo, que hay que registrar manualmente |
| Cobro de inscripciones a $45.000 | Transferencia + comprobante + verificación manual |
| Cupos y lista de espera | Se lleva de memoria o en una lista aparte |
| Desempates de zona | Cálculo manual de sets y games contra el reglamento |
| Consulta "¿cuándo juego?" | Preguntarle al organizador |

Cada fila es una funcionalidad del sistema.

---

## 3. Relevamiento de plataformas existentes

| Plataforma | Escala | Modelo de acceso | Móvil |
|---|---|---|---|
| **Circuito Tenis** (AAT amateur, desde 2001) | 13 niveles, múltiples sedes, ~20k jugadores | Ficha de jugador y head-to-head **públicos**, búsqueda por apellido. Login solo para inscribirse | Web de escritorio, sin app |
| **Set and Match** (AR) | 2 clubes, +100 jugadores | Ficha, ranking y agenda accesibles desde el celular sin instalar nada | PWA instalable, sin app nativa |
| **TENIO** (AR) | Directorio público de circuitos | El jugador se registra solo y se une a un circuito | Web |

### Conclusiones

**1. Ninguna exige cuenta para consultar.** Las tres resuelven la lectura sin autenticación. Esto valida el principio de diseño de [04-flujo-jugador.md](04-flujo-jugador.md): leer es público, escribir requiere cuenta.

**2. Ninguna tiene app nativa instalable.** Es el hueco de mercado, y coincide con lo que la cátedra exige a los grupos de tres. Set and Match, que es la más moderna, resolvió el móvil con una PWA.

**3. Circuito Tenis publica crónicas automáticas de partidos amateur**, varias por día, y ocupan la mitad de su portada. Confirma que el resumen narrativo no es un adorno sino un motor de enganche.

**Dato adicional:** TENIO arma sus grupos por *snake draft*, es decir distribución serpentina. Coincide con la preferencia del organizador de POLENTA.

---

## 4. Diferenciadores

| | Nosotros | Competencia |
|---|---|---|
| App instalable (APK) | ✓ | Ninguna |
| Consulta sin cuenta | ✓ | ✓ |
| Cobro integrado | ✓ | Parcial |
| Coordinación de partidos entre jugadores | ✓ | No |
| Crónicas automáticas | ✓ | Solo Circuito Tenis |
| Importación de padrones existentes | ✓ | No |

Los tres últimos son los que se apoyan en IA y están detallados en [06-ia.md](06-ia.md).

---

## 4.1 Multi-organización

El sistema no está hecho para POLENTA: está hecho para circuitos amateur, y POLENTA es el **cliente de validación**. El formato de torneo, el sistema de juego, la tabla de puntos, los plazos y el modo de sorteo son parámetros, no supuestos.

El modelo de ranking, en particular, replica el de la **ATP** — ventana rodante con reemplazo de puntos al volver el torneo — parametrizado en cantidad de etapas, ventana temporal y tabla de puntos.

Detalle completo en [07-configurabilidad.md](07-configurabilidad.md).

---

## 5. Cumplimiento del enunciado de la materia

| Requisito | Cómo se cumple |
|---|---|
| Aplicación web con BD relacional | React + Express + PostgreSQL |
| Framework de backend | Express + Prisma |
| Framework JavaScript en frontend | React |
| Autenticación de usuarios | JWT, con roles organización y jugador |
| **App móvil instalable** (obligatoria para grupos de 3) | React Native + Expo, build APK |
| **Integración de IA significativa** (novedad 2026) | Tres funcionalidades — ver [06-ia.md](06-ia.md) |
| **Entrega dockerizada** (novedad 2026) | `docker-compose` autosuficiente con Postgres local |
| Necesidad claramente identificada | Cliente externo real: POLENTA Team Tenis |
