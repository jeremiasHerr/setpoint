import { EstadoInscripcion } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import {
  alCerrarLaInscripcion,
  alVencer,
  avisosPendientes,
  estadoDe,
  estadoEnCurso,
} from '../../src/modules/inscripcion/estados';

const AHORA = new Date('2026-10-25T18:00:00Z');
const EN_10_MINUTOS = new Date('2026-10-25T18:10:00Z');
const HACE_10_MINUTOS = new Date('2026-10-25T17:50:00Z');
const AYER = new Date('2026-10-24T18:00:00Z');
const HACE_UN_MES = new Date('2026-09-25T18:00:00Z');

const inscripcion = (estado: EstadoInscripcion, cambios: Partial<{ reservaVence: Date; resueltaEn: Date; torneoId: number }> = {}) => ({
  estado,
  reservaVence: null as Date | null,
  resueltaEn: null as Date | null,
  torneoId: 1,
  ...cambios,
});

describe('estados de la inscripción', () => {
  it('muestra la solicitud, la aprobada y la no aprobada', () => {
    expect(estadoDe(inscripcion(EstadoInscripcion.SOLICITADA), AHORA)).toBe('solicitada');
    expect(estadoDe(inscripcion(EstadoInscripcion.APROBADA), AHORA)).toBe('aprobada');
    expect(estadoDe(inscripcion(EstadoInscripcion.NO_APROBADA), AHORA)).toBe('no_aprobada');
  });

  it('una reserva vencida se ve vencida antes de que corra la tarea', () => {
    expect(estadoDe(inscripcion(EstadoInscripcion.PENDIENTE_PAGO, { reservaVence: EN_10_MINUTOS }), AHORA)).toBe('reservando');
    expect(estadoDe(inscripcion(EstadoInscripcion.PENDIENTE_PAGO, { reservaVence: HACE_10_MINUTOS }), AHORA)).toBe('vencida');
  });

  it('en curso: la solicitud, la aprobada y la reserva vigente', () => {
    expect(estadoEnCurso(inscripcion(EstadoInscripcion.SOLICITADA), AHORA)).toBe(true);
    expect(estadoEnCurso(inscripcion(EstadoInscripcion.APROBADA), AHORA)).toBe(true);
    expect(estadoEnCurso(inscripcion(EstadoInscripcion.PENDIENTE_PAGO, { reservaVence: EN_10_MINUTOS }), AHORA)).toBe(true);
    expect(estadoEnCurso(inscripcion(EstadoInscripcion.PENDIENTE_PAGO, { reservaVence: HACE_10_MINUTOS }), AHORA)).toBe(false);
    expect(estadoEnCurso(inscripcion(EstadoInscripcion.PAGADA), AHORA)).toBe(false);
  });
});

describe('al vencer una reserva', () => {
  it('la de una solicitud aprobada vuelve a aprobada', () => {
    expect(alVencer({ resueltaEn: AYER })).toBe('volver_a_aprobada');
  });

  it('la de un torneo abierto o del padrón vence', () => {
    expect(alVencer({ resueltaEn: null })).toBe('expirar');
  });
});

describe('al cerrar la inscripción', () => {
  it('la solicitud sin aprobar no se aprueba y la aprobada sin pagar vence', () => {
    expect(alCerrarLaInscripcion(EstadoInscripcion.SOLICITADA)).toBe(EstadoInscripcion.NO_APROBADA);
    expect(alCerrarLaInscripcion(EstadoInscripcion.APROBADA)).toBe(EstadoInscripcion.EXPIRADA);
  });

  it('las pagadas y las reservas no se tocan (decisión 024)', () => {
    expect(alCerrarLaInscripcion(EstadoInscripcion.PAGADA)).toBeNull();
    expect(alCerrarLaInscripcion(EstadoInscripcion.PENDIENTE_PAGO)).toBeNull();
  });
});

describe('avisos de la app', () => {
  it('avisa la no aprobada y la vencida recientes', () => {
    const avisos = avisosPendientes(
      [
        inscripcion(EstadoInscripcion.NO_APROBADA, { resueltaEn: AYER, torneoId: 1 }),
        inscripcion(EstadoInscripcion.EXPIRADA, { resueltaEn: AYER, torneoId: 2 }),
      ],
      new Date('2026-10-01T00:00:00Z'),
    );
    expect(avisos.map((a) => a.torneoId)).toEqual([1, 2]);
  });

  it('no avisa las viejas', () => {
    const avisos = avisosPendientes(
      [inscripcion(EstadoInscripcion.EXPIRADA, { resueltaEn: HACE_UN_MES })],
      new Date('2026-10-01T00:00:00Z'),
    );
    expect(avisos).toEqual([]);
  });

  it('no avisa una vencida si después se inscribió en ese torneo', () => {
    const avisos = avisosPendientes(
      [
        inscripcion(EstadoInscripcion.EXPIRADA, { resueltaEn: AYER, torneoId: 1 }),
        inscripcion(EstadoInscripcion.PAGADA, { torneoId: 1 }),
      ],
      new Date('2026-10-01T00:00:00Z'),
    );
    expect(avisos).toEqual([]);
  });
});
