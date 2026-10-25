# Flujo del jugador

> Reglas de negocio en [02-dominio.md](02-dominio.md).

---

## 1. Principio: mirar no pide cuenta, e inscribirse es verificar el email

| Sin cuenta | Con cuenta, que es el email verificado |
|---|---|
| Ver el ranking, las fichas, el historial, los cuadros, las zonas y el calendario | Inscribirse y pagar |
| | Coordinar las fechas de sus partidos |
| | Cargar y confirmar resultados, si la organización lo permite (`quien_carga_resultados`, decisión abierta 12 del [README](README.md)) |
| | Recibir avisos en el celular |

**Mirar no pide cuenta.** Las páginas públicas se abren por link: la organización comparte la URL en el grupo de WhatsApp donde ya se comunican, el jugador la toca y ve lo que necesita.

**Inscribirse pide verificar el email, y eso ya es la cuenta.** El jugador escribe su email y el código de 6 dígitos que le llega. No hay registro aparte ni contraseña ([decisión 049](decisiones/049-identidad-e-ingreso-con-codigo.md)). Con la sesión iniciada en ese dispositivo, ni siquiera el código.

> **Por qué:** el público del circuito es mayoritariamente gente adulta acostumbrada a coordinar por WhatsApp. Pedirles registro para ver su ranking es fricción que abandonarían. Para inscribirse, una contraseña es otra cosa que olvidar entre torneo y torneo; un código que llega al email cuesta un minuto y prueba que el email es suyo.
>
> Validado externamente: las tres plataformas relevadas ([01-vision.md](01-vision.md) §3) resuelven la consulta sin autenticación.

---

## 2. Principio de mínima carga

**Al jugador se le pide lo mínimo indispensable. Su trabajo es jugar.**

| Se le pide | No se le pide |
|---|---|
| Inscribirse y pagar — es lo que quiere hacer | Cargar resultados |
| Coordinar fecha con su rival — **ya lo hace hoy** por WhatsApp | Actualizar su perfil o su ranking |
| | Crear o recordar una contraseña |

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

**La cuenta es el email verificado** ([decisión 049](decisiones/049-identidad-e-ingreso-con-codigo.md)). La persona (`Usuario`) tiene nombre, apellido y email, y se crea la primera vez que verifica un código. Toda persona que se inscribe ya tiene cuenta. No hay registro de jugadores ni contraseña.

En modo `cerrada` —el de POLENTA— **el jugador ya existe en el padrón antes de tener cuenta**. La vinculación con su perfil ocurre **al inscribirse**: buscándose por su apellido, con la propuesta "¿Sos…?" si ya juega en otro circuito, o desde el link personal que le manda la organización (§5). En modo `abierta`, el perfil se crea al inscribirse, con 0 puntos.

La organización **ve cada vinculación nueva** en el padrón y revisa solo las dudosas: los posibles homónimos y los perfiles que reclama otra cuenta. También puede desvincular cualquier perfil (§5.9). **La organización no toca la identidad de nadie:** el email y el nombre de la persona son de ella.

> **Estado:** el lado de la organización ya está en parte: el padrón marca los perfiles con cuenta y permite desvincularlos (`DELETE /jugadores/:id/cuenta`, [decisión 007](decisiones/007-vinculacion-de-cuentas-en-f02.md)). El ingreso con código, el link personal, la revisión y el aviso de vinculaciones nuevas llegan con F12 ([decisiones 049 a 051](decisiones/049-identidad-e-ingreso-con-codigo.md)).

### 4.1 Ingreso a la app

El jugador entra a la app con su email y un código de 6 dígitos que le llega por email, por `POST /api/auth/ingreso-jugador`, distinto del ingreso de la web ([decisiones 039](decisiones/039-ingreso-del-jugador.md) y [049](decisiones/049-identidad-e-ingreso-con-codigo.md)). Los administradores siguen entrando a la web con su contraseña. Quien administra y juega con el mismo email es la misma persona: contraseña en la web, código en la app.

- **El código** vence a los 10 minutos, admite 5 intentos y se puede reenviar (§5.5).
- **Un perfil por circuito.** Si juega en varios, elige en cuál entrar y la app lo recuerda. Para cambiar, toca el nombre del circuito en el encabezado, donde también está "Cerrar sesión" ([decisión 040](decisiones/040-jugador-en-varios-circuitos.md)).
- **La sesión queda guardada en el celular**, cifrada, y dura 7 días como en la web ([decisión 041](decisiones/041-sesion-en-el-celular.md)). Con sesión no se pide código.
- **Sin sesión, la app solo muestra el ingreso.** La consulta sin cuenta es la de la web, por link ([decisión 042](decisiones/042-la-app-sin-sesion.md)).
- **Quien solo administra** verifica el código, no tiene perfil de jugador y recibe un aviso para entrar por la web.
- **La persona edita su nombre desde su cuenta.** Cambiar el email pide un código al email nuevo. *Pendiente de código.*

