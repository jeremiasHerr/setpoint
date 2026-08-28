# Flujo de la organización (web)

> Reglas de negocio en [02-dominio.md](02-dominio.md).

---

## 1. Roles y entidades

### Con cuenta de usuario

| Rol | Accede desde | Responsabilidad |
|---|---|---|
| **Organización** | Web | Padrón, torneos, sorteo, resultados, cierre |
| **Jugador** | App móvil | Se inscribe, paga, coordina fechas, consulta |

Solo dos roles con autenticación.

### Sin cuenta

| Entidad | Qué es |
|---|---|
| **Club / sede** | Dirección y canchas. Dato, no usuario |
| **Jugador (perfil de padrón)** | La persona en el padrón. Existe sin cuenta |

El sistema es **multi-organización**: `organizacion_id` es la clave de aislamiento de torneos, categorías, rankings, padrón y liquidaciones. Debe estar en el schema desde el primer día.

Un club puede alojar torneos de circuitos distintos, y una organización rota entre varios clubes.

---

## 2. Ciclo de vida del torneo

```
borrador → publicado → inscripciones_cerradas → zonas_generadas
        → grupos_en_curso → campeonato_y_complementaria → finalizado
```

| Estado | Se entra cuando | Qué se puede hacer |
|---|---|---|
| `borrador` | Se crea el torneo | Editar todo. No visible |
| `publicado` | La organización lo publica | Inscripciones abiertas |
| `inscripciones_cerradas` | Se llena el cupo o vence la fecha | Revisar padrón, resolver lista de espera |
| `zonas_generadas` | Se ejecuta el sorteo | Comunicar grupos y plazos |
| `grupos_en_curso` | Arranca el plazo de 3 semanas | Cargar resultados de zona |
| `campeonato_y_complementaria` | Cierran todas las zonas | Ambos cuadros en juego, 1 semana por ronda |
| `finalizado` | Se definen ambos campeones | Solo lectura. Se impactan los puntos |

> **Nota:** a diferencia de versiones anteriores, la organización **no paga** por publicar un torneo. El modelo de ingresos del circuito son las inscripciones de los jugadores.

---

## 3. Alta de la organización

Registro con email y contraseña. Se configura:

- Nombre del circuito y datos de contacto
- **Categorías propias** (en POLENTA: Segunda y Tercera)
- **Etapas del calendario** (Primavera, Verano, Pretemporada, Otoño, Invierno) — definen los casilleros del ranking
- Tabla de puntos por instancia
- Clubes con los que trabaja

---

## 4. Alta de clubes y canchas

Nombre, dirección y canchas con superficie. Alta de datos, sin usuario asociado.

Para las fases eliminatorias, el torneo declara su **sede designada**. En fase de grupos no hace falta: cada partido se juega donde acuerden los jugadores.

---

## 5. Gestión del padrón

La organización es dueña de su padrón. En modo `cerrada` —el que usa POLENTA— es además la única vía de alta; en modo `abierta` los jugadores se agregan solos al inscribirse ([07-configurabilidad.md](07-configurabilidad.md) §2.5). En todos los modos, la organización puede:

- Alta manual de jugadores
- **Importación desde Excel** con normalización y resolución de identidad ([06-ia.md](06-ia.md) §1)
- Asignación y reasignación de categoría
- Baja o desactivación

El padrón actual de POLENTA tiene 77 jugadores en 2 categorías.

---

## 6. Creación del torneo

El formulario replica la convocatoria que hoy publican en WhatsApp ([02](02-dominio.md) §12):

- Nombre y descripción
- **Etapa del calendario** — define qué casillero del ranking se actualiza
- Categorías a disputar y cupo de cada una
- Importe de inscripción
- **Formato**: cantidad de grupos, clasificados por grupo, si hay zona Complementaria, modo de distribución y modo de sorteo
- **Sistema de juego**: sets, punto de oro, super tie-break
- Fecha de cierre de inscripción
- **Cronograma por instancia**
- Sedes: libre o designada, por fase

> Todos los valores por defecto salen de la configuración de la organización. El listado completo de parámetros está en [07-configurabilidad.md](07-configurabilidad.md).

---

## 7. Gestión de inscripciones

Panel con el padrón en vivo: confirmados, pendientes de pago, cupo restante y **lista de espera**.

Funciones:

- Inscribir manualmente a quien pagó por fuera del sistema
- Dar de baja y **promover automáticamente al primero de la lista de espera**
- Enviar recordatorio a quienes no completaron el pago
- Cerrar inscripciones

La lista de espera se ordena **por orden de llegada** y cubre deserciones, replicando la regla actual del reglamento.

---

## 8. Sorteo y generación de zonas

Dos parámetros independientes ([07-configurabilidad.md](07-configurabilidad.md) §2.1):

- **`modo_distribucion`** — cómo se reparten los jugadores: `serpentina`, `directa` o `bombos`
- **`modo_sorteo`** — quién lo ejecuta: `automatico`, `asistido` (en pantalla, para proyectar) o `manual` (la organización carga el resultado del sorteo físico)

El sistema genera los grupos y los partidos de zona. La organización puede revisar antes de confirmar.

**Si hay zona Complementaria** (parámetro del torneo), se reserva desde el sorteo la estructura de ambos cuadros.

---

## 9. Seguimiento: tablero de avance

Pantalla central durante el torneo. Por grupo muestra:

- Partidos jugados, con fecha acordada, y sin coordinar
- Días restantes del plazo
- Alertas de partidos en riesgo de vencimiento
- Tabla de posiciones en vivo con la línea de corte marcada

Reemplaza el trabajo actual de revisar el grupo de WhatsApp a mano.

---

## 10. Carga de resultados

**La carga es responsabilidad de la organización.** Los jugadores no cargan resultados ([04-flujo-jugador.md](04-flujo-jugador.md) §2).

Por partido: sets, games, tie-breaks y ganador, validado contra el sistema de juego configurado en el torneo ([07-configurabilidad.md](07-configurabilidad.md) §2.2).

**Fotos del partido:** se pueden adjuntar, de forma opcional. Si el reglamento de un circuito las exige, es su regla, no del sistema. Cuando están, alimentan la crónica.

Al guardar:

- Se recalcula la tabla de posiciones de la zona con la cascada de desempates
- Si era de cuadro, el ganador avanza a la siguiente ronda del cuadro que corresponda
- Se dispara la generación de la crónica ([06-ia.md](06-ia.md) §3)

**Partidos no jugados en plazo:** no se resuelven con regla automática. El sistema presenta el caso con el historial de coordinación y la organización decide W.O., doble W.O. o extensión. El W.O. se registra como **6-0 6-0**.

---

## 11. Cierre de fase de grupos

Al completarse las zonas, el sistema:

1. Ordena cada grupo con la cascada de desempates
2. Manda los N primeros de cada grupo al cuadro **Campeonato** (N configurable; en POLENTA, 2)
3. **Si el torneo tiene zona Complementaria**, manda al resto a ese segundo cuadro
4. Genera los cuadros correspondientes

Cuando hay dos cuadros, corren en paralelo con el mismo plazo por ronda.

---

## 12. Cierre del torneo

Con ambos campeones definidos, la organización cierra el torneo. El sistema:

- Genera los `MovimientoRanking` según instancia alcanzada
- **Reemplaza el casillero de esa etapa** en el ranking de cada jugador
- Genera el resumen narrativo del torneo
