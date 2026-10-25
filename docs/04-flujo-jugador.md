# Flujo del jugador

> Reglas de negocio en [02-dominio.md](02-dominio.md).

---

## 1. Principio: mirar, inscribirse y pagar no piden cuenta

| Sin cuenta | Con cuenta |
|---|---|
| Ver el ranking, las fichas, el historial, los cuadros, las zonas y el calendario | Coordinar las fechas de sus partidos |
| Inscribirse a un torneo | Cargar y confirmar resultados, si la organización lo permite (`quien_carga_resultados`, decisión abierta 12 del [README](README.md)) |
| Pagar la inscripción | Recibir avisos en el celular |
| | Inscribirse con un toque en cualquier circuito |

**Mirar no pide cuenta.** Las páginas públicas se abren por link: la organización comparte la URL en el grupo de WhatsApp donde ya se comunican, el jugador la toca y ve lo que necesita.

**Inscribirse y pagar tampoco.** El jugador se identifica con su DNI y deja un email para el comprobante ([decisión 049](decisiones/049-identificacion-en-la-inscripcion.md)). La cuenta es opcional y se ofrece después del pago (§5.8).

**La cuenta es para lo que dura todo el torneo:** coordinar con el rival, recibir avisos y no volver a identificarse en cada inscripción.

> **Por qué:** el público del circuito es mayoritariamente gente adulta acostumbrada a coordinar por WhatsApp. Pedirles registro para ver su ranking, o como requisito para pagar, es fricción que abandonarían. La inscripción es lo que el jugador viene a hacer: no puede quedar trabada en una contraseña.
>
> Validado externamente: las tres plataformas relevadas ([01-vision.md](01-vision.md) §3) resuelven la consulta sin autenticación.

---

## 2. Principio de mínima carga

**Al jugador se le pide lo mínimo indispensable. Su trabajo es jugar.**

| Se le pide | No se le pide |
|---|---|
| Inscribirse y pagar — es lo que quiere hacer | Cargar resultados |
| Coordinar fecha con su rival — **ya lo hace hoy** por WhatsApp | Actualizar su perfil o su ranking |
| | Reclamar perfiles o verificar identidad |

La distinción clave: coordinar la fecha **no es carga nueva**. El reglamento ya obliga a registrar los turnos pactados en el grupo de WhatsApp; la app solo cambia dónde queda ese registro y lo vuelve consultable.

---

## 3. Pantallas públicas

| Pantalla | Contenido |
|---|---|
| Ranking del circuito | Tabla por categoría, con el desglose por torneo del calendario, como el Excel actual |
| Ficha del jugador | Historial de partidos, torneos disputados, evolución |
| Head-to-head | Comparación entre dos jugadores |
| Cuadros y zonas | Cuadro principal y, si hay, cuadro consuelo, en vivo |
| Calendario | Partidos acordados por fecha |

Se accede por link directo, sin sesión. **No exponen datos de contacto.** La búsqueda de jugador es **por apellido**, no un listado completo del padrón.

---

## 4. Cuenta y vinculación

En modo `cerrada` —el de POLENTA— **el jugador ya existe en el padrón antes de tener cuenta**. La vinculación con su perfil no ocurre al crear la cuenta sino **al inscribirse**: con su DNI, buscándose por su nombre o desde el link personal que le manda la organización (§5). En modo `abierta` el perfil se crea al inscribirse, con 0 puntos.

**La cuenta es opcional y nace después del primer pago.** El comprobante trae el link para crear la contraseña; la cuenta toma el nombre del perfil y el DNI y el email de la inscripción ([decisión 051](decisiones/051-identidad-en-la-cuenta.md)). No hay registro de jugadores por separado.

La organización **ve y puede revertir** las vinculaciones desde el padrón, y revisa solo las dudosas: los posibles homónimos (§5.9). En un circuito cerrado como POLENTA el riesgo es bajo —todos se conocen y nadie gana nada apropiándose del historial ajeno—; en un circuito abierto la revisión de la organización pasa a ser más relevante.

> **Estado:** el lado de la organización ya está en parte: el padrón marca los perfiles con cuenta y permite desvincularlos (`DELETE /jugadores/:id/cuenta`, [decisión 007](decisiones/007-vinculacion-de-cuentas-en-f02.md)). La identificación por DNI, el link personal, la revisión de homónimos y la cuenta desde el comprobante llegan con F12 ([decisiones 049 a 051](decisiones/049-identificacion-en-la-inscripcion.md)).

