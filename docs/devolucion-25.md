# Devolución de la verificación del 25%

**Fecha:** octubre de 2026
**Alcance de este documento:** registra lo que dijo el profesor, cómo lo interpretamos y qué cambia en el proyecto. Los cambios que implican código quedan como pendientes; acá y en los documentos afectados solo se actualiza la documentación.

---

## 1. Qué dijo el profesor

- **El proyecto está bien, pero es confuso.** Cuesta entender de un vistazo qué es, para quién es y qué hace.
- **Está muy enfocado en POLENTA Team Tenis.** Parece hecho a medida de un cliente, no una plataforma.
- **La función de IA no lo convenció.** "Lo ideal es que sea todo automático."

**Nuestra respuesta en el momento:** una organización con datos previos (años de rankings en Excel) necesita una forma fácil de cargarlos, o no adopta la plataforma. La importación es la puerta de entrada de un circuito que ya existe.

---

## 2. Cómo lo interpretamos

**Lo confuso** es la documentación, no el producto. Los documentos arrancan por las reglas de POLENTA y recién después dicen que la plataforma es multi-organización. No había una página que resumiera todo en dos minutos.

**Lo de "hecho a medida"** viene de lo mismo, más los términos de POLENTA en la interfaz: "Complementaria", "Etapa", "Pretemporada" en los ejemplos. El modelo ya era configurable ([07-configurabilidad.md](07-configurabilidad.md)), pero no se notaba.

**Lo de la IA** tiene dos lecturas posibles:

1. **La importación hace poco y pide mucho.** Se usa pocas veces (la migración inicial y alguna alta suelta), y la revisión fila por fila da la impresión de que la IA propone y la persona hace el trabajo. Si 74 de 77 filas pasan todos los controles, pedir que se revisen las 77 es tirar el valor de la auditoría.
2. **La IA tiene que estar en el uso de todos los días**, no en una función que se usa una vez por año.

Respondemos a la primera con la importación por excepción (cambio C) y la detección del calendario (E). La segunda queda condicionada (I) y se la preguntamos al profesor (§4).

---

## 3. Cambios

| ID | Cambio | Crítica que responde | Estado | Docs afectados | ¿Requiere código? |
|---|---|---|---|---|---|
| **A1** | La documentación arranca por el problema general (circuitos amateur que se organizan con Excel y WhatsApp). POLENTA aparece después, como caso de validación | Hecho a medida | Decidido | [README](README.md), [01](01-vision.md), [02](02-dominio.md), [10](10-features.md) | No |
| **A2** | Donde una regla de POLENTA aparecía como regla del sistema, se reescribe como configuración con POLENTA como ejemplo | Hecho a medida | Decidido | [02](02-dominio.md), [03](03-flujo-organizacion.md), [04](04-flujo-jugador.md), [05](05-pagos.md), [10](10-features.md) | No |
| **A3** | Términos propios de POLENTA en la interfaz pasan a genéricos o configurables. "Complementaria" → **"cuadro consuelo"** por defecto, con nombre configurable por la organización. Lista completa en §3.1 | Hecho a medida | Decidido | [07](07-configurabilidad.md) §2.1, [design.md](design.md), [pantallas](pantallas/README.md) | Sí: textos de la web y un campo de configuración para el nombre |
| **A4** | Segunda organización ficticia en el seed, con otra configuración: **Liga Amateur del Valle**, sin ranking, inscripción abierta y sin cuadro consuelo | Hecho a medida | Decidido | [09](09-setup-inicial.md) | Sí: seed |
| **B** | Resumen de una página: [00-resumen.md](00-resumen.md). Primer enlace del README | Confuso | Decidido | [00](00-resumen.md), [README](README.md) | No |
| **C** | **Importación automática por excepción.** Lo que pasa todos los controles y tiene coincidencia de confianza alta (o es claramente nuevo) se importa sin pedir confirmación. La organización revisa solo lo que falló o es dudoso: "Importamos 74 jugadores. Revisá estos 3" | IA poco convincente | Decidido · *a confirmar con el profesor si es lo que quiso decir* (§4) | [06](06-ia.md) §1, [03](03-flujo-organizacion.md) §5, [10](10-features.md) F03 | Sí: confirmación parcial, control de apellido, migración para deshacer |
| **D** | En la interfaz, **"Etapa" → "Torneo del calendario"** y **`Torneo` → "Edición"**. En código, base y API no se renombra nada | Confuso | Decidido | [02](02-dominio.md) (glosario), [design.md](design.md), [pantallas](pantallas/README.md), [decisión 010](decisiones/010-torneo-del-calendario-en-la-interfaz.md) | Sí: textos de la web |
| **E1** | Si la organización no tiene torneos del calendario configurados, la importación **los detecta en los encabezados** y los propone en orden. Se crean al confirmar, en la misma transacción. Si ya tiene, usa los existentes y propone como nuevo lo que no coincide | IA poco convincente | Decidido | [06](06-ia.md) §1, [07](07-configurabilidad.md) §1.1, [03](03-flujo-organizacion.md) §3, [decisión 011](decisiones/011-la-importacion-detecta-el-calendario.md) | Sí: schema de respuesta, prompt v2, auditoría, eval |
| **E2** | Lo mismo con las **categorías**: se detectan por el título de la hoja o el nombre del archivo | IA poco convincente | Decidido | Ídem E1 | Sí |
| **E3** | Regla para encabezados que cruzan de año ("VERANO 25/26"): **cuenta el año en que termina** (2026) | — | Propuesto | [06](06-ia.md) §1, [decisión 011](decisiones/011-la-importacion-detecta-el-calendario.md) | Sí: una línea del prompt (el eval ya lo espera así) |
| **F1** | **Varias hojas en un archivo**, una por categoría. Hoy `leerPlanilla` solo lee la primera | IA poco convincente | Decidido | [06](06-ia.md) §1, [decisión 012](decisiones/012-importacion-de-varios-archivos-y-hojas.md) | Sí |
| **F2** | **Varios archivos**, uno por categoría (el caso real de POLENTA). Se procesan en paralelo; hasta 10 archivos de 2 MB | IA poco convincente | Decidido | Ídem F1 | Sí: migración (tabla por archivo/hoja) |
| **F3** | Un archivo por torneo del calendario (unir al mismo jugador entre archivos): **no se soporta en esta versión**. Limitación conocida | — | Decidido | Ídem F1 | No |
| **G1** | PDF con texto (exportado de Excel): se extrae línea por línea y se audita igual que un Excel | IA poco convincente | Propuesto | [06](06-ia.md) §1, [10](10-features.md) F03 | Sí |
| **G2** | Texto pegado (un ranking copiado de WhatsApp): se numeran las líneas y se audita igual | IA poco convincente | Propuesto | Ídem G1 | Sí |
| **G3** | Imágenes y PDF escaneados: el modelo lee la imagen. Sin texto contra el cual auditar, todas las filas pasan por revisión | IA poco convincente | Propuesto | Ídem G1 | Sí |
| **H1** | Ayuda en contexto: el texto que explica algo aparece donde hace falta, en lugar de un tutorial | Confuso | Propuesto | [03](03-flujo-organizacion.md) §3, [design.md](design.md) §9 | Sí |
| **H2** | Tarjeta **"Primeros pasos"** en el inicio del organizador, con pasos que se tildan solos | Confuso | Propuesto | Ídem H1 | Sí |
| **I** | **IA en el uso diario: F19** (resultados desde los mensajes de WhatsApp), con la misma arquitectura de la importación. Condicionada a terminar la importación y la app móvil | IA poco convincente | A confirmar con el profesor | [06](06-ia.md) §2, [10](10-features.md) F19 | Sí |

