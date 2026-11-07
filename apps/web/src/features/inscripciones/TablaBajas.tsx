import type { BajaDelTorneo, DevolucionDeLaBaja } from '@setpoint/shared';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { diaCorto } from '../torneos/texto';
import { BotonAccion } from './BotonAccion';
import { textoDelError } from './errores';
import { nombreDelMedio, plata } from './texto';
import { useMarcarDevolucion } from './useInscripciones';

const COLUMNAS = 'grid-cols-[minmax(0,1fr)_104px_150px] md:grid-cols-[minmax(0,1fr)_130px_110px_150px_150px]';

const textoDeLaDevolucion: Record<DevolucionDeLaBaja, string> = {
  pendiente: 'a devolver',
  hecha: 'devuelto',
  no_corresponde: 'sin devolución',
};

type Props = { slug: string; torneoId: number; bajas: BajaDelTorneo[] };

// La pestaña Bajas: quienes se dieron de baja después de pagar, con su devolución (decisión 075).
export function TablaBajas({ slug, torneoId, bajas }: Props) {
  const marcar = useMarcarDevolucion(slug, torneoId);

  return (
    <div className="flex flex-col gap-3">
      {marcar.error && <p className="text-sm text-rojo-texto">{textoDelError(marcar.error)}</p>}
      <Tarjeta className="flex flex-col overflow-hidden">
        <div className={`grid gap-x-1 border-b border-linea bg-fondo-tabla px-[18px] py-[11px] ${COLUMNAS}`}>
          <span className="text-xs text-gris-500">jugador</span>
          <span className="hidden font-mono text-[11px] text-gris-500 md:block">medio</span>
          <span className="font-mono text-[11px] text-gris-500">baja</span>
          <span className="font-mono text-[11px] text-gris-500">devolución</span>
          <span className="hidden md:block" />
        </div>
        {bajas.length === 0 ? (
          <p className="px-[18px] py-4 text-sm text-gris-500">No se dio de baja nadie.</p>
        ) : (
          <ul>
            {bajas.map((baja) => (
              <li
                key={baja.id}
                className={`grid min-h-14 items-center gap-x-1 border-b border-linea-suave px-[18px] py-1.5 last:border-b-0 ${COLUMNAS}`}
              >
                <span className="truncate text-[15px] text-gris-700">
                  {baja.nombre} {baja.apellido}
                </span>
                <Numero className="hidden text-[13px] text-gris-500 md:block">
                  {baja.medio ? nombreDelMedio[baja.medio] : '—'}
                </Numero>
                <Numero className="text-[13px] text-gris-500">{diaCorto(baja.fecha)}</Numero>
                <Numero className={`text-[13px] ${baja.devolucion === 'pendiente' ? 'text-negro' : 'text-gris-500'}`}>
                  {textoDeLaDevolucion[baja.devolucion]}
                  {baja.devolucion !== 'no_corresponde' && ` ${plata(baja.monto)}`}
                </Numero>
                <div className="col-span-full flex justify-end md:col-span-1">
                  {baja.devolucion === 'pendiente' && (
                    <BotonAccion onClick={() => marcar.mutate(baja.id)} disabled={marcar.isPending}>
                      {marcar.isPending && marcar.variables === baja.id ? 'Guardando…' : 'Ya se lo devolví'}
                    </BotonAccion>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </div>
  );
}
