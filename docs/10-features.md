# Lista de funcionalidades (features)

**Segunda entrega — Trabajo Final 2026**
Proyecto: SetPoint — Plataforma de gestión de torneos de tenis amateur
Cliente: POLENTA Team Tenis

> **Borrador para revisión del grupo.** Una vez aprobado, se vuelca a la planilla con las columnas del template: Número, Título, Descripción, Entrega, Cumplido, Notas de la Cátedra.

---

## Resumen de entregas

| Entrega | Fecha aprox. | Features | Foco |
|---|---|---|---|
| 25% | Fin de septiembre | F01, F02, F04, F14 | Núcleo administrativo y ranking público |
| 50% | Mediados de octubre | F07, F09, F10, F11, F15, F17, F21 | Motor de competencia, torneo en vivo y app móvil |
| 75% | Principios de noviembre | F03, F05, F06, F08, F12, F13 | Inscripciones, pagos y coordinación |
| 100% | Mediados de noviembre | F16, F18, F19, F20 | Funcionalidades asistidas por IA |

---

## F01 — Alta de la organización y configuración opcional del circuito

La organización podrá registrarse y empezar a usar el sistema sin configurar nada: alcanza con crear un torneo. Si además administra un circuito con ranking anual, podrá definir sus categorías, las etapas de su calendario y la tabla de puntos que otorga cada instancia. Esa configuración es opcional y se puede activar más adelante.

**Precisiones de alcance:**
- Una organización puede correr torneos sueltos sin ranking, y activar el ranking después.
- Las categorías son propias de cada circuito; POLENTA usa Segunda y Tercera.
- Las etapas del calendario definen los casilleros del ranking anual y solo hacen falta si se usa ranking.
- La tabla de puntos es editable: campeón, finalista, semifinalista, cuartos, octavos y participación.
- Opcionalmente puede registrar los clubes donde suele jugar, con sus canchas y superficies, para habilitar estadísticas por superficie.

**Entrega: 25%**

---

## F02 — Gestión del padrón de jugadores

La organización podrá administrar la lista de jugadores que integran su circuito: darlos de alta, editar sus datos, asignarles categoría y darlos de baja. El padrón es la base sobre la que se construyen las inscripciones, el ranking y el historial, y cada organización administra el suyo sin ver el de las demás.

**Precisiones de alcance:**
- Un jugador nuevo ingresa con cero puntos y sube al ir jugando torneos.
- La organización puede reasignar la categoría de un jugador cuando corresponda.
- Un mismo jugador puede pertenecer a varios circuitos, con ranking independiente en cada uno.
- El padrón puede ser cerrado, con aprobación previa o abierto, según lo defina la organización. En modo abierto, quien se inscribe sin estar en el padrón se incorpora automáticamente con cero puntos.
- Cuando un jugador crea su cuenta, el sistema le ofrece vincularla con su perfil del padrón para recuperar su historial y sus puntos. La organización puede revisar y revertir esas vinculaciones.

**Entrega: 25%**

---

## F03 — Importación inteligente del padrón desde planilla

La organización podrá cargar su ranking histórico subiendo la planilla de cálculo que ya utiliza, sin necesidad de tipear jugador por jugador. El sistema interpreta la estructura de la planilla aunque las columnas tengan nombres distintos a los esperados, reconoce a los jugadores que ya existen aunque su nombre esté escrito de otra forma, y presenta una pantalla de revisión donde la organización confirma antes de que se guarde nada.

**Precisiones de alcance:**
- Reconoce automáticamente qué columna corresponde a cada etapa del ranking.
- Detecta que "J. Pérez", "Juan Perez" y "PEREZ, Juan" son la misma persona.
- Informa cuántos jugadores ya existían y cuántos son nuevos antes de confirmar.
- Descarta filas que no son jugadores, como totales o encabezados repetidos.
- La importación es repetible: se puede volver a subir la planilla cada vez que haya altas.

**Funcionalidad asistida por IA. Entrega: 75%**

---

## F04 — Creación y convocatoria de torneos

