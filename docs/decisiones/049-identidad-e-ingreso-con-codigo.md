# 049 — Identidad e ingreso del jugador: el email, verificado con un código

**Estado:** aceptada — 25 de octubre de 2026. Cierra la decisión abierta 8 del [README](../README.md). Pendiente de código.

## Contexto

F12 pide que el jugador se inscriba y pague desde el link del torneo, sin registrarse antes ([10-features.md](../10-features.md)). Para eso el sistema tiene que saber quién es, y conectar esa persona con su perfil del padrón.

La decisión abierta 8 preguntaba con qué se identifica: DNI o email. La propuesta anterior usaba el DNI para encontrar al jugador y un email sin verificar para el comprobante, con una cuenta opcional después del pago.

Dos datos pesan:
- **El padrón de POLENTA no tiene DNI ni email.** La primera vez, ningún dato que la persona tipee se puede comparar con algo que la organización haya cargado.
- **Lo que no se verifica, se puede reclamar.** Un DNI escrito por cualquiera queda asociado a quien lo escribió primero, y si es único en la plataforma, el dueño real queda bloqueado en todos los circuitos.

Los administradores ya tienen contraseña: el registro y el ingreso de la web están implementados así desde el 25% ([decisión 006](006-recuperar-la-contrasena.md)).

## Opciones consideradas

### Con qué se identifica la persona

1. **DNI y email sin verificar.** El DNI encuentra al jugador; el email recibe el comprobante. La cuenta, con contraseña, es opcional y viene después.
   - En contra: ninguno de los dos se verifica. Quien sabe un DNI ajeno se inscribe como otro, y el dato queda en dos lugares (perfil y cuenta) según la persona tenga contraseña o no.
2. **DNI más email verificado.** Igual, pero el email se confirma.
   - En contra: el DNI sigue sin poder verificarse. Si identifica, quien lo reclama primero lo bloquea para el dueño real en toda la plataforma; si no identifica, sobra. Y es un dato sensible que hay que cifrar y buscar cifrado.
3. **Email verificado con un código, sin DNI.**
   - En contra: un email por persona, así que un email compartido (un padre que inscribe a dos hijos) no sirve para los dos. Y la primera vez sigue sin haber con qué comparar el perfil que elige.

### Cómo se verifica el email

1. **Un código de 6 dígitos** que se escribe en la misma pantalla.
   - En contra: hay que tipearlo, y vence.
2. **Un link mágico en el email.**
   - En contra: el link del torneo muchas veces se abre en el navegador interno de WhatsApp. El link del email se abriría en otro navegador y perdería la inscripción a medias.

### Cómo ingresan los administradores

1. **Siguen con contraseña**; los jugadores, con código.
   - En contra: dos formas de ingresar que mantener, y la recuperación de la decisión 006 queda solo para ellos.
2. **Pasan también al código.**
   - En contra: hay que rehacer el registro y el ingreso de la web, ya entregados. En la demo, entrar exige abrir Mailpit.
3. **Las dos:** contraseña si la tienen, y "Entrar con un código" siempre disponible, en lugar de "Olvidé mi contraseña".
   - En contra: la que más código lleva, con dos caminos en el ingreso de la web.

## Decisión

Email verificado con un código, sin DNI. Los administradores siguen con contraseña.

- **Los jugadores ingresan sin contraseña:** email y un código de 6 dígitos.
  - El código vence a los 10 minutos y admite 5 intentos.
  - La pantalla tiene "Reenviar el código" y avisa que puede estar en spam.
  - Pedir un código nunca revela si el email ya existe: siempre dice "te mandamos un código".
  - Con la sesión iniciada en ese dispositivo, no se pide código.
- **El código va antes de pagar.** Si fuera después, podría quedar alguien que pagó con una inscripción sin confirmar porque el código no le llegó.
- **La cuenta es el email verificado.** Toda persona que se inscribe ya tiene cuenta. No hay registro de jugadores, contraseña ni cuenta opcional después del pago.
- **El Usuario es la persona:** nombre, apellido y email.
  - Se crea al verificar el código, porque la sesión lo necesita.
  - Su nombre sale del primer perfil que vincula, como lo escribió esa organización. Si se crea un perfil nuevo, en modo abierto o con aprobación, lo escribe la persona. La persona puede editar su nombre desde su cuenta. El nombre de cada perfil del padrón sigue siendo el que escribió cada organización.
