// La conciliación del torneo (F13). Lógica pura: recibe los pagos cobrados, ya leídos.
import { PORCENTAJE_COMISION, type ConciliacionDelTorneo, type DevolucionDeLaBaja } from '@setpoint/shared';

// La comisión de la plataforma, solo sobre lo que cobra por MercadoPago (decisión 078). Lo cobrado
// por fuera ya lo tiene la organización.
export const COMISION = PORCENTAJE_COMISION / 100;

export type PagoCobrado = {
  medio: 'MERCADOPAGO' | 'EFECTIVO' | 'TRANSFERENCIA' | 'OTRO';
  monto: number;
  requiereDevolucion: boolean;
  devueltoEn: Date | null;
};

const centavos = (monto: number) => Math.round(monto * 100) / 100;
const suma = (pagos: PagoCobrado[]) => centavos(pagos.reduce((total, p) => total + p.monto, 0));

// Los pagos tienen que ser los cobrados del torneo: aprobados, y también los que después se
// devolvieron, porque la plata entró. Un torneo gratis confirma con monto 0: no es un cobro.
export function conciliacion(pagos: PagoCobrado[]): ConciliacionDelTorneo {
  const cobrados = pagos.filter((p) => p.monto > 0);
  const porMercadoPago = cobrados.filter((p) => p.medio === 'MERCADOPAGO');
  const porFuera = cobrados.filter((p) => p.medio !== 'MERCADOPAGO');
  // La devolución la hace la organización, por fuera (decisión 075): no se resta de lo que le
  // corresponde, se dice aparte.
  const pendientes = cobrados.filter((p) => p.requiereDevolucion && p.devueltoEn === null);

  const mercadoPago = suma(porMercadoPago);
  const comision = centavos(mercadoPago * COMISION);
  return {
    mercadoPago,
    pagosMercadoPago: porMercadoPago.length,
    porcentajeComision: COMISION * 100,
    comision,
    teCorresponde: centavos(mercadoPago - comision),
    porFuera: suma(porFuera),
    pagosPorFuera: porFuera.length,
    aDevolver: suma(pendientes),
    devolucionesPendientes: pendientes.length,
  };
}

// Qué pasa con la plata de una baja. Sin pago, o con un pago de 0, no hay nada que devolver.
export function devolucionDe(pago: Pick<PagoCobrado, 'monto' | 'requiereDevolucion' | 'devueltoEn'> | null): DevolucionDeLaBaja {
  if (!pago || pago.monto === 0 || !pago.requiereDevolucion) return 'no_corresponde';
  return pago.devueltoEn ? 'hecha' : 'pendiente';
}