La organización podrá crear un torneo definiendo toda la información que hoy publica en su convocatoria: nombre, etapa del calendario, categorías a disputar, cupo de cada una, importe de inscripción, formato de juego, fecha de cierre de inscripción y cronograma de fechas por instancia. Una vez publicado, el torneo queda visible para los jugadores.

**Precisiones de alcance:**
- El formato es configurable: cantidad de grupos, clasificados por grupo y si se juega o no zona Complementaria.
- El sistema de juego se parametriza: cantidad de sets, punto de oro, super tie-break.
- Se definen los plazos de cada instancia, por ejemplo tres semanas para la fase de grupos y una semana por ronda eliminatoria.
- **Un torneo puede ser suelto o formar parte de un circuito con ranking.** Si es suelto, el resultado son las posiciones finales de ese torneo y no hace falta configurar etapas ni puntos.
- La sede puede quedar a libre elección de los jugadores, escribiendo el nombre del lugar, o elegirse de la lista de clubes que la organización haya cargado.

**Entrega: 25%**

---

## F05 — Inscripción y pago desde el celular

El jugador podrá inscribirse a un torneo y abonar la inscripción desde su teléfono, sin necesidad de transferir por fuera del sistema ni enviar comprobantes. Al confirmarse el pago, su lugar en el torneo queda asegurado automáticamente y tanto él como la organización lo ven reflejado al instante.

**Precisiones de alcance:**
- El lugar se reserva por quince minutos mientras se completa el pago.
- Si el pago no se concreta en ese plazo, el lugar se libera para otro jugador.
- La inscripción se confirma sola: nadie tiene que verificar comprobantes a mano.
- El jugador no necesita crear una cuenta previa para inscribirse.
- Si el cupo está completo, puede anotarse en la lista de espera.

**Entrega: 75%**

---

## F06 — Administración de inscripciones y lista de espera

La organización podrá seguir el estado de las inscripciones de cada torneo en tiempo real: quiénes confirmaron, quiénes tienen el pago pendiente, cuántos lugares quedan y quiénes están en lista de espera. También podrá inscribir manualmente a quien haya pagado por fuera del sistema y dar de baja a quien se arrepienta, liberando el cupo automáticamente.

**Precisiones de alcance:**
- La lista de espera se ordena por orden de llegada y cubre las bajas automáticamente.
- Al liberarse un lugar, el primero de la lista recibe aviso y puede completar su pago.
- Permite registrar pagos en efectivo o por transferencia hechos fuera del sistema.
- Ante una baja, el sistema deja registrada la cancelación y si corresponde devolución, pero **el movimiento de dinero lo realiza la organización por fuera del sistema**. La política de reembolsos es del circuito, no de la plataforma.
- Muestra la conciliación del torneo: cuánto se recaudó, cuánto corresponde a la organización y qué devoluciones quedaron pendientes.

**Entrega: 75%**

---

## F07 — Sorteo y armado de zonas

Con las inscripciones cerradas, el sistema distribuirá a los jugadores en grupos usando el ranking vigente, de modo que todos los grupos queden con un nivel equivalente, y generará automáticamente todos los partidos de la fase de grupos. La organización revisa el resultado antes de confirmarlo y publicarlo.

**Precisiones de alcance:**
- La distribución por serpentina reparte a los jugadores de manera que todos los grupos sumen el mismo ranking acumulado.
- En torneos sin ranking, el orden de siembra lo define la organización manualmente o se sortea al azar.
- La organización puede elegir entre distribución serpentina, directa o por bombos.
- También puede cargar a mano el resultado de un sorteo hecho presencialmente, para circuitos que lo hacen como ceremonia.
- Con treinta y dos jugadores en ocho grupos de cuatro se generan cuarenta y ocho partidos de zona.

**Entrega: 50%**

---

## F08 — Coordinación de partidos entre jugadores

Los jugadores podrán registrar en el sistema la fecha, hora y club acordados para cada uno de sus partidos, y el rival confirmará que está al tanto. Cada uno ve en todo momento qué partidos le faltan jugar y cuánto tiempo le queda del plazo de la instancia.

