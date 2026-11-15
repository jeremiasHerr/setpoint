import { describe, expect, it } from 'vitest';
import { conciliacion, devolucionDe, type PagoCobrado } from '../../src/modules/inscripciones/conciliacion';

const pago = (datos: Partial<PagoCobrado>): PagoCobrado => ({
  medio: 'MERCADOPAGO',
  monto: 45000,
  requiereDevolucion: false,
  devueltoEn: null,
  ...datos,
});

describe('conciliacion', () => {
  it('separa lo cobrado por MercadoPago de lo cobrado por fuera, sin comisión (decisión 103)', () => {
    const resultado = conciliacion([
      ...Array.from({ length: 29 }, () => pago({})),
      pago({ medio: 'EFECTIVO' }),
    ]);

    expect(resultado).toEqual({
      mercadoPago: 1305000,
      pagosMercadoPago: 29,
      porFuera: 45000,
      pagosPorFuera: 1,
      aDevolver: 0,
      devolucionesPendientes: 0,
    });
  });

  it('una devolución pendiente se dice aparte y no resta de lo cobrado (decisión 075)', () => {
    const resultado = conciliacion([pago({}), pago({ requiereDevolucion: true })]);

    expect(resultado.mercadoPago).toBe(90000);
    expect(resultado.aDevolver).toBe(45000);
    expect(resultado.devolucionesPendientes).toBe(1);
  });

  it('una devolución hecha deja de estar pendiente, pero el cobro sigue contando', () => {
    const resultado = conciliacion([pago({ requiereDevolucion: true, devueltoEn: new Date() })]);

    expect(resultado.mercadoPago).toBe(45000);
    expect(resultado.aDevolver).toBe(0);
  });

  it('los pagos de 0 de un torneo gratis no son cobros', () => {
    const resultado = conciliacion([pago({ medio: 'OTRO', monto: 0 })]);

    expect(resultado.pagosPorFuera).toBe(0);
    expect(resultado.porFuera).toBe(0);
  });

  it('suma a los centavos', () => {
    expect(conciliacion([pago({ monto: 33333.33 }), pago({ monto: 0.34 })]).mercadoPago).toBe(33333.67);
  });
});

describe('devolucionDe', () => {
  it('pendiente, hecha o que no corresponde', () => {
    expect(devolucionDe({ monto: 45000, requiereDevolucion: true, devueltoEn: null })).toBe('pendiente');
    expect(devolucionDe({ monto: 45000, requiereDevolucion: true, devueltoEn: new Date() })).toBe('hecha');
    expect(devolucionDe({ monto: 45000, requiereDevolucion: false, devueltoEn: null })).toBe('no_corresponde');
  });

  it('sin pago, o con un pago de 0, no hay nada que devolver', () => {
    expect(devolucionDe(null)).toBe('no_corresponde');
    expect(devolucionDe({ monto: 0, requiereDevolucion: true, devueltoEn: null })).toBe('no_corresponde');
  });
});
