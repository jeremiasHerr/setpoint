import { describe, expect, it } from 'vitest';
import {
  accionDeFecha,
  accionDeLaOrganizacion,
  cambioDeFecha,
  diaYHoraEnArgentina,
  diasDisponibles,
  fechaCorta,
  instanteEnArgentina,
  problemaAlConfirmar,
  problemaDeFecha,
  quienAnoto,
  sedeElegida,
  ultimoDiaDelPlazo,
  type PartidoACoordinar,
} from '../../src/modules/coordinacion/coordinacion';

const POLENTA = { reprogramacionesPermitidas: 1, horasAntelacionReprogramar: 24 };

function partido(datos: Partial<PartidoACoordinar> = {}): PartidoACoordinar {
  return {
    estado: 'PENDIENTE_COORDINACION',
    jugadorAId: 1,
    jugadorBId: 2,
    // El plazo vence el domingo 15: se guarda a la medianoche UTC de ese día.
    fechaLimite: new Date('2026-11-15T00:00:00.000Z'),
    fechaAcordada: null,
    reprogramaciones: 0,
    ...datos,
  };
}

describe('fechas de Argentina', () => {
  it('el día y la hora elegidos son de Argentina, tres horas antes que UTC', () => {
    expect(instanteEnArgentina('2026-11-14', '10:00').toISOString()).toBe('2026-11-14T13:00:00.000Z');
  });

  it('a la noche sigue siendo el mismo día en Argentina aunque en UTC ya sea el siguiente', () => {
    const instante = instanteEnArgentina('2026-11-14', '22:30');

    expect(instante.toISOString()).toBe('2026-11-15T01:30:00.000Z');
    expect(diaYHoraEnArgentina(instante)).toEqual({ dia: '2026-11-14', hora: '22:30' });
  });

  it('arma la fecha corta de los avisos', () => {
    expect(fechaCorta(instanteEnArgentina('2026-11-14', '10:00'))).toBe('sáb 14 · 10:00');
  });
});

describe('diasDisponibles', () => {
  it('ofrece de hoy al último día del plazo, incluido', () => {
    expect(diasDisponibles('2026-11-11', '2026-11-15')).toEqual([
      '2026-11-11',
      '2026-11-12',
      '2026-11-13',
      '2026-11-14',
      '2026-11-15',
    ]);
  });

  it('con el plazo vencido no ofrece ningún día', () => {
    expect(diasDisponibles('2026-11-16', '2026-11-15')).toEqual([]);
  });

  it('sin plazo ofrece las dos semanas siguientes, cruzando el fin de mes', () => {
    const dias = diasDisponibles('2026-11-25', null);

    expect(dias).toHaveLength(14);
    expect(dias.at(-1)).toBe('2026-12-08');
  });

  it('toma el último día de la fecha límite en UTC', () => {
    expect(ultimoDiaDelPlazo(new Date('2026-11-15T00:00:00.000Z'))).toBe('2026-11-15');
    expect(ultimoDiaDelPlazo(null)).toBeNull();
  });
});