**Precisiones de alcance:**
- Cualquiera de los dos jugadores puede cargar la fecha acordada; el otro la confirma.
- **Requiere que el jugador tenga cuenta**, ya que está registrando información en nombre de su perfil. La cuenta se ofrece al terminar el pago de la inscripción y se crea en un paso.
- **Ningún jugador queda bloqueado por no tener cuenta:** la organización siempre puede cargar la fecha en su nombre.
- En fase de grupos los jugadores eligen dónde jugar; en las eliminatorias la sede la fija la organización.
- Se admite una sola reprogramación por partido, con veinticuatro horas de anticipación.
- Un partido que llega al vencimiento del plazo sin jugarse queda señalado para que la organización resuelva.

**Entrega: 75%**

---

## F09 — Carga de resultados

La organización podrá registrar el resultado de cada partido indicando los games de cada set y el ganador. Al guardarse, el sistema actualiza inmediatamente todo lo que dependa de ese resultado: la tabla de posiciones del grupo o el avance del jugador a la siguiente ronda del cuadro.

**Precisiones de alcance:**
- Contempla partidos definidos por super tie-break en lugar de tercer set.
- Contempla walkover y abandono, que se registran como seis a cero en ambos sets.
- Permite corregir un resultado ya cargado, revirtiendo sus efectos sobre tablas y cuadros.
- Se pueden adjuntar fotos del encuentro de forma opcional.
- Cada circuito define si los resultados los carga únicamente la organización o si también pueden cargarlos los jugadores con confirmación del rival.

**Entrega: 50%**

---

## F10 — Clasificación automática y desempates

El sistema ordenará automáticamente la tabla de posiciones de cada grupo aplicando los criterios de desempate del reglamento del circuito, sin que nadie tenga que hacer cuentas de sets y games a mano. La tabla se actualiza con cada resultado cargado y muestra con claridad quiénes están clasificando.

**Precisiones de alcance:**
- Los criterios se aplican en cascada: partidos ganados, sets ganados, diferencia de sets, games ganados, diferencia de games y enfrentamiento directo.
- Vale el primer criterio que rompa la igualdad.
- El super tie-break se computa como un set y además como un game; el tie-break, como un game.
- El mismo procedimiento resuelve comparaciones entre grupos, por ejemplo para definir el mejor tercero.

**Entrega: 50%**

---

## F11 — Cuadros de Campeonato y Complementaria

Al terminar la fase de grupos, el sistema armará automáticamente los cuadros eliminatorios ubicando a cada jugador según su posición en la zona. Los mejores de cada grupo van al cuadro Campeonato y el resto al cuadro Complementaria, de modo que todos los inscriptos sigan compitiendo. Cada resultado hace avanzar al ganador a la ronda siguiente sin intervención manual.

**Precisiones de alcance:**
- Ambos cuadros funcionan en paralelo y cada uno define su propio campeón.
- La cantidad de clasificados por grupo a cada cuadro es configurable.
- La zona Complementaria puede desactivarse para circuitos que no la utilicen.
- Con treinta y dos inscriptos se generan quince partidos en cada cuadro.

**Entrega: 50%**

---

## F12 — Tablero de seguimiento del torneo

La organización dispondrá de una pantalla única donde ver el avance completo del torneo: qué partidos ya se jugaron, cuáles tienen fecha acordada, cuáles todavía no coordinó nadie y cuántos días quedan de cada plazo. Reemplaza el trabajo actual de revisar conversaciones para saber cómo viene cada zona.

**Precisiones de alcance:**
- Señala los partidos en riesgo de vencer sin haberse jugado.
- Muestra el estado de cada grupo con su tabla de posiciones en vivo.
- Permite resolver los partidos vencidos otorgando el walkover que corresponda.
- Ofrece una vista general del torneo y otra en detalle por grupo.

**Entrega: 75%**

---

## F13 — Cierre de torneo y actualización del ranking