### 4.1 Ingreso a la app

Quien ya tiene cuenta entra a la app con su email y su contraseña, por `POST /api/auth/ingreso-jugador`, distinto del ingreso de la web ([decisión 039](decisiones/039-ingreso-del-jugador.md)). La misma cuenta puede administrar una organización desde la web y jugar desde la app.

- **Un perfil por circuito.** Si juega en varios, elige en cuál entrar y la app lo recuerda. Para cambiar, toca el nombre del circuito en el encabezado, donde también está "Cerrar sesión" ([decisión 040](decisiones/040-jugador-en-varios-circuitos.md)).
- **La sesión queda guardada en el celular**, cifrada, y dura 7 días como en la web ([decisión 041](decisiones/041-sesion-en-el-celular.md)).
- **Sin sesión, la app solo muestra el ingreso.** La consulta sin cuenta es la de la web, por link ([decisión 042](decisiones/042-la-app-sin-sesion.md)).
- **Quien solo administra** recibe un aviso para entrar por la web.

> **Estado:** implementado en la app para el 50%, con la cuenta de prueba del seed. Recuperar la contraseña desde la app todavía no: el link del mail abre la web.

> **Descartado:** verificación por SMS y flujo de reclamo de perfiles. Resolvían un riesgo bajo en los circuitos amateur, donde los jugadores se conocen (POLENTA: 77 personas), y la revisión de la organización ya cubre el caso raro.

---

## 5. Inscripción a un torneo

### 5.1 Quién puede inscribirse

Depende del `modo_inscripcion` del torneo ([07-configurabilidad.md](07-configurabilidad.md) §2.6). En POLENTA es `cerrada`: **solo jugadores que ya están en el padrón**.

Distinción importante que conviene no mezclar:

| | Quién |
|---|---|
| Ver ranking, cuadros y fichas | Cualquiera, sin cuenta |
| **Inscribirse a un torneo** | Quien está en el padrón (modo `cerrada`), con cuenta o sin ella |

Público para **leer** no es público para **inscribirse**. Y no pedir cuenta no es dejar entrar a cualquiera: en modo `cerrada`, quien no está en el padrón no se inscribe, tenga cuenta o no.

### 5.2 Cómo entra un jugador nuevo al circuito

Depende del modo. En `cerrada` —el de POLENTA— **lo agrega la organización**, no hay autoservicio. En `con_aprobacion`, entra al padrón cuando la organización aprueba su solicitud. En `abierta`, el perfil se crea al confirmarse el pago de su primera inscripción. El diagrama siguiente describe el modo `cerrada`.

```
La organización lo da de alta en el padrón (0 puntos)
        |
        v
Se inscribe a un torneo
        |
        v
Juega
        |
        v
Al cerrar el torneo, gana puntos según instancia alcanzada
        |
        v
Sube en el ranking
```

**Nunca hay un momento en que alguien "se agrega al ranking".** El ranking es consecuencia de haber jugado. Un jugador nuevo figura en la tabla con 0 puntos desde que está en el padrón, y sube cuando compite.

**Inscribirse no otorga puntos.** Los puntos los da la instancia alcanzada al cerrar el torneo. Alguien puede anotarse a cinco torneos y su ranking no se mueve hasta que juegue.

### 5.3 Principio: el DNI identifica, el email comunica

- **El DNI encuentra al jugador en el padrón.** Es único, no cambia y se sabe de memoria.
- **El email sirve para mandarle el comprobante y los avisos.**
- **Inscribirse y pagar no piden cuenta.** La cuenta es opcional y se ofrece después del pago.
- **Automático por excepción.** El caso normal no lo toca nadie; la organización solo revisa lo dudoso, como en la importación del padrón y la carga de resultados.

No es DNI *o* email: son los dos, cada uno para lo suyo ([decisión 049](decisiones/049-identificacion-en-la-inscripcion.md), que cierra la decisión abierta 8).

Hay tres formas de llegar a la inscripción, y las tres terminan igual (§5.8):

| Entrada | Cómo llega | Qué hace para identificarse |
|---|---|---|
| 1. Link del torneo | La organización lo comparte en el grupo | Escribe su DNI; la primera vez, se busca por su apellido |
| 2. Link personal | La organización se lo manda a él | Escribe su DNI y su email, sin buscarse |
| 3. Con cuenta | Toca el link de un torneo con la sesión iniciada | Nada, o un toque para confirmar quién es en un circuito nuevo |