> **Estado:** implementado. La API pide y verifica el código (`POST /api/auth/codigo` y `/codigo/verificar`), con límites por email y por IP ([decisión 052](decisiones/052-limite-de-pedidos.md)), y la app entra así, con la cuenta de prueba del seed. El ingreso con contraseña quedó solo para los administradores, en la web.

> **Descartado:** verificación por SMS y pedir el DNI. El SMS necesita un proveedor externo pago; el DNI no se puede verificar desde un celular, así que no agrega seguridad (decisión 049).

---

## 5. Inscripción a un torneo

### 5.1 Quién puede inscribirse

Depende del `modo_inscripcion` del torneo ([07-configurabilidad.md](07-configurabilidad.md) §2.6). En POLENTA es `cerrada`: **solo jugadores que ya están en el padrón**.

Distinción importante que conviene no mezclar:

| | Quién |
|---|---|
| Ver ranking, cuadros y fichas | Cualquiera, sin cuenta |
| **Inscribirse a un torneo** | Quien está en el padrón (modo `cerrada`), con su email verificado |

Público para **leer** no es público para **inscribirse**. Y verificar un email no es entrar al circuito: en modo `cerrada`, quien no está en el padrón no se inscribe, aunque tenga cuenta.

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

### 5.3 Principio: el email verificado es la persona

- **El email, verificado con un código, identifica a la persona.** Es lo único que se puede probar desde un celular ([decisión 049](decisiones/049-identidad-e-ingreso-con-codigo.md), que cierra la decisión abierta 8).
- **El DNI no se pide.** No se puede verificar, así que no agrega seguridad, y si identificara, el primero que lo escribe se lo quedaría para toda la plataforma.
- **La organización no toca la identidad de nadie.** El email y el nombre de la persona son de ella. La organización decide sobre su padrón: de qué persona es cada perfil, y sus inscripciones.
- **Automático por excepción.** El caso normal no lo toca nadie; la organización ve las vinculaciones nuevas y revisa solo lo dudoso, como en la importación del padrón y la carga de resultados.

Hay tres formas de llegar a la inscripción, y las tres terminan igual (§5.8):

| Entrada | Cómo llega | Qué hace para identificarse |
|---|---|---|
| 1. Link del torneo | La organización lo comparte en el grupo | Email y código. Después encuentra su perfil (§5.6) |
| 2. Link personal | La organización se lo manda a él | Email y código. El perfil ya lo eligió la organización (§5.7) |
| 3. Con la sesión iniciada | Toca el link de un torneo desde la app o la web | Nada: no hay código |

### 5.4 Persona y perfil

**Distinción central: la persona (`Usuario`) y su perfil en cada circuito (`Jugador`) son entidades distintas.**

| Entidad | Qué es | Alcance | Cuándo existe |
|---|---|---|---|
| `Jugador` | El perfil del padrón: categoría, puntos, historial. **Es la entidad del dominio** | Uno por organización | Antes de que la persona toque nada. Lo crea la organización, o la inscripción en modo abierto |
| `Usuario` | La persona: nombre, apellido y email verificado | Global | Desde la primera vez que verifica un código |

**La inscripción se vincula al `Jugador`, no al `Usuario`.** El `Jugador` ya existía en el padrón; la inscripción le agrega de qué persona es.

**Una persona, un perfil por organización.** Quien juega en dos circuitos tiene una cuenta y dos perfiles, cada uno con su categoría, sus puntos y su historial. Es lo que ya supone la app, que pregunta en qué circuito entra ([decisión 040](decisiones/040-jugador-en-varios-circuitos.md)).

**Por qué el perfil no se comparte entre organizaciones:**

- **Cada organización es dueña de su padrón.** Lo arma, cambia categorías, da de baja. Con un perfil compartido, lo que decide una cambiaría lo que ve la otra.
- **`organizacion_id` es la clave de aislamiento** de toda entidad del dominio. Un perfil global sería la única excepción.
- **Privacidad.** Que alguien juegue en otro circuito, y con qué categoría y puntos, no es asunto de esta organización. Cada una ve el nombre y el email de quien se inscribe en ella, con su consentimiento (§5.6), y nada de otra.

**El nombre de la persona** sale del primer perfil que vincula, como lo escribió esa organización; si se crea un perfil nuevo, lo escribe ella. Lo puede editar desde su cuenta. El nombre de cada perfil del padrón sigue siendo el que escribió cada organización.

