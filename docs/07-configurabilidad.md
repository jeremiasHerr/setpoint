# Configurabilidad

> **Principio rector:** el sistema es multi-organización. POLENTA es el cliente de validación, no el molde. Pero generalizar de más también es un riesgo: un motor de reglas totalmente configurable no funciona bien para nadie y no se termina a tiempo.
>
> Criterio: **configurable lo que es barato y varía obviamente entre circuitos; fijo lo que es caro y probablemente no cambie.**

---

## 1. Parámetros de la organización

Se definen una vez, al dar de alta el circuito.

| Parámetro | Tipo | Ejemplo POLENTA |
|---|---|---|
| Categorías | Lista | Segunda, Tercera |
| Etapas del calendario | Lista ordenada | Primavera, Verano, Pretemporada, Otoño, Invierno |
| Tabla de puntos por instancia | Tabla | 100 / 75 / 50 / 25 / 15 / 10 |
| Ventana del ranking | Meses | 12 |
| ¿Cuentan todas las etapas o las mejores N? | `todas` \| `mejores_n` | `todas` |
| Puntos de ingreso de jugador nuevo | Número | 0 |

---

## 2. Parámetros del torneo

Se eligen al crear cada torneo. Pueden variar entre torneos de una misma organización.

### 2.1 Formato

| Parámetro | Valores | POLENTA |
|---|---|---|
| Cantidad de participantes | Número | 32 |
| Cantidad de grupos | Número | 8 |
| Clasificados por grupo a Campeonato | Número | 2 |
| **¿Hay zona Complementaria?** | `sí` \| `no` | `sí` |
| Modo de distribución | `serpentina` \| `directa` \| `bombos` | `serpentina` |
| **Modo de sorteo** | `automatico` \| `asistido` \| `manual` | a definir |

**Modo de sorteo** — resuelve el caso de los circuitos que hacen el sorteo como ceremonia:

- `automatico` — el sistema sortea y publica el resultado
- `asistido` — sortea en pantalla con animación, para proyectar durante la reunión presencial
- `manual` — la organización carga a mano en qué grupo quedó cada jugador, después de hacer el sorteo físico

> El modo `manual` es el más simple de programar de los tres y es el que respeta las tradiciones existentes sin obligar a nadie a cambiarlas. Debería ser el primero en implementarse.

### 2.2 Sistema de juego

| Parámetro | Valores | POLENTA |
|---|---|---|
| Sets del partido | `mejor_de_3` \| `mejor_de_5` | `mejor_de_3` |
| Punto de oro en 40-40 | `sí` \| `no` | `sí` |
| Tercer set | `set_completo` \| `super_tiebreak` | `super_tiebreak` |
| Games por set | Número | 6 |
| Puntos del tie-break | Número | 7 |
| Puntos del super tie-break | Número | 10 |

Estos parámetros solo afectan la **validación** al cargar un resultado y el cómputo de sets/games para desempates. No cambian la lógica del torneo.

### 2.3 Plazos

| Parámetro | POLENTA |
|---|---|
| Plazo de la fase de grupos | 3 semanas |
| Plazo por ronda eliminatoria | 1 semana |
| Reprogramaciones permitidas por partido | 1 |
| Antelación mínima para reprogramar | 24 horas |

### 2.4 Sedes y costos

| Parámetro | Valores | POLENTA |
|---|---|---|
| Sede en fase de grupos | `libre` \| `designada` | `libre` |
| Sede en eliminatorias | `libre` \| `designada` | `designada` |
| Instancia desde la que paga la organización | Ronda | a confirmar |

### 2.5 Inscripción

| Parámetro | Valores | POLENTA |
|---|---|---|
| **`modo_inscripcion`** | `cerrada` \| `con_aprobacion` \| `abierta` | `cerrada` |
| Cupo por categoría | Número | Según convocatoria |
| Importe | Monto | $45.000 ARS |
| ¿Hay lista de espera? | `sí` \| `no` | Sí |
| Minutos de reserva de cupo | Número | 15 |

**`modo_inscripcion`** — quién puede anotarse a un torneo:

| Valor | Comportamiento | Quién entra al padrón |
|---|---|---|
| `cerrada` | Solo jugadores que ya están en el padrón de la organización | La organización los da de alta manualmente |
| `con_aprobacion` | Cualquiera solicita; la organización aprueba o rechaza | Al aprobarse la solicitud |
| `abierta` | Cualquiera se inscribe pagando | Automáticamente al inscribirse, con 0 puntos |

> **POLENTA usa `cerrada`.** Su reglamento exige ser aceptado en el grupo de WhatsApp, y el Comité decide a quién incorpora según comportamiento y nivel de juego, sin obligación de explicar un rechazo. Un desconocido inscribiéndose solo **no es un caso a resolver: es un caso a impedir**.
>
> Los otros dos modos existen porque otros circuitos pueden querer inscripción abierta. Es un `if` en el endpoint de inscripción, no una funcionalidad aparte.

---

## 3. Fijo en v1

| Decisión | Por qué | Puerta abierta |
|---|---|---|
| **Solo single** | Dobles cambia el modelo de participante entero: la pareja pasa a ser la unidad, y el ranking se fragmenta | Es la decisión de alcance más importante del proyecto. No se revisa antes de la entrega |
| **Cascada de desempates fija** | La secuencia del reglamento POLENTA coincide con la práctica habitual | Implementada como **lista ordenada de comparadores**: reordenarla es cambiar un array, no reescribir lógica |
| **Ranking por casilleros** | Es el modelo de la ATP, no una particularidad de POLENTA (ver [02-dominio.md](02-dominio.md) §7) | Los parámetros que varían ya están en §1 |
| **Eliminación directa en cuadros** | Universal en tenis | — |

---

## 4. Lo que NO es responsabilidad de la plataforma

Distinción importante: hay reglas que son del **reglamento de cada circuito**, no del software.

| Regla POLENTA | Tratamiento en el sistema |
|---|---|
| Obligación de enviar foto de ambos jugadores al terminar | **El partido admite fotos adjuntas, opcionalmente.** Si un circuito quiere obligar, lo hace su reglamento. Si están, la crónica las usa |
| Penalidad de 1 game por cada 5 minutos de retraso | No se modela. Se refleja en el resultado que se carga |
| Código de conducta, saludo final, cantar el tanteador | Fuera de alcance |
| Asado de camaradería | Dato de la ficha del torneo, sin lógica asociada |
| Aceptación al grupo de WhatsApp como requisito de ingreso | La plataforma solo ofrece `modo_inscripcion: cerrada`. Cómo decide la organización a quién acepta es asunto suyo |

> La plataforma **habilita**, no impone. Es la diferencia entre un producto multi-organización y una herramienta hecha para un solo cliente.