### 5.4 Persona y perfil

**Distinción central: la persona (`Usuario`) y su perfil en cada circuito (`Jugador`) son entidades distintas** ([decisión 051](decisiones/051-identidad-en-la-cuenta.md)).

| Entidad | Qué es | Alcance | Cuándo existe |
|---|---|---|---|
| `Jugador` | El perfil del padrón: categoría, puntos, historial. **Es la entidad del dominio** | Uno por organización | Antes de que la persona toque nada. Lo crea la organización, o la inscripción en modo abierto |
| `Usuario` | La cuenta de la persona: nombre, DNI, email y contraseña | Global | Opcional, después del primer pago |

**La inscripción se vincula al `Jugador`, no al `Usuario`.** Por eso el flujo funciona sin cuenta: el `Jugador` ya existía en el padrón. Sin cuenta, el DNI y el email se guardan en el perfil; con cuenta, viven en la cuenta y la persona no los vuelve a cargar en otro circuito.

**Una cuenta, un perfil por organización.** Quien juega en dos circuitos tiene una cuenta y dos perfiles, cada uno con su categoría, sus puntos y su historial. Es lo que ya supone la app, que pregunta en qué circuito entra ([decisión 040](decisiones/040-jugador-en-varios-circuitos.md)).

**Por qué el perfil no se comparte entre organizaciones:**

- **Cada organización es dueña de su padrón.** Lo arma, cambia categorías, da de baja. Con un perfil compartido, lo que decide una cambiaría lo que ve la otra.
- **`organizacion_id` es la clave de aislamiento** de toda entidad del dominio. Un perfil global sería la única excepción.
- **Privacidad.** Que alguien juegue en otro circuito, y con qué categoría y puntos, no es asunto de esta organización. Cada una ve el nombre, el DNI y el email de quien se inscribe en ella, con su consentimiento (§5.7), y nada de otra.

```
Pago  ->  Inscripcion  ->  Jugador (uno por organización)  ->  (opcional) Usuario (la persona)
```

> **El vínculo no depende de quién pagó.** Si el jugador paga con la cuenta de MercadoPago de otra persona, no importa: la inscripción ya sabía a qué `jugadorId` pertenecía desde antes de ir al checkout. El `external_reference` es el hilo conductor, no la identidad del pagador.
>
> Esa es la razón de fondo para crear la inscripción **antes** del pago y no después.

### 5.5 Entrada 1 · Link del torneo

La organización comparte el link del torneo en el grupo. El jugador lo abre en el navegador del celular, ve la convocatoria, toca "Inscribirme y pagar" y escribe su DNI. En la misma pantalla:

**a) El DNI está en el padrón del circuito.** Aparecen su nombre, su categoría y el email guardado, **enmascarado** (`lu***@gmail.com`), para confirmarlo o cambiarlo. Nunca el email completo: si no, cualquiera que sepa un DNI vería el email de otra persona. El nombre está para que un DNI mal tipeado que coincide con el de otro se note antes de pagar.

- Si el perfil no tiene email guardado, el campo aparece vacío.
- **Si cambia el email**, el comprobante va al nuevo y al anterior le llega un aviso. Si el perfil tiene cuenta, el email de la cuenta no se cambia desde el link: el nuevo recibe el comprobante de esta inscripción y el de la cuenta recibe el aviso. El de la cuenta solo se cambia desde la cuenta.
- Si ya tiene una reserva vigente en ese torneo, también la de su primera inscripción, sigue con el pago donde lo dejó. Si ya está inscripto, se lo dice, con su número de inscripción.

**b) El DNI no está (primera vez).** *"Es tu primera inscripción. Buscate por tu apellido."* Es un buscador, no una lista:

- No muestra nada hasta escribir 3 letras, y como mucho 5 resultados.
- Busca solo en la categoría del torneo y muestra solo nombre y apellido.
- Compara sin tildes ni mayúsculas y palabra por palabra: "Lucas Matías Bravo" encuentra a "Lucas Bravo".
- No muestra los perfiles que ya tienen un DNI asociado, ni los que están reservados por otra inscripción en curso.
- Tiene un límite de búsquedas por IP.

