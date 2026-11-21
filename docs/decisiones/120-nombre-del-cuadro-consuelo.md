# 120 — El nombre del cuadro consuelo

**Estado:** aceptada — 21 de noviembre de 2026. Tomada durante la implementación, sin consultar al grupo: revisarla en el PR.

## Contexto

La devolución del 25% (cambio A3) pidió que "Complementaria" pase a "cuadro consuelo" por defecto, con el nombre configurable por organización ([07](../07-configurabilidad.md) §1.2). El texto quedó fijo en la web, en la app y en dos textos que arma la API. Había que decidir dónde se guarda el nombre y cómo llega a cada pantalla.

## Opciones consideradas

- **Una columna opcional en la organización, y la API manda el nombre ya resuelto en cada respuesta que lo muestra.** Null es "Cuadro consuelo". Cada pantalla lo toma de la respuesta que ya consume.
- **Una columna opcional, y un endpoint o contexto de la organización que la web y la app piden aparte.** Hace falta saber el slug en las páginas públicas y esperar una segunda llamada antes de poder escribir "cuadros".
- **Una tabla de nombres por término** (cuadro consuelo, Campeonato, etapa, edición). Resuelve también la decisión abierta 16, pero es la sobregeneralización que 07 §1.2 descarta.

## Decisión

La primera. `Organizacion.nombreCuadroConsuelo` (texto, hasta 40 caracteres, null por defecto), que se edita en *Tu circuito* > *Quiénes son*. La API lo devuelve resuelto (`nombreCuadroConsuelo`) en el tablero, las zonas y los cuadros del torneo en vivo, el cierre, la ficha, Cargar resultado, la lectura de mensajes y Mi zona, y lo usa en los textos que arma ella misma (la instancia de un partido y el contexto que recibe la IA).

## Por qué

- Las pantallas públicas no tienen sesión ni conocen la organización más que por el slug: con el nombre en la respuesta no hacen una llamada más ni muestran un instante el nombre equivocado.
- El valor por defecto vive en un solo lugar (`packages/shared`), y quien lo recibe nunca maneja un null.
- Para el mensaje de WhatsApp que lee la IA, el nombre de la organización es el que usan los jugadores, así que el partido se ubica mejor.

## Qué se resigna

- Cada respuesta nueva que muestre el cuadro consuelo tiene que acordarse de llevar el campo; el tipo lo exige, y el compilador avisa.
- Los textos del consuelo en minúscula a mitad de frase ("va al complementaria") salen del nombre tal cual, sin artículo: se escribió "va al" con el nombre en minúscula y un nombre femenino queda con el artículo equivocado. Se acepta; quien lo note puede llamarlo "Cuadro Complementaria".
- "Campeonato" sigue fijo hasta resolver la decisión abierta 16.