- **Un email por persona.** Para un email compartido, la salida es la inscripción manual de la organización ([05-pagos.md](../05-pagos.md) §8).
- **El Jugador sigue siendo uno por organización**, con su categoría, sus puntos y su historial, y apunta a un Usuario. Un Usuario tiene como mucho un Jugador en cada organización. Cómo se vincula está en la [decisión 051](051-vinculacion-con-el-padron.md).
- **El DNI sale del flujo.** Puede quedar como campo opcional del padrón, si una organización lo necesita por otro motivo (un seguro, por ejemplo), pero no se pide en la inscripción ni identifica a nadie.
- **La organización no toca la identidad de nadie.** El email y los datos de la persona son de ella, que los cambia probando que el email es suyo. La organización decide sobre su padrón: de qué persona es cada perfil, y sus inscripciones. Ve el email de sus jugadores, para contactarlos.
- **Los administradores siguen con contraseña**, como hoy. Quien administra y juega con el mismo email es la misma persona: entra con contraseña en la web y con código en la app. Con otro email son dos personas, y es correcto: el sistema no tiene forma de saber que son el mismo humano.

## Por qué

- **El código verifica lo único que se puede verificar.** Probar que un email es tuyo cuesta un minuto. Un DNI, en cambio, no se puede probar desde un celular: no agrega seguridad, y si identifica, el primero que lo escribe se lo queda.
- **Deja de guardarse un dato sensible.** Sin DNI no hay nada que cifrar ni un índice para buscarlo cifrado.
- **Un solo lugar para la identidad.** La persona está en el Usuario desde la primera inscripción. Ya no hay un dato que vive en el perfil si no hay contraseña y en la cuenta si la hay.
- **No hay contraseña que olvidar.** El público del circuito se inscribe cuatro o cinco veces por año; una contraseña para eso se olvida entre torneo y torneo.
- **Código y no link** por el navegador interno de WhatsApp, donde se abre el link del torneo.
- **Los administradores no cambian** porque su ingreso ya está entregado y funciona. En la demo, el evaluador entra con la cuenta del seed sin abrir Mailpit.

## Qué se resigna

- **Un email compartido no sirve para dos personas.** La organización inscribe a mano a la segunda.
- **El hueco de la primera vez.** Alguien puede reclamar con su email el perfil de otro, porque el padrón no tiene con qué comparar. Ningún dato tipeado lo resuelve. Lo cubren el link personal ([decisión 050](050-link-personal-de-inscripcion.md)) y la revisión de la organización (decisión 051).
- **Inscribirse depende de que llegue un email.** Sin un SMTP real, el código no sale de la máquina: para la entrega, Mailpit lo muestra en `http://localhost:8025` (decisión 006), y sin `SMTP_HOST` se imprime en la consola de la API. El proveedor real es la decisión abierta 17 del README.
- **Dos formas de ingresar:** código para jugadores, contraseña para administradores. Que los administradores puedan usar las dos queda como mejora futura.

## Pendiente de código

- ~~**Tabla de códigos:** email, hash del código, vencimiento e intentos.~~ Hecho: `CodigoIngreso`, con un HMAC del código, nunca el código en claro.
- ~~**Ingreso por código:** un paso que pide el código y otro que lo verifica y devuelve el token y los perfiles.~~ Hecho: `POST /api/auth/codigo` y `POST /api/auth/codigo/verificar`. El mismo par sirve a la inscripción en la web. La app ya lo usa, y `POST /api/auth/ingreso-jugador` con contraseña se quitó ([decisión 039](039-ingreso-del-jugador.md)).
- ~~**`Usuario.passwordHash` opcional.**~~ Hecho. Una persona sin contraseña no puede entrar por el ingreso de los administradores: el chequeo compara contra un hash de relleno, así que la respuesta es la misma que con una contraseña incorrecta.
- **`Usuario.nombre` y `apellido`** se completan con el primer perfil vinculado. Hasta entonces pueden estar vacíos.
- **Quitar `Jugador.dni` y `Jugador.email` del flujo.** El email es de la persona. El DNI puede quedar como dato opcional del padrón, sin `@@unique` y sin uso en la identificación.
- ~~**Límite de pedidos y de intentos de código**, por email y por IP.~~ Hecho ([decisión 052](052-limite-de-pedidos.md)).
- **Editar el propio nombre** y **cambiar el propio email** desde la cuenta, este último con un código al email nuevo.
- ~~**El seed:** la cuenta de prueba del jugador deja de necesitar contraseña.~~ Hecho.