Toca su nombre, escribe su email y sigue al pago. El DNI queda asociado a ese perfil **al confirmarse el pago**; mientras dura la reserva, el perfil no aparece en la búsqueda de nadie más, y si la reserva vence vuelve a aparecer. Si elige un nombre con otro igual o parecido en la categoría, la inscripción sigue igual, pero la organización revisa la vinculación (§5.9).

**c) No está en la lista.** Depende del `modo_inscripcion` ([07](07-configurabilidad.md) §2.6):

| Modo | Qué ve | Qué pasa |
|---|---|---|
| `cerrada` | *"Pedile a la organización que te agregue al padrón"*, con el contacto del circuito | Nada. Cuando lo agreguen, vuelve al link |
| `con_aprobacion` | Escribe nombre, apellido y email | Queda como solicitud, sin reservar lugar ni cobrar. Si la organización la aprueba, entra al padrón con 0 puntos y le llega un email con el link para pagar |
| `abierta` | Escribe nombre, apellido y email | Sigue al pago. El perfil se crea con 0 puntos al confirmarse el pago |

### 5.6 Entrada 2 · Link personal

En el padrón, al lado de cada jugador, la organización tiene "Compartir link": abre WhatsApp con el mensaje armado (*"Hola Lucas, inscribite al Primavera 26 desde acá: …"*), en el chat del jugador si tiene teléfono cargado o para elegir el contacto si no. También "Copiar link" ([decisión 050](decisiones/050-link-personal-de-inscripcion.md)).

- **Quien entra se saltea la búsqueda:** escribe su DNI, para asociarlo, y su email. Después ve los torneos de su categoría con la inscripción abierta y elige uno.
- **No hay revisión de homónimo:** el link lo mandó la organización a esa persona.
- **El link lleva un código aleatorio**, no el id del jugador: no se puede adivinar el de otro. Es del jugador, no de un torneo.
- **La organización puede generar uno nuevo**, y el anterior deja de andar.
- **Deja de servir para vincular cuando el perfil ya tiene DNI.** Si se vuelve a abrir, pide el DNI y, si coincide, sigue a los torneos abiertos. Un link regenerado o que nunca existió dice *"Este link ya no anda"*.

### 5.7 Entrada 3 · Con cuenta

La persona se carga **una vez**: nombre, DNI y email viven en la cuenta, que es global ([decisión 051](decisiones/051-identidad-en-la-cuenta.md)). Al tocar el link de un torneo de cualquier organización, con la sesión iniciada en la app o en la web:

1. Si ya tiene perfil en esa organización, va directo al pago.
2. Si su DNI está en el padrón, se vincula directo.
3. Si no, busca por su apellido en la categoría del torneo y propone *"¿Sos Federico Ibáñez, de Tercera?"*, que se confirma con un toque. Si hay varios, elige entre hasta 5. Vale la revisión de homónimos (§5.9).
4. Si no está: en un torneo abierto se crea el perfil con los datos de la cuenta; con aprobación, la solicitud sale con esos datos; en uno cerrado, *"Pedile a la organización que te agregue al padrón"*.

Como sin cuenta, la vinculación se guarda al confirmarse el pago.

**Consentimiento.** Antes de vincularse a una organización nueva: *"Al inscribirte, Liga Amateur del Valle va a ver tu nombre, tu DNI y tu email"*. Ninguna organización ve datos de otra.

**Cuenta sin DNI.** Las cuentas creadas antes de este flujo, o las de quien administra y además juega, no tienen DNI: se pide una vez y queda en la cuenta.

**Con la decisión 040.** Un circuito nuevo es un perfil más: la app lo suma a la lista de "¿A qué circuito entrás?".

### 5.8 Final común: pago, comprobante y cuenta

