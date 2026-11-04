// Mensajes de los avisos push (F11). Lógica pura: arma qué se le dice a cada uno, sin enviar nada.

export type Aviso = { usuarioId: number; titulo: string; cuerpo: string };

type InscriptoConZona = { usuarioId: number | null; grupo: string };

// Al confirmarse el sorteo: a cada jugador con cuenta, su zona. Los que no tienen cuenta
// no tienen la app y se enteran por el grupo, como hoy.
export function avisosDeFixture(torneo: string, inscriptos: InscriptoConZona[]): Aviso[] {
  return inscriptos.flatMap(({ usuarioId, grupo }) =>
    usuarioId === null
      ? []
      : [{ usuarioId, titulo: `Ya está el fixture de ${torneo}`, cuerpo: `Te tocó la zona ${grupo}. Mirá contra quién jugás y coordiná las fechas.` }],
  );
}

type Persona = { usuarioId: number | null; nombre: string };

// Un jugador anotó, cambió o reprogramó la fecha (F14): el rival confirma con un toque
// (04-flujo-jugador §6.2). Sin cuenta, no hay a quién avisar.
export function avisoDeFechaAnotada(quien: Persona, rival: Persona, cuando: string, cambio: boolean): Aviso[] {
  if (rival.usuarioId === null) return [];
  return [
    {
      usuarioId: rival.usuarioId,
      titulo: cambio ? `${quien.nombre} cambió la fecha` : `${quien.nombre} anotó la fecha`,
      cuerpo: `${cuando}. Confirmala en la app para que quede agendado para los dos.`,
    },
  ];
}

// El rival confirmó: le avisa a quien la anotó.
export function avisoDeFechaConfirmada(quien: Persona, anoto: Persona, cuando: string): Aviso[] {
  if (anoto.usuarioId === null) return [];
  return [{ usuarioId: anoto.usuarioId, titulo: `${quien.nombre} confirmó el partido`, cuerpo: `Quedó agendado: ${cuando}.` }];
}

// La organización cargó la fecha en nombre de los dos: queda confirmada (decisión 064) y se les
// avisa a ambos, cada uno con el nombre del otro.
export function avisosDeFechaDeLaOrganizacion(a: Persona, b: Persona, cuando: string): Aviso[] {
  return [
    [a, b],
    [b, a],
  ].flatMap(([jugador, rival]) =>
    jugador.usuarioId === null
      ? []
      : [{ usuarioId: jugador.usuarioId, titulo: `Tu partido con ${rival.nombre} quedó agendado`, cuerpo: `Lo anotó la organización: ${cuando}.` }],
  );
}

type Ticket ={ status: 'ok' } | { status: 'error'; details?: { error?: string } };

// Los tokens que el servicio de Expo dice que ya no sirven: la app se desinstaló o se le quitó
// el permiso. Los tickets vuelven en el mismo orden que los mensajes.
export function tokensDadosDeBaja(tokens: string[], tickets: Ticket[]): string[] {
  return tokens.filter((_, i) => {
    const ticket = tickets[i];
    return ticket?.status === 'error' && ticket.details?.error === 'DeviceNotRegistered';
  });
}