Al definirse los campeones, la organización cerrará el torneo y el sistema otorgará automáticamente los puntos que corresponden a cada jugador según la instancia que alcanzó, actualizando el ranking del circuito. Los puntos reemplazan a los obtenidos en la misma etapa del año anterior, tal como funciona hoy la planilla.

**Precisiones de alcance:**
- En torneos sueltos sin ranking, el cierre produce la tabla de posiciones finales del torneo y no otorga puntos.
- Cada jugador puede ver de qué torneo salió cada uno de sus puntos.
- Los jugadores que completan la fase de grupos sin clasificar a Campeonato reciben los puntos de participación.
- Si se corrige un resultado después del cierre, el ranking se recalcula.
- Cada categoría mantiene su ranking independiente.

**Entrega: 75%**

---

## F14 — Consulta pública del ranking

Cualquier persona podrá consultar el ranking del circuito desde un enlace, sin necesidad de crear cuenta ni instalar nada. La organización comparte el enlace por su canal habitual y los jugadores acceden a la tabla actualizada, con el mismo detalle por etapa que hoy tiene la planilla que se pasan por mensaje.

**Precisiones de alcance:**
- El ranking se muestra por categoría, con el desglose de puntos que aportó cada etapa.
- Se puede buscar a un jugador por apellido para ver su posición.
- Ninguna pantalla pública muestra datos de contacto de los jugadores.
- La información se actualiza sola a medida que se cierran torneos, sin que nadie edite una planilla.

**Entrega: 25%**

---

## F15 — Ficha e historial del jugador

Cada jugador tendrá una ficha con su historial completo: todos los partidos que jugó, con qué resultado, en qué torneo y en qué instancia, además de su evolución en el ranking a lo largo del tiempo. Es información que hoy se pierde al terminar cada torneo.

**Precisiones de alcance:**
- Muestra estadísticas acumuladas: partidos jugados, ganados y perdidos.
- Incluye los torneos disputados y la instancia alcanzada en cada uno.
- Muestra la evolución de sus puntos etapa por etapa.
- Es de acceso público, sin necesidad de cuenta.

**Entrega: 50%**

---

## F16 — Comparativa entre jugadores

Cualquier persona podrá comparar a dos jugadores del circuito y ver el historial de enfrentamientos entre ambos: cuántas veces jugaron, quién ganó cada partido y en qué torneo fue. Antes de un partido, cada jugador puede consultar cómo le fue históricamente contra ese rival.

**Precisiones de alcance:**
- Muestra el resultado acumulado del cruce, por ejemplo tres a dos.
- Detalla cada enfrentamiento con su resultado, torneo e instancia.
- Permite filtrar el rendimiento según la superficie de la cancha.
- Se accede desde la ficha de cualquier jugador o desde un buscador por apellido.

**Entrega: 100%**

---

## F17 — Mis partidos y avisos en el celular

El jugador dispondrá de una aplicación instalable en su teléfono donde ver sus próximos partidos con rival, club, día y horario, además de los partidos que todavía tiene pendientes de coordinar. La aplicación le avisa cuando se publica el fixture, cuando su rival confirma una fecha y cuando se acerca un partido.

**Precisiones de alcance:**
- Es una aplicación instalable, no un sitio web abierto en el navegador.
- Muestra la tabla de posiciones de su zona y su posición respecto del corte de clasificación.
- Permite consultar el ranking, los cuadros y su historial desde el teléfono.
- Los avisos llegan como notificaciones del teléfono, sin necesidad de abrir la aplicación.

**Entrega: 50%**

---

## F18 — Crónicas automáticas de partidos

Al cargarse el resultado de un partido, el sistema generará automáticamente una breve crónica en estilo periodístico que describe cómo se desarrolló el encuentro, qué significó para el torneo y qué implica para el ranking de los protagonistas. Al cerrar el torneo se genera además un resumen general.

**Precisiones de alcance:**
- Aprovecha el historial entre ambos jugadores y su posición en el ranking para dar contexto.
- Si el partido tiene fotos adjuntas, se incluyen en la crónica.
- Las crónicas son públicas y se pueden compartir por enlace.
- La organización puede editarlas o eliminarlas antes de que se publiquen.

