# 051 — La persona en la cuenta, un perfil por organización

**Estado:** aceptada — 25 de octubre de 2026. Pendiente de código.

## Contexto

Hoy `Usuario` tiene email, contraseña, nombre y apellido, y `Jugador` es el perfil de una organización, con su propio `dni`, `email` y un `usuarioId` opcional ([decisión 007](007-vinculacion-de-cuentas-en-f02.md)). Un mismo jugador puede jugar en varios circuitos (F02), y la app ya le pregunta en cuál entra ([decisión 040](040-jugador-en-varios-circuitos.md)).

Con la [decisión 049](049-identificacion-en-la-inscripcion.md), el jugador se identifica con su DNI y su email. Si esos datos vivieran solo en cada perfil, quien juega en dos circuitos se identificaría dos veces, y la cuenta no le serviría para inscribirse en un circuito nuevo.

Además, la cuenta se ofrece después de pagar, con el email que el jugador escribió al inscribirse y que nadie verificó. Quien sabe un DNI ajeno y paga podría crear la cuenta con los datos de otra persona.

## Opciones consideradas

### Dónde viven los datos de la persona

1. **Todo en el perfil, como hoy.**
   - En contra: cada circuito pide de nuevo DNI y email, y la cuenta solo sirve para entrar a la app.
2. **Un perfil de jugador global**, compartido entre organizaciones.
   - En contra: cada organización es dueña de su padrón: lo arma, cambia categorías, da de baja. Con un perfil compartido, lo que decide una organización cambiaría lo que ve otra. Rompe el aislamiento por `organizacion_id` y deja ver en un circuito la categoría y los puntos del otro.
3. **La persona en la cuenta (`Usuario`), global; el perfil (`Jugador`), uno por organización.**
   - En contra: el DNI queda en dos lugares, la cuenta y cada perfil.

### Cómo se crea la contraseña

1. **El link para crearla viaja en el comprobante.**
   - En contra: hay que ir al email; la oferta deja de resolverse en la pantalla del pago.
2. **Contraseña en la pantalla final, más un código de 6 dígitos por email.**
   - En contra: una pantalla y un email más, y hay que limitar los intentos.
3. **Contraseña en la pantalla final, sin verificar el email.**
   - En contra: el caso de arriba. Como el DNI es único entre cuentas, el dueño real no podría crear la suya.

## Decisión

Opción 3 para los datos y opción 1 para la contraseña.

- **La cuenta (`Usuario`) guarda nombre, apellido, DNI y email de la persona.** Se cargan una vez. El DNI es único entre cuentas.
- **El perfil (`Jugador`) sigue siendo uno por organización**, con su categoría, sus puntos y su historial. Una cuenta tiene como mucho un perfil en cada organización.
- **Con la sesión iniciada, al tocar el link de un torneo de cualquier organización:**
  1. si ya tiene perfil ahí, va directo al pago;
  2. si su DNI está en el padrón de esa organización, se vincula directo;
  3. si no, busca por su apellido en la categoría del torneo y propone *"¿Sos Federico Ibáñez, de Tercera?"*, que se confirma con un toque (si hay varios, hasta 5). Vale la revisión de homónimos de la decisión 049;
  4. si no está: torneo abierto, se crea el perfil con los datos de la cuenta; con aprobación, la solicitud sale con esos datos; cerrado, *"Pedile a la organización que te agregue al padrón"*.

  Como en la decisión 049, la vinculación se guarda al confirmarse el pago.
- **Consentimiento antes de vincularse a una organización nueva:** *"Al inscribirte, Liga Amateur del Valle va a ver tu nombre, tu DNI y tu email"*. Ninguna organización ve datos de otra: ni la categoría, ni los puntos, ni que juega en otro circuito.
- **Cuenta sin DNI** (creada antes de este flujo, o de alguien que administra y además juega): se le pide una vez y queda en la cuenta.
- **La cuenta se crea desde el comprobante.** El email trae "Creá tu contraseña", un link firmado como el de la [decisión 006](006-recuperar-la-contrasena.md); la pantalla final lo anuncia. La cuenta toma el nombre del perfil y el DNI y el email de la inscripción. Si ese email ya es de una cuenta, el comprobante ofrece ingresar en lugar de crearla, y al ingresar desde ese link el perfil se vincula a esa cuenta.
- **El email de la cuenta solo se cambia desde la cuenta** (decisión 049).

## Por qué

- **La persona se carga una vez.** En un circuito nuevo, inscribirse es un toque y un consentimiento.
- **El perfil no se comparte** por tres razones:
  - Cada organización es dueña de su padrón y decide sobre él sin afectar a otra.
  - `organizacion_id` es la clave de aislamiento de toda entidad del dominio.
  - Que alguien juegue en otro circuito, y con qué categoría y puntos, no es asunto de esta organización. El ranking es independiente en cada circuito (F02).
- **El consentimiento va antes**, porque es el único momento en que datos de la persona pasan a una organización nueva. La ley de protección de datos personales (25.326) pide consentimiento informado para cederlos.
- **El link en el comprobante prueba que el email es suyo.** Sin eso, quien sabe un DNI ajeno y paga crearía la cuenta con los datos de otro. Reutiliza el token firmado sin tabla de la decisión 006.
- **Es coherente con las decisiones 039 y 040:** el ingreso devuelve un perfil por circuito, y con varios la app pregunta en cuál entra. Un circuito nuevo es un perfil más en esa lista.

## Qué se resigna

- **Crear la cuenta pide ir al email.** Se pierde resolverla en la pantalla del pago, que era el momento de mayor compromiso ([04-flujo-jugador.md](../04-flujo-jugador.md) §5.8).
- **El DNI queda en dos lugares:** en la cuenta, de la persona, y en cada perfil, para encontrarlo sin cuenta. Al vincularse tienen que coincidir.
- **Una cuenta no puede tener dos perfiles en la misma organización.** Si la organización cargó a alguien dos veces, se resuelve en el padrón.
- **Cada organización en la que se inscribe ve su DNI y su email**, con su consentimiento.

## Pendiente de código

- **`Usuario.dni`**, cifrado y único, con el mismo hash de búsqueda que `Jugador.dni` (decisión 049).
- **Un perfil por organización y cuenta:** `@@unique([organizacionId, usuarioId])` en `Jugador`. Hoy no existe: solo hay `@@index([usuarioId])`. En PostgreSQL, varios perfiles sin cuenta (`usuarioId` en null) no chocan con esa restricción.
- **Token de "Creá tu contraseña"**, firmado como el de la recuperación, con la inscripción de la que sale.
- **La app vuelve a pedir los perfiles** después de inscribirse en un circuito nuevo: hoy los recibe solo al ingresar ([decisión 039](039-ingreso-del-jugador.md)).
