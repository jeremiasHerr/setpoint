import type { ConciliacionDelTorneo } from '@setpoint/shared';
import type { ReactNode } from 'react';
import { Numero } from '../../components/Numero';
import { plata } from './texto';

function Linea({ rotulo, valor, tenue = false }: { rotulo: ReactNode; valor: string; tenue?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gris-400">{rotulo}</span>
      <Numero className={`text-[15px] ${tenue ? 'text-gris-400' : 'text-white'}`}>{valor}</Numero>
    </div>
  );
}

const pagos = (n: number) => (n === 1 ? 'pago' : 'pagos');

// La conciliación del torneo, en negro abajo a la derecha (inscripciones.html). La comisión es solo
// sobre lo cobrado por MercadoPago (decisión 078); lo cobrado por fuera ya lo tiene la organización,
// y las devoluciones las hace ella (decisión 075). La transferencia es por fuera del sistema (05-pagos §2).
export function Conciliacion({ conciliacion }: { conciliacion: ConciliacionDelTorneo }) {
  const c = conciliacion;
  return (
    // Con el radio de las otras tarjetas de la pantalla, no el de la tarjeta negra grande.
    <section className="flex flex-col gap-3.5 rounded-tarjeta bg-negro p-[18px] text-white">
      <h2 className="text-[15px] font-semibold">Conciliación del torneo</h2>
      <div className="flex flex-col gap-[11px]">
        <Linea rotulo="Por MercadoPago" valor={plata(c.mercadoPago)} />
        <Linea
          rotulo={
            <>
              Comisión de SetPoint · <Numero>{c.porcentajeComision}%</Numero>
            </>
          }
          valor={`−${plata(c.comision)}`}
          tenue
        />
        <div className="h-px bg-borde-oscuro" />
        <div className="flex items-center justify-between gap-3">
          <span className="text-[15px] font-semibold">Te corresponde</span>
          <Numero className="text-xl font-medium text-lima">{plata(c.teCorresponde)}</Numero>
        </div>
        <div className="h-px bg-borde-oscuro" />
        <Linea rotulo="Cobraste por fuera" valor={plata(c.porFuera)} />
        {c.devolucionesPendientes > 0 && <Linea rotulo="A devolver por fuera" valor={plata(c.aDevolver)} />}
      </div>
      <p className="text-[13px] leading-[1.4] text-gris-500">
        <Numero>{c.pagosMercadoPago}</Numero> {pagos(c.pagosMercadoPago)} por MercadoPago y <Numero>{c.pagosPorFuera}</Numero>{' '}
        por fuera. Lo de MercadoPago te lo transferimos por fuera del sistema; las devoluciones las hacés vos.
      </p>
    </section>
  );
}