**Funcionalidad asistida por IA. Entrega: 100%**

---

## F19 — Registro de resultados a partir de mensajes

La organización podrá cargar varios resultados de una sola vez a partir de los mensajes que los jugadores ya envían por su canal habitual, en lugar de transcribirlos uno por uno. El sistema interpreta los mensajes, identifica de qué partido se trata y cuál fue el resultado, y presenta todo en una pantalla de confirmación antes de guardar.

**Precisiones de alcance:**
- Interpreta mensajes escritos de forma libre, con o sin guiones, en primera persona o en tercera.
- Distingue qué mensajes son resultados y cuáles son conversación.
- Reconoce situaciones especiales como abandonos o partidos definidos por super tie-break.
- Nada se guarda sin que la organización lo confirme.
- Si no logra interpretar un mensaje, ese partido queda para carga manual sin bloquear a los demás.

**Funcionalidad asistida por IA. Entrega: 100%**

---

## F20 — Proyecciones de ranking

Antes y durante el torneo, cada jugador podrá ver cuántos puntos sumaría y qué posición alcanzaría en el ranking según hasta dónde llegue en el cuadro. Permite entender qué está en juego en cada partido.

**Precisiones de alcance:**
- Calcula el escenario para cada instancia posible: octavos, cuartos, semifinal, final y título.
- Considera el reemplazo de los puntos obtenidos en la misma etapa del año anterior.
- Muestra la posición estimada en el ranking en cada escenario.
- Se accede desde la ficha del jugador y desde la vista del torneo.

**Funcionalidad asistida por IA. Entrega: 100%**

---

## F21 — Consulta pública del torneo en vivo

Cualquier persona podrá seguir el desarrollo de un torneo desde un enlace, sin cuenta ni instalación: las tablas de posiciones de cada zona, los cuadros de Campeonato y Complementaria, y el calendario de partidos con fecha, hora y lugar. La información se actualiza a medida que se cargan los resultados.

**Precisiones de alcance:**
- Las tablas de zona muestran con claridad quiénes están clasificando a cada cuadro.
- Los cuadros se recorren visualmente y muestran el avance ronda por ronda.
- El calendario lista los partidos acordados por fecha, para saber qué se juega cada día.
- Es la pantalla que la organización comparte en su grupo, reemplazando el envío de imágenes del cuadro.
- Ninguna pantalla pública muestra datos de contacto de los jugadores.

**Entrega: 50%**


---

## Notas para el grupo

**Cantidad.** Veintiuna features es adecuado para un producto con web, aplicación móvil e integración de inteligencia artificial. Si la cátedra las considera demasiado granulares, las candidatas naturales a fusionarse son F15 con F16, y F09 con F10.

**F14 y F21.** Se separaron a propósito. F14 depende únicamente del padrón, así que es demostrable en la primera entrega. F21 muestra zonas, cuadros y calendario, que solo existen una vez implementados el sorteo y los cuadros, y por eso acompaña a esa entrega. Agruparlas habría significado prometer para septiembre algo que depende de features de octubre.

**Torneos sueltos.** Varias features contemplan el caso de una organización que quiere probar la plataforma con un único torneo, sin configurar un circuito con ranking. Es la puerta de entrada al producto y evita que el primer uso exija media hora de configuración.

**Riesgo de alcance.** F11 —los dos cuadros en paralelo— es la feature más pesada del proyecto. Si el cronograma se complica, la zona Complementaria puede desactivarse por configuración y entregarse solo el cuadro Campeonato, sin modificar ninguna otra feature.

**Redacción.** Todas están escritas de modo que puedan validarse mostrándolas funcionando, sin conocimiento técnico. Conviene que el organizador del circuito las lea antes de la entrega: si hay alguna que no entiende, está mal redactada.

**Columna "Cumplido".** Se completa a medida que avanza el proyecto. La cátedra usa esta planilla para hacer seguimiento durante toda la materia, así que conviene mantenerla actualizada en cada entrega parcial.
