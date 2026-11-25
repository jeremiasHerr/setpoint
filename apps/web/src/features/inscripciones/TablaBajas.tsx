import type { BajaDelTorneo, DevolucionDeLaBaja } from '@setpoint/shared';
import { MensajeError } from '../../components/Aviso';
import { ConCifras, Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { diaCorto } from '../torneos/texto';
import { BotonAccion } from './BotonAccion';
import { textoDelError } from './errores';
import { nombreDelMedio, plata } from './texto';
import { useMarcarDevolucion } from './useInscripciones';

const COLUMNAS = 'grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_130px_110px_150px_150px]';

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
      {marcar.error && <MensajeError>{textoDelError(marcar.error)}</MensajeError>}
      <Tarjeta className="flex flex-col overflow-hidden">
        <div className={`grid gap-x-3 border-b border-linea bg-niebla px-4 py-[11px] md:gap-x-1 md:px-[18px] ${COLUMNAS}`}>
          <span className="text-xs text-pizarra-500">jugador</span>
          <span className="hidden text-[12.5px] font-medium text-noche md:block">medio</span>
          <span className="hidden text-[12.5px] font-medium text-noche md:block">baja</span>
          <span className="hidden text-[12.5px] font-medium text-noche md:block">devolución</span>
          <span />
        </div>
        {bajas.length === 0 ? (
          <p className="px-4 py-4 text-sm md:px-[18px] text-pizarra-500">No se dio de baja nadie.</p>
        ) : (
          <ul>
            {bajas.map((baja) => (
              <li
                key={baja.id}
                className={`grid min-h-14 items-center gap-x-3 border-b border-linea-suave px-4 py-2 last:border-b-0 md:gap-x-1 md:px-[18px] md:py-1.5 ${COLUMNAS}`}
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-[15px] text-pizarra-700">
                    {baja.nombre} {baja.apellido}
                  </span>
                  <span className="text-[13px] text-pizarra-500 md:hidden">
                    <ConCifras>{diaCorto(baja.fecha)}</ConCifras> ·{' '}
                    {/* Si no entra en una línea, corta acá: el monto queda con "a devolver". */}
                    <span className={`whitespace-nowrap ${baja.devolucion === 'pendiente' ? 'text-noche' : ''}`}>
                      {textoDeLaDevolucion[baja.devolucion]}
                      {baja.devolucion !== 'no_corresponde' && (
                        <>
                          {' '}
                          <Numero>{plata(baja.monto)}</Numero>
                        </>
                      )}
                    </span>
                  </span>
                </div>
                <span className="hidden text-[13px] text-pizarra-500 md:block">{baja.medio ? nombreDelMedio[baja.medio] : '—'}</span>
                <ConCifras className="hidden text-[13px] text-pizarra-500 md:block">{diaCorto(baja.fecha)}</ConCifras>
                <span className={`hidden text-[13px] md:block ${baja.devolucion === 'pendiente' ? 'text-noche' : 'text-pizarra-500'}`}>
                  {textoDeLaDevolucion[baja.devolucion]}
                  {baja.devolucion !== 'no_corresponde' && (
                    <>
                      {' '}
                      <Numero>{plata(baja.monto)}</Numero>
                    </>
                  )}
                </span>
                <div className="flex justify-end">
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
