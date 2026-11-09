# 082 — Quien sigue en la lista de espera al sortear se calcula, no se guarda

**Estado:** aceptada — 8 de noviembre de 2026

## Contexto

La lista de espera termina cuando se confirma el sorteo: desde ahí ya no se le puede dar el lugar a otro ([decisión 077](077-baja-hasta-el-sorteo.md)) y no se promueve a nadie ([decisión 076](076-lista-de-espera-24-horas.md)). Pero las inscripciones que seguían en la lista quedaban en `EN_LISTA_ESPERA`, y la pantalla de pago les seguía diciendo "Estás en la lista de espera".

Con la [decisión 081](081-anotarse-en-la-lista-de-espera.md), además, el perfil queda apartado mientras espera, y tiene que dejar de estarlo cuando la lista termina.

## Opciones consideradas

1. **Se calcula al consultar**: una inscripción en la lista de un torneo con el sorteo confirmado es una lista que terminó. Es el criterio de los partidos vencidos ([decisión 060](060-partidos-vencidos-calculados.md)).
   - En contra: esas inscripciones quedan como `EN_LISTA_ESPERA` en la base, y cada consulta nueva sobre la lista tiene que acordarse del sorteo.
2. **Al confirmar el sorteo, pasan a `EXPIRADA`.**
   - En contra: hay que tocar la confirmación del sorteo. Y `EXPIRADA` hoy quiere decir "venció la reserva": la app la avisa así, y habría que distinguir un caso del otro.

## Decisión

Opción 1, elegida por el grupo.

- **La pantalla de pago muestra `lista_terminada`**: *"La lista de espera terminó. Ya se sortearon las zonas y no se liberó un lugar para vos. No quedaste inscripto y no se te cobró nada"*. Sin rojo: no es un vencimiento. `estadoDe()` lo calcula con el sorteo del torneo.
- **El perfil deja de estar apartado** con el sorteo confirmado: la búsqueda y los chequeos de la reserva solo cuentan la lista de los torneos sin sortear.

## Por qué

- **No se toca la confirmación del sorteo**, que es una de las partes más delicadas del motor.
- **La lista ya terminaba así**: `promoverListaDeEspera()` mira el sorteo y no promueve a nadie. La pantalla y la búsqueda usan la misma condición.
- **El estado guardado no miente**: esa persona nunca dejó la lista; lo que terminó fue la lista.

## Qué se resigna

- **Una consulta nueva sobre la lista tiene que filtrar por el sorteo**, o mostraría como esperando a quien ya no espera.
- **No hay aviso cuando la lista termina.** Quien espera lo ve si vuelve a abrir el link; la pantalla ya le decía que la lista termina con el sorteo.