describe('accionDeFecha', () => {
  const ahora = new Date('2026-11-10T12:00:00.000Z');
  const enTresDias = new Date('2026-11-13T12:00:00.000Z');

  it('sin fecha, la anota', () => {
    expect(accionDeFecha(partido(), POLENTA, ahora)).toEqual({ accion: 'anotar' });
  });

  it('con una fecha sin confirmar, la cambia sin gastar reprogramaciones (decisión 065)', () => {
    expect(accionDeFecha(partido({ estado: 'ANOTADA', fechaAcordada: enTresDias }), POLENTA, ahora)).toEqual({ accion: 'cambiar' });
  });

  it('con una fecha confirmada y tiempo de sobra, la reprograma', () => {
    expect(accionDeFecha(partido({ estado: 'CONFIRMADA', fechaAcordada: enTresDias }), POLENTA, ahora)).toEqual({
      accion: 'reprogramar',
    });
  });

  it('no reprograma si ya usó las que permite el torneo', () => {
    const confirmada = partido({ estado: 'CONFIRMADA', fechaAcordada: enTresDias, reprogramaciones: 1 });

    expect(accionDeFecha(confirmada, POLENTA, ahora)).toEqual({ bloqueo: 'SIN_REPROGRAMACIONES' });
    expect(accionDeFecha(confirmada, { ...POLENTA, reprogramacionesPermitidas: 2 }, ahora)).toEqual({ accion: 'reprogramar' });
  });

  it('no reprograma con menos de 24 horas: quien no puede cumplir da W.O. (02-dominio §8.3)', () => {
    const manana = new Date('2026-11-11T11:00:00.000Z');

    expect(accionDeFecha(partido({ estado: 'CONFIRMADA', fechaAcordada: manana }), POLENTA, ahora)).toEqual({
      bloqueo: 'SIN_ANTELACION',
    });
  });

  it('un partido con el plazo vencido no se coordina: se calcula como en el tablero (decisión 060)', () => {
    const lunes = new Date('2026-11-16T12:00:00.000Z');
    const domingo = new Date('2026-11-15T12:00:00.000Z');

    expect(accionDeFecha(partido(), POLENTA, domingo)).toEqual({ accion: 'anotar' });
    expect(accionDeFecha(partido(), POLENTA, lunes)).toEqual({ bloqueo: 'PLAZO_VENCIDO' });
    expect(accionDeFecha(partido({ estado: 'ANOTADA', fechaAcordada: domingo }), POLENTA, lunes)).toEqual({ bloqueo: 'PLAZO_VENCIDO' });
  });

  it('un partido terminado, vencido o sin rival no se coordina desde la app', () => {
    expect(accionDeFecha(partido({ estado: 'JUGADA' }), POLENTA, ahora)).toEqual({ bloqueo: 'PARTIDO_TERMINADO' });
    expect(accionDeFecha(partido({ estado: 'WALKOVER' }), POLENTA, ahora)).toEqual({ bloqueo: 'PARTIDO_TERMINADO' });
    expect(accionDeFecha(partido({ estado: 'VENCIDA' }), POLENTA, ahora)).toEqual({ bloqueo: 'PLAZO_VENCIDO' });
    expect(accionDeFecha(partido({ jugadorBId: null }), POLENTA, ahora)).toEqual({ bloqueo: 'SIN_RIVAL' });
  });
});

describe('accionDeLaOrganizacion', () => {
  const ahora = new Date('2026-11-10T12:00:00.000Z');

  it('no tiene el límite de reprogramaciones ni la antelación', () => {
    const enUnaHora = new Date('2026-11-10T13:00:00.000Z');

    expect(accionDeLaOrganizacion(partido({ estado: 'CONFIRMADA', fechaAcordada: enUnaHora, reprogramaciones: 5 }), ahora)).toEqual({
      accion: 'reprogramar',
    });
  });

  it('no coordina un partido con resultado, sin rival o vencido: se resuelve con el W.O. (decisión 062)', () => {
    expect(accionDeLaOrganizacion(partido({ estado: 'JUGADA' }), ahora)).toEqual({ bloqueo: 'PARTIDO_TERMINADO' });
    expect(accionDeLaOrganizacion(partido({ jugadorAId: null }), ahora)).toEqual({ bloqueo: 'SIN_RIVAL' });
    expect(accionDeLaOrganizacion(partido(), new Date('2026-11-16T12:00:00.000Z'))).toEqual({ bloqueo: 'PLAZO_VENCIDO' });
  });
});

