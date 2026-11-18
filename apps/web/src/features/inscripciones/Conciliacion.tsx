import type { ConciliacionDelTorneo } from '@setpoint/shared';
import { Numero } from '../../components/Numero';
import { plata } from './texto';

function Linea({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-pizarra-400">{rotulo}</span>
      <Numero className="text-[15px] text-white">{valor}</Numero>
    </div>
  );
}

const pagos = (n: number) => (n === 1 ? 'pago' : 'pagos');

// La conciliación del torneo, en noche abajo a la derecha (inscripciones.html). Sin la comisión de la
// referencia: SetPoint cobra un cargo por jugador inscripto (decisión 103). Lo cobrado por fuera ya lo
// tiene la organización, y las devoluciones las hace ella (decisión 075). La transferencia de lo de
// MercadoPago es por fuera del sistema (05-pagos §2).
export function Conciliacion({ conciliacion }: { conciliacion: ConciliacionDelTorneo }) {
  const c = conciliacion;
  return (
    // Con el radio de las otras tarjetas de la pantalla, no el de la tarjeta noche grande.
    <section className="flex flex-col gap-3.5 rounded-tarjeta bg-noche p-[18px] text-white">
      <h2 className="text-[15px] font-semibold">Conciliación del torneo</h2>
      <div className="flex flex-col gap-[11px]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[15px] font-semibold">Por MercadoPago</span>
          <Numero className="text-xl font-medium text-white">{plata(c.mercadoPago)}</Numero>
        </div>
        <div className="h-px bg-borde-noche" />
        <Linea rotulo="Cobraste por fuera" valor={plata(c.porFuera)} />
        {c.devolucionesPendientes > 0 && <Linea rotulo="A devolver por fuera" valor={plata(c.aDevolver)} />}
      </div>
      <p className="text-[13px] leading-[1.4] text-pizarra-500">
        <Numero>{c.pagosMercadoPago}</Numero> {pagos(c.pagosMercadoPago)} por MercadoPago y <Numero>{c.pagosPorFuera}</Numero>{' '}
        por fuera. Lo de MercadoPago te lo transferimos por fuera del sistema; las devoluciones las hacés vos.
      </p>
    </section>
  );
}