1. **Pagar.** Se crea la inscripción en `pendiente_pago`, con el lugar reservado 15 minutos, y el jugador va al checkout de MercadoPago. Al volver ve *"Confirmando el pago"* hasta que llega el webhook ([05-pagos.md](05-pagos.md) §3).
2. **Confirmar.** Con el webhook aprobado, la inscripción pasa a `pagada`, se guarda la vinculación del DNI con el perfil (o se crea el perfil, en modo abierto) y **recién ahí** se manda el **comprobante por email**: jugador, torneo, categoría, monto, número de inscripción, fecha y link al torneo. No en la vuelta del checkout: podría llegar un comprobante de un pago rechazado ([05](05-pagos.md) §4).
3. **Listo.** La pantalla final muestra el número de inscripción, como respaldo si el email no llega, y dice a qué email (enmascarado) se mandó el comprobante.
4. **La cuenta, si no tiene.** *"Listo, estás inscripto. Creá tu contraseña y la próxima vez te inscribís en cualquier circuito con un toque"*. El email ya está: el link para elegir la contraseña viaja en el comprobante, y recibirlo prueba que el email es suyo ([decisión 051](decisiones/051-identidad-en-la-cuenta.md)).

Si el pago se rechaza, el lugar se libera y puede intentar de nuevo. Si la reserva vence antes de pagar, también: vuelve a la convocatoria y, si quedan lugares, reserva otra vez.

**Por qué la cuenta viene después del pago:**

- **La inscripción nunca se bloquea** por no tener cuenta. Respeta el principio de mínima carga (§2).
- **Es el mejor momento para ofrecerla:** el jugador acaba de comprometerse con el torneo. La pantalla final la anuncia, aunque se cree desde el email.

Quien no quiera cuenta se queda con las pantallas públicas y no pierde nada, salvo los avisos en el celular y la coordinación dentro de la app.

**Reserva de cupo y lista de espera.** La reserva dura los minutos que configure el torneo (por defecto, 15). Si el cupo está lleno, puede sumarse a la **lista de espera**; si alguien se baja, se le avisa y se le habilita el pago. Detalle en [05-pagos.md](05-pagos.md).

### 5.9 Lo que revisa la organización

Automático por excepción: la organización no aprueba cada vinculación, solo mira lo dudoso.

- **Posible homónimo.** Si el jugador eligió un nombre con otro igual o parecido en la categoría (en la búsqueda de la entrada 1 o en el "¿Sos…?" de la entrada 3), paga y queda inscripto, pero la vinculación queda **pendiente de revisión**: *"Alguien con DNI 30.1xx.xxx se vinculó a Juan Pérez. Hay otro jugador con el mismo nombre en Tercera"*. La organización la confirma, la pasa al otro perfil o da de alta a la persona como jugador nuevo, con un clic. El jugador no ve la revisión: su inscripción no cambia.
- **Solicitudes** de los torneos con aprobación: aprueba o rechaza. Rechazar no pide explicación ([02-dominio.md](02-dominio.md) §2).
- **Cualquier vinculación** se revisa y se revierte desde el padrón.
- **Si alguien inscribió a otro con su DNI**, el comprobante le llega a la persona real: va al email guardado y, si lo cambiaron, al anterior le llega un aviso. El comprobante dice *"¿No te inscribiste vos? Avisale a la organización"*.

> **Red de seguridad.** En un circuito donde los jugadores se conocen entre sí, como POLENTA, ninguna llave técnica es tan confiable como el organizador mirando la lista. El sistema hace que el caso normal sea automático y el caso raro, fácil de corregir a mano.

### 5.10 Tratamiento del DNI y del email

El DNI es dato personal sensible en Argentina:

- Se almacena **cifrado**, nunca en texto plano. Para poder buscarlo cifrado hace falta además un hash de búsqueda; se resuelve al implementar ([decisión 049](decisiones/049-identificacion-en-la-inscripcion.md)).
- **No aparece en ninguna pantalla pública** ni en respuestas de la API destinadas a otros jugadores.
- Solo la organización dueña del padrón puede verlo. En las listas y en la revisión se muestra enmascarado: `30.1xx.xxx`.
- La consulta por DNI y la búsqueda por apellido tienen un límite por IP.

El email se muestra enmascarado siempre que quien mira puede no ser su dueño: las dos primeras letras y el dominio, `lu***@gmail.com`. La organización lo ve completo, igual que el teléfono: es dato de su padrón.

### 5.11 La secuencia en la base

**Estado inicial** tras importar el padrón:

```
Jugador { id: 42, organizacionId: 1, nombre: "Lucas", apellido: "Bravo", dni: null, email: null, usuarioId: null }
```

