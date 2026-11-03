# 062 — En el tablero se resuelve con el W.O. y se les escribe por WhatsApp

**Estado:** aceptada — 30 de octubre de 2026

## Contexto

En la pantalla de referencia, cada fila de "Lo que falta" tiene acciones: **Resolver** un vencido ("W.O., doble W.O. o extensión"), **Escribirles** a los dos jugadores, **Anotar fecha** en un partido sin coordinar, y abajo **Recordarles a los N** que no tienen fecha.

Anotar la fecha es F14, que todavía no existe. El doble W.O. no se puede cargar ([03-flujo-organizacion.md](../03-flujo-organizacion.md) §10), y extender el plazo de un partido no tiene endpoint.

## Opciones consideradas

1. **Resolver y Escribirles.** Resolver abre *Cargar resultado* con el W.O. elegido, que es lo que pide F15. Escribirles abre el WhatsApp de cada jugador.
   - En contra: no están el doble W.O. ni la extensión, y la fila de un partido sin coordinar solo ofrece Escribirles.
2. **Lo anterior y extender el plazo**, cambiando la `fechaLimite` del partido. Es lo que POLENTA hace en la práctica (02-dominio §8.4).
   - En contra: un endpoint nuevo y un diálogo más, con la entrega encima.
3. **Lo anterior y Recordarles**, con un aviso push ([decisión 047](047-avisos-push.md)).
   - En contra: solo le llega a quien tiene la app instalada y la sesión iniciada; en la demo, probablemente a nadie.

## Decisión

Opción 1.

- **Resolver** está solo en los vencidos y lleva a `/torneos/:id/resultados/:partidoId?tipo=walkover`: *Cargar resultado* abre con "Fue walkover" marcado, y la organización elige quién ganó. Si el partido ya tiene resultado, el parámetro no cambia nada.
- **Escribirles** abre, debajo de la fila, un enlace de WhatsApp para cada jugador, con un mensaje listo: con quién juega, dónde y hasta cuándo. Usa el teléfono del padrón con `urlDeWhatsApp()` de `features/padron/linkPersonal.ts`, la misma que el link personal. Un jugador sin teléfono lo dice en lugar del enlace.
- **El tablero devuelve el teléfono de los jugadores**, porque es solo para quien administra, que ya los ve en el padrón. Ninguna vista pública lo incluye.
- **Anotar fecha** llega con F14, y **Recordarles** queda afuera.

## Por qué

- **Es lo que pide F15** ("resolver los partidos vencidos otorgando el walkover que corresponda") **sin pantallas nuevas:** la carga del W.O. ya existe.
- **Escribirles es lo que la organización hace hoy**, pero sin buscar el número.

## Qué se resigna

- **No se puede extender el plazo de un partido ni cargar un doble W.O.** La organización que quiere darle más días lo deja vencido hasta que se juegue, y el resultado se carga igual.
- **La referencia tiene botones que el tablero no tiene** (Anotar fecha, Recordarles). Anotar fecha vuelve con F14.