describe('problemaDeFecha', () => {
  const ahora = new Date('2026-11-14T12:00:00.000Z'); // sábado 14, 9:00 en Argentina

  it('no acepta una hora que ya pasó', () => {
    expect(problemaDeFecha(instanteEnArgentina('2026-11-14', '08:00'), '2026-11-15', ahora)).toBe('FECHA_PASADA');
  });

  it('no se puede pasar del plazo, tampoco la organización', () => {
    expect(problemaDeFecha(instanteEnArgentina('2026-11-15', '20:00'), '2026-11-15', ahora)).toBeNull();
    expect(problemaDeFecha(instanteEnArgentina('2026-11-16', '10:00'), '2026-11-15', ahora)).toBe('FUERA_DEL_PLAZO');
  });

  it('el último día a la noche entra, aunque en UTC ya sea el día siguiente', () => {
    expect(problemaDeFecha(instanteEnArgentina('2026-11-15', '22:30'), '2026-11-15', ahora)).toBeNull();
  });

  it('sin plazo, cualquier fecha futura', () => {
    expect(problemaDeFecha(instanteEnArgentina('2026-12-20', '10:00'), null, ahora)).toBeNull();
  });
});

describe('cambioDeFecha', () => {
  it('lo que anota un jugador espera la confirmación del rival', () => {
    expect(cambioDeFecha('anotar', 0, false)).toEqual({ estado: 'ANOTADA', reprogramaciones: 0, evento: 'ANOTADA' });
    expect(cambioDeFecha('cambiar', 0, false)).toEqual({ estado: 'ANOTADA', reprogramaciones: 0, evento: 'CAMBIADA' });
  });

  it('reprogramar vuelve a esperar la confirmación y cuenta una más', () => {
    expect(cambioDeFecha('reprogramar', 0, false)).toEqual({ estado: 'ANOTADA', reprogramaciones: 1, evento: 'REPROGRAMADA' });
  });

  it('lo que carga la organización queda confirmado y no gasta reprogramaciones (decisión 064)', () => {
    expect(cambioDeFecha('reprogramar', 1, true)).toEqual({ estado: 'CONFIRMADA', reprogramaciones: 1, evento: 'REPROGRAMADA' });
  });
});

describe('problemaAlConfirmar', () => {
  it('confirma el rival de quien anotó', () => {
    expect(problemaAlConfirmar({ estado: 'ANOTADA', anotadaPorId: 10 }, 20)).toBeNull();
  });

  it('quien anotó no se confirma a sí mismo', () => {
    expect(problemaAlConfirmar({ estado: 'ANOTADA', anotadaPorId: 10 }, 10)).toBe('ANOTADA_POR_VOS');
  });

  it('solo se confirma una fecha anotada', () => {
    expect(problemaAlConfirmar({ estado: 'PENDIENTE_COORDINACION', anotadaPorId: null }, 20)).toBe('NADA_PARA_CONFIRMAR');
    expect(problemaAlConfirmar({ estado: 'CONFIRMADA', anotadaPorId: 10 }, 20)).toBe('NADA_PARA_CONFIRMAR');
  });
});

describe('sedeElegida', () => {
  it('con sede designada, la pone el torneo', () => {
    expect(sedeElegida('DESIGNADA', 3, [3, 4], { clubId: 4, sedeTexto: 'otra' })).toEqual({ clubId: 3, sedeTexto: null });
  });

  it('en zona eligen un club del circuito o escriben la sede', () => {
    expect(sedeElegida('LIBRE', null, [3, 4], { clubId: 4, sedeTexto: null })).toEqual({ clubId: 4, sedeTexto: null });
    expect(sedeElegida('LIBRE', null, [], { clubId: null, sedeTexto: 'Club Independiente' })).toEqual({
      clubId: null,
      sedeTexto: 'Club Independiente',
    });
  });

  it('rechaza un club de otro circuito y la sede vacía', () => {
    expect(sedeElegida('LIBRE', null, [3], { clubId: 9, sedeTexto: null })).toBe('CLUB_NO_ENCONTRADO');
    expect(sedeElegida('LIBRE', null, [3], { clubId: null, sedeTexto: null })).toBe('FALTA_SEDE');
  });
});

describe('quienAnoto', () => {
  it('distingue al que pregunta, al rival y a la organización', () => {
    expect(quienAnoto(null, 10, 20)).toBeNull();
    expect(quienAnoto(10, 10, 20)).toBe('yo');
    expect(quienAnoto(20, 10, 20)).toBe('rival');
    expect(quienAnoto(99, 10, 20)).toBe('organizacion');
  });
});
