import { describe, expect, it } from 'vitest';
import {
  avisoDeFechaAnotada,
  avisoDeFechaConfirmada,
  avisosDeFechaDeLaOrganizacion,
  avisosDeFixture,
  tokensDadosDeBaja,
} from '../../src/modules/avisos/avisos';

const pablo = { usuarioId: 7, nombre: 'Pablo' };
const martin = { usuarioId: 9, nombre: 'Martín' };
const sinCuenta = { usuarioId: null, nombre: 'Javier' };

describe('avisos de la fecha (F14)', () => {
  it('al anotar, le avisa al rival para que confirme', () => {
    expect(avisoDeFechaAnotada(pablo, martin, 'sáb 14 · 10:00', false)).toEqual([
      { usuarioId: 9, titulo: 'Pablo anotó la fecha', cuerpo: expect.stringContaining('sáb 14 · 10:00') },
    ]);
    expect(avisoDeFechaAnotada(pablo, martin, 'sáb 14 · 10:00', true)[0].titulo).toBe('Pablo cambió la fecha');
  });

  it('al confirmar, le avisa a quien la anotó', () => {
    expect(avisoDeFechaConfirmada(martin, pablo, 'sáb 14 · 10:00')).toEqual([
      { usuarioId: 7, titulo: 'Martín confirmó el partido', cuerpo: 'Quedó agendado: sáb 14 · 10:00.' },
    ]);
  });

  it('lo que carga la organización les llega a los dos, salvo a quien no tiene cuenta', () => {
    expect(avisosDeFechaDeLaOrganizacion(pablo, martin, 'sáb 14 · 10:00').map((a) => [a.usuarioId, a.titulo])).toEqual([
      [7, 'Tu partido con Martín quedó agendado'],
      [9, 'Tu partido con Pablo quedó agendado'],
    ]);
    expect(avisosDeFechaDeLaOrganizacion(pablo, sinCuenta, 'sáb 14 · 10:00')).toHaveLength(1);
    expect(avisoDeFechaAnotada(pablo, sinCuenta, 'sáb 14 · 10:00', false)).toEqual([]);
  });
});

describe('avisosDeFixture', () => {
  it('le dice a cada jugador con cuenta su zona', () => {
    const avisos = avisosDeFixture('Otoño 26 · Tercera', [
      { usuarioId: 7, grupo: 'C' },
      { usuarioId: 9, grupo: 'A' },
    ]);

    expect(avisos).toEqual([
      { usuarioId: 7, titulo: 'Ya está el fixture de Otoño 26 · Tercera', cuerpo: expect.stringContaining('zona C') },
      { usuarioId: 9, titulo: 'Ya está el fixture de Otoño 26 · Tercera', cuerpo: expect.stringContaining('zona A') },
    ]);
  });

  it('no avisa a quien no tiene cuenta: no tiene la app', () => {
    expect(avisosDeFixture('Otoño 26 · Tercera', [{ usuarioId: null, grupo: 'B' }])).toEqual([]);
  });
});

describe('tokensDadosDeBaja', () => {
  it('devuelve solo los tokens de celulares que ya no están registrados', () => {
    const tokens = ['ExponentPushToken[a]', 'ExponentPushToken[b]', 'ExponentPushToken[c]'];
    const tickets = [
      { status: 'ok' as const },
      { status: 'error' as const, details: { error: 'DeviceNotRegistered' } },
      { status: 'error' as const, details: { error: 'MessageRateExceeded' } },
    ];

    expect(tokensDadosDeBaja(tokens, tickets)).toEqual(['ExponentPushToken[b]']);
  });

  it('sin tickets, no da de baja a nadie', () => {
    expect(tokensDadosDeBaja(['ExponentPushToken[a]'], [])).toEqual([]);
  });
});