| Paso | Qué ocurre en la base |
|---|---|
| Escribe el DNI 30123456 | Busca `Jugador where organizacionId = 1 and dni = '30123456'`. Sin coincidencia |
| Escribe "bra" y toca "Lucas Bravo" | Nada todavía |
| Escribe su email y toca "Pagar" | `Inscripcion { id: 100482, jugadorId: 42, torneoId: 7, estado: "pendiente_pago", reservaVence }`, con el DNI y el email pendientes. El perfil 42 deja de aparecer en la búsqueda |
| Va a MercadoPago | Preferencia con `external_reference = 100482` |
| Llega el webhook aprobado | `Inscripcion[100482].estado = "pagada"` + `Pago { inscripcionId: 100482, ... }` + `Jugador[42].dni` (cifrado) y `Jugador[42].email`. Se manda el comprobante |
| (Opcional) crea la contraseña desde el comprobante | `Usuario { id: 5, nombre, apellido, dni, email }` y `Jugador[42].usuarioId = 5` |

Si la reserva vence sin pago, la inscripción pasa a `expirada`, el DNI y el email pendientes se descartan y el perfil 42 vuelve a aparecer en la búsqueda.

### 5.12 Pasos por situación

| Situación | Pasos hasta pagar | ¿Revisa la organización? |
|---|---|---|
| Sin cuenta, DNI ya asociado | Link del torneo → DNI → confirma el email → paga | No |
| Sin cuenta, primera vez | Link del torneo → DNI → se busca por apellido → toca su nombre → email → paga | Solo si hay un homónimo |
| Sin cuenta, link personal | Link personal → DNI → email → elige el torneo → paga | No |
| Sin cuenta, no está en el padrón (`cerrada`) | Link del torneo → DNI → se busca → "Pedile a la organización…" | Lo agrega al padrón |
| Sin cuenta, no está (`con_aprobacion`) | Link del torneo → DNI → se busca → nombre, apellido y email → solicitud | Aprueba o rechaza; si aprueba, paga desde el email |
| Sin cuenta, no está (`abierta`) | Link del torneo → DNI → se busca → nombre, apellido y email → paga | No |
| Con cuenta, mismo circuito | Link del torneo → paga | No |
| Con cuenta, circuito nuevo, DNI en el padrón | Link del torneo → consentimiento → paga | No |
| Con cuenta, circuito nuevo, sin DNI en el padrón | Link del torneo → "¿Sos…?" y consentimiento → paga | Solo si hay un homónimo |
| Con cuenta, circuito nuevo, torneo abierto y no está | Link del torneo → consentimiento → se crea el perfil → paga | No |

En todos los casos que pagan, el final es el mismo: comprobante por email al confirmarse el pago y, si no tiene cuenta, el link para crear la contraseña.

## 6. Coordinación de partidos

Todos los partidos los arreglan los jugadores dentro del plazo de su instancia ([02-dominio.md](02-dominio.md) §8). La organización no asigna horarios.

### 6.1 Alcance: registrar, no negociar

**La app es donde queda registrada la fecha, no donde se negocia.**

Los jugadores siguen coordinando por WhatsApp, que es lo que hacen hoy y funciona. Lo que falta no es una mejor forma de negociar: es que lo acordado quede en algún lado consultable, en vez de perderse en el scroll del grupo.

Muchos circuitos ya exigen registrar los turnos pactados: el reglamento de POLENTA, por ejemplo, obliga a hacerlo en el grupo de WhatsApp. La app resuelve ese mismo requisito mejor.

> **Descartado:** sistema de propuestas y contrapropuestas con ida y vuelta dentro de la app. Es varias veces más trabajo y compite con WhatsApp, que ya funciona y no tiene sentido reemplazar.

### 6.2 El flujo

1. Los dos jugadores acuerdan por WhatsApp, como siempre
2. **Cualquiera de los dos** anota la fecha, hora y club en la app
3. El rival recibe una notificación y **confirma** con un toque
4. Ambos ven el partido agendado y reciben recordatorio

En fase de grupos el club lo eligen ellos. En eliminatorias la sede está fijada por la organización y solo se acuerda fecha y hora.

### 6.3 Por qué existe la confirmación

Una fecha pactada tiene consecuencias: si no se juega, alguien debe dar W.O. Si un jugador anota una fecha y el otro nunca se enteró, después no hay forma de determinar quién incumplió.

La confirmación deja constancia de que ambos supieron. Es el mismo propósito que persigue el reglamento al exigir el registro en el grupo, resuelto mejor.

Para el jugador es un toque sobre una notificación, así que no vulnera el principio de mínima carga (§2).