```
Pago  ->  Inscripcion  ->  Jugador (uno por organización)  ->  Usuario (la persona)
```

> **El vínculo no depende de quién pagó.** Si el jugador paga con la cuenta de MercadoPago de otra persona, no importa: la inscripción ya sabía a qué `jugadorId` pertenecía desde antes de ir al checkout. El `external_reference` es el hilo conductor, no la identidad del pagador.
>
> Esa es la razón de fondo para crear la inscripción **antes** del pago y no después.

### 5.5 Verificar el email: el código

1. El jugador escribe su email.
2. La pantalla dice *"Te mandamos un código a lucas.bravo@gmail.com"*. Siempre lo dice, exista o no la cuenta: pedir un código no revela qué emails están registrados.
3. Escribe el código de 6 dígitos. Vence a los 10 minutos y admite 5 intentos; hay "Reenviar el código", y la pantalla avisa que puede haber llegado al spam.
4. Con el código correcto queda la sesión iniciada en ese dispositivo, por 7 días. La próxima vez no se pide.

**El código va antes de pagar.** Si fuera después, podría quedar alguien que pagó con una inscripción sin confirmar porque el código no le llegó.

**Código y no link mágico.** El link del torneo muchas veces se abre en el navegador interno de WhatsApp; un link en el email se abriría en otro navegador y perdería la inscripción a medias.

### 5.6 Encontrar el perfil

Después del código, o con la sesión iniciada:

1. **Ya tiene perfil en este circuito.** Ve *"Lucas Bravo · Tercera"* y sigue al pago.
2. **Ya juega en otro circuito y es nuevo en este.** Se busca su apellido en la categoría del torneo y se le propone *"¿Sos Federico Ibáñez, de Intermedia?"*, que confirma con un toque. Si hay varios, elige entre hasta 5. Si no es ninguno, sigue como en el punto 3.
3. **Es su primera vez.** *"Buscate por tu apellido."* Es un buscador, no una lista:
   - no muestra nada hasta escribir 3 letras, y como mucho 5 resultados;
   - busca solo en la categoría del torneo y muestra solo nombre y apellido;
   - compara sin tildes ni mayúsculas y palabra por palabra: "Lucas Matías Bravo" encuentra a "Lucas Bravo";
   - los perfiles vinculados a otra cuenta aparecen marcados; los reservados por otra inscripción en curso, no;
   - tiene un límite de búsquedas por IP.
4. **El perfil está vinculado a otra cuenta.** Al tocarlo: *"Este perfil ya está vinculado a otra cuenta"*, con el botón "Avisarle a la organización". El botón crea el caso en "Para revisar" con su email verificado, y la organización decide (§5.9).
5. **No está en la lista.** Depende del `modo_inscripcion` ([07](07-configurabilidad.md) §2.6):

| Modo | Qué ve | Qué pasa |
|---|---|---|
| `cerrada` | *"Pedile a la organización que te agregue al padrón"*, con el contacto del circuito | Nada. Cuando lo agreguen, vuelve al link |
| `con_aprobacion` | Escribe su nombre y apellido (o los toma de su cuenta) | Queda como solicitud, sin reservar lugar ni cobrar. Si la organización la aprueba, entra al padrón con 0 puntos y le llega un email con el link para pagar |
| `abierta` | Escribe su nombre y apellido (o los toma de su cuenta) | Sigue al pago. El perfil se crea con 0 puntos al confirmarse el pago |

**Consentimiento.** En un circuito donde todavía no tiene perfil, antes de vincularse: *"Al inscribirte, Liga Amateur del Valle va a ver tu nombre y tu email"*. Nunca se muestra nada de otros circuitos.

**La vinculación se guarda al confirmarse el pago** ([decisión 051](decisiones/051-vinculacion-con-el-padron.md)). Mientras dura la reserva de 15 minutos, el perfil elegido queda reservado y no aparece en la búsqueda de nadie más; si la reserva vence, vuelve a aparecer. Si elige un nombre con otro igual o parecido en la categoría, la inscripción sigue igual, pero la organización revisa la vinculación (§5.9).

### 5.7 El link personal

La primera vez, el padrón no tiene con qué comparar: alguien puede elegir el perfil de otro, y ningún dato que se tipee lo evita. **El link personal cierra ese hueco**, porque el perfil lo elige la organización ([decisión 050](decisiones/050-link-personal-de-inscripcion.md)).

