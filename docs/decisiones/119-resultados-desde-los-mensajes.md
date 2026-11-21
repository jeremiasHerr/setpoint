# 119 — Resultados desde los mensajes: quién ganó, dónde se guarda y cómo se corrige

**Estado:** aceptada — 21 de noviembre de 2026.

## Contexto

F19 es la segunda funcionalidad de IA desde la [decisión 117](117-las-proyecciones-no-son-ia.md): la organización pega los mensajes del grupo de WhatsApp, la IA lee los resultados y lo que pasa los controles se carga solo, como en la importación ([06-ia.md](../06-ia.md) §2). Implementarla dejó tres decisiones abiertas:

- Muchos mensajes están en primera persona ("le gané a Pedro 6-4 6-3"). ¿De dónde sale quién ganó?
- El schema tenía `ExtraccionResultado`, una fila por partido, sin `organizacionId` ni `torneoId`. ¿Qué se guarda de cada lectura?
- Un resultado que se carga solo puede estar mal. ¿Cómo se arregla?

## Opciones consideradas

**Quién ganó:**

1. **Por el remitente.** Se pega como lo copia WhatsApp, con "[20/11/26 18:03] Juan Pérez: …". El código verifica que quien lo manda sea uno de los dos jugadores y que "le gané" o "perdí" coincida con los sets.
2. **Solo mensajes en tercera persona.** Lo que no nombra a los dos jugadores va siempre a revisión.
   - En contra: la mayoría de los mensajes están en primera persona, así que casi nada se cargaría solo.

**Qué se guarda:**

1. **Una fila por pegado.** `ExtraccionResultado` pasa a ser la lectura: organización, torneo, el texto, la respuesta cruda y un resumen con cada resultado leído, su estado y su motivo. Es lo que hace la importación.
2. **Un lote y una fila por resultado.** Se puede consultar por partido.
   - En contra: dos tablas y una migración más grande a días de la entrega, para una consulta que ninguna pantalla hace.

**Cómo se corrige:**

1. **A mano, desde Cargar resultado**, con las reglas de corrección de siempre. La pantalla lista lo que se cargó.
2. **Deshacer la lectura entera**, como la importación.
   - En contra: choca con la [decisión 028](028-correccion-de-resultados.md). Si el ganador ya avanzó en el cuadro y jugó el partido siguiente, no se puede deshacer.

## Decisión

En los tres casos, la opción 1, elegida por el grupo. Además, al implementarlo:

- **El código separa los mensajes** (hora, remitente y texto), en los tres formatos de WhatsApp. La IA recibe los mensajes numerados y los partidos con sus jugadores A y B, y devuelve los sets del lado de A y de B.
- **La auditoría** (`auditar.ts`, pura y con tests) exige que los dos jugadores estén en el mensaje o sean quien lo manda, que cada set esté escrito en el mensaje, que el marcador sea válido en el torneo y que la confianza sea alta. Un nombre de pila que se repite en el torneo no identifica a nadie.
- **Se carga con el mismo `guardarResultado`** que la carga a mano. Lo que no se puede guardar pasa a revisión con el motivo.
- **Un partido que ya tiene ese resultado no se toca.** Así, pegar dos veces los mismos mensajes no carga nada dos veces.
- **Desde la revisión**, cada resultado se carga tal como se leyó, se abre en Cargar resultado para cambiarlo, o se descarta.

## Por qué

- **El remitente es el dato que ya viene en el texto copiado.** Pedir mensajes en tercera persona le cambiaría la costumbre al grupo; verificar al remitente con el código mantiene la regla de la importación: la IA propone y el código controla.
- **Una fila por pegado sigue lo que ya funciona** en la importación, y la tabla vieja no tenía uso.
- **Corregir a mano no requiere nada nuevo** y respeta lo que ya está decidido sobre las correcciones.

## Qué se resigna

- **Si el contacto está agendado con otro nombre** ("Tito"), sus mensajes en primera persona van a revisión.
- **Los resultados leídos no se consultan por SQL:** están en un JSON.
- **No hay un deshacer en bloque.** Un error se corrige partido por partido.
- **La tabla pierde `partidoId`.** Una migración la convierte en la lectura; como no tenía filas, no se pierde nada.