### 6.4 Ciclo de vida del partido

```
pendiente  ->  anotada  ->  confirmada  ->  jugada
                                         -> vencida
```

| Estado | Significa |
|---|---|
| `pendiente` | Nadie cargó fecha todavía |
| `anotada` | Uno cargó la fecha, falta que el rival confirme |
| `confirmada` | Ambos al tanto. Cuenta como turno pactado |
| `jugada` | Resultado cargado |
| `vencida` | Se acabó el plazo sin jugarse. Resuelve la organización |

**Reprogramación:** la cantidad permitida y la antelación son parámetros del torneo ([07](07-configurabilidad.md) §2.3); en POLENTA, una sola y con 24 horas. Vuelve el partido a `anotada`.

### 6.5 Nota de implementación

La confirmación se modela **desde el schema**, aunque la interfaz inicial pueda no usarla:

```prisma
model Partido {
  fechaAcordada    DateTime?
  clubId           Int?      // en zonas lo eligen los jugadores
  anotadaPorId     Int?      // quién cargó la fecha
  confirmadaPorId  Int?      // null = todavía sin confirmar
  fechaLimite      DateTime  // vence el plazo de la instancia
}
```

Con la confirmación desactivada, `anotada` es el estado previo a jugar y `confirmadaPorId` queda en null. Activarla después es un botón en la app y una línea en el endpoint — **sin migración**.

> Dos columnas nullables cuestan nada ahora y evitan reescribir la lógica de coordinación más adelante.

### 6.6 Contacto entre rivales

Los rivales de zona pueden ver el teléfono del jugador, con aviso previo. Nadie más. Para hablar, un botón que abra WhatsApp con el rival: **no se construye un chat.**

**Implementado:** la API da el teléfono solo al rival de un partido que todavía no se jugó ([decisión 046](decisiones/046-telefono-del-rival.md)). El aviso previo todavía no existe.

## 7. Mis partidos

Vista principal durante el torneo: próximo partido con rival, club, día y hora. Partidos pendientes de coordinar con su plazo. Historial del torneo en curso.

Notificación push al generarse el fixture, al acordarse una fecha y como recordatorio previo al partido.

**Implementado** ([decisión 047](decisiones/047-avisos-push.md)): el fixture llega por push al confirmarse el sorteo; el recordatorio lo programa el celular un día antes de cada partido con fecha. El de la fecha acordada llega con F14.

---

## 8. Zona y cuadros

Tabla de posiciones del grupo en vivo, con la línea de corte marcada — arriba clasifican al cuadro principal, abajo al cuadro consuelo si el torneo lo tiene. Los cuadros son navegables.

---

## 9. Ranking e historial

- Ranking de su categoría, con su posición destacada
- **Desglose por torneo del calendario**, igual que la planilla actual, mostrando qué edición aportó cada puntaje
- Historial completo de partidos con head-to-head

---

## 10. Reparto web / móvil

| Funcionalidad | Web | Móvil |
|---|---|---|
| Ver ranking, ficha, cuadros, calendario (**público**) | ✓ | ✓ |
| Ingresar | ✓ | ✓ |
| Crear la cuenta del jugador (desde el link del comprobante) | ✓ | — |
| Gestionar padrón e importar Excel | ✓ | — |
| Crear y configurar torneo | ✓ | — |
| Gestionar inscripciones y lista de espera | ✓ | — |
| Sorteo y generación de zonas | ✓ | — |
| Tablero de avance | ✓ | — |
| Cargar resultados | ✓ | — |
| Inscribirse y pagar | ✓ por link, sin cuenta | ✓ con cuenta |
| Coordinar fechas | — | ✓ |
| Mis partidos | ✓ | ✓ |
| Notificaciones push | — | ✓ |

**La inscripción por link es web.** Quien no tiene cuenta abre el link del torneo en el navegador del celular: sin cuenta no hay app que abrir, porque la app sin sesión solo muestra el ingreso ([decisión 042](decisiones/042-la-app-sin-sesion.md)). Si el link abre la app cuando está instalada y con la sesión iniciada es la decisión abierta 18 del [README](README.md).

La app móvil es **obligatoria** para grupos de 3 y no puede ser una web responsive. Su razón de existir es el flujo del jugador durante el torneo: coordinación, avisos y consulta, más la inscripción de un toque para quien tiene cuenta.
