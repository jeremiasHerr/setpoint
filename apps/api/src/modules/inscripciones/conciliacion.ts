// La conciliación del torneo (F13). Lógica pura: recibe los pagos cobrados, ya leídos.
// SetPoint no se queda con un porcentaje de lo cobrado: cobra un cargo por jugador inscripto (decisión
// 103, que reemplaza la comisión de la 078).
import type { ConciliacionDelTorneo, DevolucionDeLaBaja } from '@setpoint/shared';

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
  // La devolución la hace la organización, por fuera (decisión 075): no se resta de lo cobrado, se
  // dice aparte.
  const pendientes = cobrados.filter((p) => p.requiereDevolucion && p.devueltoEn === null);

  return {
    mercadoPago: suma(porMercadoPago),
    pagosMercadoPago: porMercadoPago.length,
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
