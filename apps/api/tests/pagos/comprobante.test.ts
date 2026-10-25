import { describe, expect, it } from 'vitest';
import { notificacionMercadoPagoSchema } from '@setpoint/shared';
import { comprobante, fechaDelPago } from '../../src/modules/pagos/comprobante';

const DATOS = {
  inscripcionId: 100482,
  jugador: 'Lucas Bravo',
  torneo: 'Primavera 26',
  categoria: 'Tercera',
  organizacion: 'Polenta Team Tenis',
  monto: 45000,
  pagadoEn: new Date('2026-09-20T21:42:00Z'),
  linkDelTorneo: 'http://localhost:5173/c/polenta/torneos/2',
};

describe('comprobante', () => {
  it('lleva lo que pide F12: jugador, torneo, categoría, monto, número, fecha y link', () => {
    const { asunto, texto } = comprobante(DATOS);
    expect(asunto).toBe('Estás inscripto en Primavera 26 · Tercera');
    expect(texto).toContain('Jugador: Lucas Bravo');
    expect(texto).toContain('Categoría: Tercera');
    expect(texto).toContain('Monto: $45.000');
    expect(texto).toContain('Número de inscripción: 100482');
    expect(texto).toContain('http://localhost:5173/c/polenta/torneos/2');
  });

  it('la fecha va en la hora de Argentina, con el formato de design.md', () => {
    expect(fechaDelPago(DATOS.pagadoEn)).toBe('dom 20 sept · 18:42');
  });
});

describe('notificación de MercadoPago', () => {
  it('toma el id del pago, venga como texto o como número', () => {
    expect(notificacionMercadoPagoSchema.parse({ type: 'payment', data: { id: 123 } }).data.id).toBe('123');
  });

  it('rechaza lo que no trae un id', () => {
    expect(notificacionMercadoPagoSchema.safeParse({ type: 'payment' }).success).toBe(false);
  });
});