En el padrón, al lado de cada jugador, la organización tiene "Compartir link": abre WhatsApp con el mensaje armado (*"Hola Lucas, inscribite al Primavera 26 desde acá: …"*), en el chat del jugador si tiene teléfono cargado o para elegir el contacto si no. También "Copiar link".

- **Quien entra se saltea la búsqueda:** escribe su email, verifica el código (o ya tiene la sesión) y queda vinculado a ese perfil. Después ve los torneos de su categoría con la inscripción abierta y elige uno.
- **No hay revisión de homónimo:** el perfil lo eligió la organización.
- **El link lleva un código aleatorio**, no el id del jugador: no se puede adivinar el de otro. Es del jugador, no de un torneo.
- **La organización puede generar uno nuevo**, y el anterior deja de andar.
- **Deja de servir para vincular cuando el perfil ya está vinculado.** Si lo abre la misma cuenta, sigue a los torneos abiertos; si lo abre otra, ve el aviso del punto 4 de §5.6. Un link regenerado o que nunca existió dice *"Este link ya no anda"*.

### 5.8 Final común: pago y comprobante

1. **Pagar.** Se crea la inscripción en `pendiente_pago`, con el lugar reservado 15 minutos, y el jugador va al checkout de MercadoPago. Al volver ve *"Confirmando el pago"* hasta que llega el webhook ([05-pagos.md](05-pagos.md) §3).
2. **Confirmar.** Con el webhook aprobado, la inscripción pasa a `pagada`, se guarda la vinculación del perfil con la persona (o se crea el perfil, en modo abierto) y **recién ahí** se manda el **comprobante por email**: jugador, torneo, categoría, monto, número de inscripción, fecha y link al torneo. No en la vuelta del checkout: podría llegar un comprobante de un pago rechazado ([05](05-pagos.md) §4).
3. **Listo.** La pantalla final muestra el número de inscripción, como respaldo si el email no llega, y dice a qué email se mandó el comprobante.
4. **La app.** Para coordinar sus partidos, el jugador entra a la app con el mismo email y un código. No hay cuenta que crear: ya la tiene.

Si el pago se rechaza, el lugar se libera y puede intentar de nuevo. Si la reserva vence antes de pagar, también: vuelve a la convocatoria y, si quedan lugares, reserva otra vez.

**Reserva de cupo y lista de espera.** La reserva dura los minutos que configure el torneo (por defecto, 15). Si el cupo está lleno, puede sumarse a la **lista de espera**; si alguien se baja, se le avisa y se le habilita el pago. Detalle en [05-pagos.md](05-pagos.md).

### 5.9 Lo que revisa la organización

Automático por excepción: la organización no aprueba cada vinculación. Decide sobre su padrón, nunca sobre la identidad de nadie ([decisión 051](decisiones/051-vinculacion-con-el-padron.md)).

- **Vinculaciones nuevas.** El padrón muestra las que se hicieron desde la última visita, con cómo se hizo cada una: link personal, búsqueda o "¿Sos…?". No frenan nada; están para que la organización mire la lista cuando quiera.
- **Posible homónimo.** Si el jugador eligió un nombre con otro igual o parecido en la categoría, paga y queda inscripto, pero la vinculación queda **para revisar**: *"lucas.p@gmail.com se vinculó a Juan Pérez. Hay otro jugador con el mismo nombre en Tercera"*. La organización la confirma, pasa la inscripción al otro perfil o da de alta a la persona como jugador nuevo. El jugador no ve la revisión: su inscripción no cambia.
- **Perfil reclamado.** Si otra cuenta tocó "Avisarle a la organización" sobre un perfil vinculado, el caso aparece solo en "Para revisar", con las dos cuentas. La organización decide de quién es el perfil: lo deja, se lo pasa a quien lo reclama, o lo desvincula para que el dueño lo reclame con su link personal. Y decide qué pasa con las inscripciones que pagó la cuenta que lo tenía.
- **Solicitudes** de los torneos con aprobación: aprueba o rechaza. Rechazar no pide explicación ([02-dominio.md](02-dominio.md) §2).
- **Desvincular.** Cualquier perfil se puede desvincular desde el padrón y queda libre. No toca el email ni la cuenta de nadie, y sus inscripciones quedan en el perfil.

> **Red de seguridad.** En un circuito donde los jugadores se conocen entre sí, como POLENTA, ninguna llave técnica es tan confiable como el organizador mirando la lista. El sistema hace que el caso normal sea automático y el caso raro, fácil de corregir a mano.

### 5.10 Datos personales

