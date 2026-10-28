# 056 — Quien pierde antes de octavos en el cuadro principal recibe participación

**Estado:** aceptada — 27 de octubre de 2026

## Contexto

La tabla de puntos ([02-dominio.md](../02-dominio.md) §7.4) va de campeón a octavos, más participación. En POLENTA el cuadro principal es de 16 (8 zonas, 2 clasificados), así que la primera ronda es octavos y alcanza. Pero el formato es configurable: con 16 zonas, o con más clasificados por zona, el cuadro principal tiene 32 lugares y la primera ronda es dieciseisavos, una instancia que la tabla no tiene. El enum `Instancia` del schema sí tiene `DIECISEISAVOS`, pero ni la pantalla *Tu circuito* ni la API del circuito la ofrecen.

Al cerrar el torneo (F16) hay que darle algún puntaje a quien pierde en esa ronda.

## Opciones consideradas

1. **Participación.**
   - En contra: perder en dieciseisavos del cuadro principal vale lo mismo que jugar el cuadro consuelo.
2. **Agregar dieciseisavos a la tabla de puntos**, configurable como las demás.
   - En contra: cambia *Tu circuito*, la API del circuito y el schema compartido por un caso que POLENTA no tiene.

## Decisión

Opción 1. Quien pierde en el cuadro principal antes de octavos recibe la instancia de participación, igual que todo el cuadro consuelo. Con byes cuenta la ronda en que perdió cada uno: quien entra directo a octavos y pierde ahí es octavos.

## Por qué

- **Es lo que la tabla ya premia con participación:** completar la fase de grupos sin llegar a una instancia con puntos propios.
- **No toca la configuración del circuito**, y ningún circuito real que conocemos tiene un cuadro principal de 32.

## Qué se resigna

- **Un circuito con cuadros de 32 no puede premiar los dieciseisavos.** Si aparece, se agrega la fila a la tabla de puntos: el enum ya existe y la cuenta de instancias en `cierre.ts` es una lista que se alarga.