### 3.1 Términos de la interfaz

Relevados en `docs/pantallas/` y en `apps/web/src`.

| Término actual | Dónde aparece | Cambio | Estado |
|---|---|---|---|
| **Complementaria** (cuadro, zona) | Pantallas: cargar resultado, cierre, nuevo torneo, tablero, cuadros, landing. Web: `LandingPage`, `SeccionFormato`, `PanelComoQueda` | **"Cuadro consuelo"** por defecto, nombre configurable por la organización. POLENTA lo configura como "Complementaria" | Decidido (A3) |
| **Etapa** | Pantallas: tu circuito, nuevo torneo, importar padrón, ficha, landing, inicio. Web: `SeccionRanking`, `ResumenCircuito`, `SeccionBasico`, `LandingPage` | **"Torneo del calendario"** | Decidido (D) |
| **Torneo** (una categoría de una convocatoria) | Casi todas | **"Edición"** cuando pertenece a un torneo del calendario | Decidido (D) |
| **Campeonato** | Pantallas: cargar resultado, tablero, cuadros, landing | "Cuadro principal" por defecto, configurable igual que el consuelo | Propuesto |
| **Pretemporada**, **Primavera**, etc. | Datos de ejemplo de las pantallas | No es un término de la interfaz: es la configuración de POLENTA. Queda como ejemplo | Sin cambio |
| **Polenta Team Tenis** en el encabezado | Todas las pantallas del organizador y del jugador | Dato de ejemplo. La segunda organización del seed (A4) muestra que es un dato | Sin cambio |
| **Padrón** | Pantallas del organizador | Se entiende, pero suena administrativo. Alternativa: "Jugadores" en la navegación | Propuesto, baja prioridad |
| **Zona** | Todas | Genérico en el tenis amateur argentino | Sin cambio |

---

## 4. Preguntas para el profesor

Pendientes de respuesta.

1. **¿"Todo automático" se refiere a la importación o al uso diario?** Si es lo primero, la importación por excepción (C) lo responde: la IA importa sola lo que pasa los controles y la persona revisa solo lo dudoso. Si es lo segundo, la candidata es F19 (I).
2. **Si es el uso diario: ¿F19 alcanza, o espera otra cosa?** F19 reutiliza la arquitectura de la importación. Está condicionada al tiempo: va después de terminar la importación y la app móvil.
3. **¿Mantener la revisión humana en lo dudoso le parece correcto?** Lo sostenemos: un número inventado en el ranking es un error que el jugador ve y el organizador no detecta. La revisión ya no es de todo, solo de lo que el código no puede verificar.

---

## 5. Qué no cambia y por qué

**La arquitectura de la IA: "la IA extrae, el código audita, la persona confirma".** Lo que cambia es *cuánto* confirma la persona, no el principio. La auditoría es lo que permite automatizar: si un número no está en su fila, no entra, lo diga quien lo diga. Sacar la auditoría para que sea "más automático" sería más rápido y menos confiable. Por eso la importación por excepción es **más** automática que antes sin ser menos segura.

**El modelo de datos de etapas y torneos.** "Torneo del calendario" y "Edición" son textos de la interfaz. `Etapa` y `Torneo` siguen igual en el schema, la API y el código, porque el modelo es correcto: el problema era de nombres para el usuario, no de estructura. Renombrar en código costaría una migración, tocar los tres workspaces y reescribir documentos, sin cambiar ningún comportamiento ([decisión 010](decisiones/010-torneo-del-calendario-en-la-interfaz.md)).

**POLENTA como cliente de validación real.** Que el proyecto tenga un cliente real es su principal fortaleza: las reglas salen de un reglamento escrito y de datos reales, no de supuestos. Lo que cambia es el orden en que se presenta: primero el problema general, después POLENTA como prueba de que el problema existe y de que el sistema lo resuelve.