- **El email** lo ven la persona y las organizaciones en las que se inscribió, para contactarla. No aparece en ninguna pantalla pública ni en respuestas de la API destinadas a otros jugadores.
- **Un email por persona.** Para un email compartido (un padre que inscribe a dos hijos), la salida es la inscripción manual de la organización ([05-pagos.md](05-pagos.md) §8).
- **El DNI no se pide.** Puede quedar como dato opcional del padrón, si una organización lo necesita por otro motivo (un seguro, por ejemplo), pero no identifica a nadie ni se usa en la inscripción.
- **Los pedidos de código y la búsqueda** tienen un límite por email y por IP.

### 5.11 La secuencia en la base

**Estado inicial** tras importar el padrón:

```
Jugador { id: 42, organizacionId: 1, nombre: "Lucas", apellido: "Bravo", usuarioId: null }
```

| Paso | Qué ocurre en la base |
|---|---|
| Escribe lucas.bravo@gmail.com | Se guarda un código para ese email, con hash, vencimiento a 10 minutos e intentos en 0, y se manda por email |
| Escribe el código | Se verifica. Como no había una persona con ese email: `Usuario { id: 5, email }`, todavía sin nombre. Queda la sesión iniciada |
| Escribe "bra" y toca "Lucas Bravo" | Nada todavía |
| Toca "Pagar" | `Inscripcion { id: 100482, jugadorId: 42, torneoId: 7, estado: "pendiente_pago", reservaVence }`, con la persona 5 pendiente de vincular. El perfil 42 deja de aparecer en la búsqueda |
| Va a MercadoPago | Preferencia con `external_reference = 100482` |
| Llega el webhook aprobado | `Inscripcion[100482].estado = "pagada"` + `Pago { inscripcionId: 100482, ... }` + `Jugador[42].usuarioId = 5` + `Usuario[5]` toma el nombre "Lucas Bravo" del perfil. Se manda el comprobante |

Si la reserva vence sin pago, la inscripción pasa a `expirada`, no se vincula nada y el perfil 42 vuelve a aparecer en la búsqueda. La persona 5 sigue existiendo: es su email verificado.

### 5.12 Pasos por situación

| Situación | Pasos hasta pagar | ¿Qué ve la organización? |
|---|---|---|
| Ya tiene perfil en el circuito, sin sesión | Link del torneo → email → código → paga | Nada nuevo |
| Ya tiene perfil en el circuito, con sesión | Link del torneo → paga | Nada nuevo |
| Primera vez | Link del torneo → email → código → se busca por apellido → toca su nombre → consentimiento → paga | La vinculación nueva; si hay un homónimo, para revisar |
| Juega en otro circuito, nuevo en este | Link del torneo → (email y código, si no hay sesión) → "¿Sos…?" y consentimiento → paga | La vinculación nueva; si hay un homónimo, para revisar |
| Link personal | Link personal → email → código → elige el torneo → paga | La vinculación nueva |
| Su perfil está vinculado a otra cuenta | … → toca su nombre → "Avisarle a la organización" | El reclamo, para revisar |
| No está en el padrón (`cerrada`) | … → se busca → "Pedile a la organización…" | Lo agrega al padrón |
| No está (`con_aprobacion`) | … → se busca → nombre y apellido → solicitud | Aprueba o rechaza; si aprueba, el jugador paga desde el email |
| No está (`abierta`) | … → se busca → nombre y apellido → consentimiento → paga | El perfil nuevo |

En todos los casos que pagan, el final es el mismo: comprobante por email al confirmarse el pago, y la app con el mismo email.

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
| Ingresar: el jugador con email y código, el administrador con contraseña | ✓ | ✓ |
| Gestionar padrón e importar Excel | ✓ | — |
| Crear y configurar torneo | ✓ | — |
| Gestionar inscripciones y lista de espera | ✓ | — |
| Sorteo y generación de zonas | ✓ | — |
| Tablero de avance | ✓ | — |
| Cargar resultados | ✓ | — |
| Inscribirse y pagar | ✓ por link, con email y código | ✓ con la sesión iniciada |
| Coordinar fechas | — | ✓ |
| Mis partidos | ✓ | ✓ |
| Notificaciones push | — | ✓ |

**La inscripción por link es web.** Quien no tiene la sesión iniciada abre el link del torneo en el navegador del celular y verifica su email ahí: sin sesión no hay app que abrir, porque la app sin sesión solo muestra el ingreso ([decisión 042](decisiones/042-la-app-sin-sesion.md)). Si el link abre la app cuando está instalada y con la sesión iniciada es la decisión abierta 18 del [README](README.md).

La app móvil es **obligatoria** para grupos de 3 y no puede ser una web responsive. Su razón de existir es el flujo del jugador durante el torneo: coordinación, avisos y consulta, más la inscripción sin código para quien ya tiene la sesión iniciada.
