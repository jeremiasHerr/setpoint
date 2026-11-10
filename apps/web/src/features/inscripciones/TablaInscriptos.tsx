import type { EnListaDeEspera, InscripcionDelTorneo } from '@setpoint/shared';
import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { diaCorto } from '../torneos/texto';
import { BotonAccion } from './BotonAccion';
import { textoDelError } from './errores';
import { PanelDeBaja } from './PanelDeBaja';
import { cuandoVence, nombreDelMedio } from './texto';
import { useDarDeBaja, useRecordarPago } from './useInscripciones';

// El medio se oculta en pantallas angostas: el estado y la fecha dicen más.
const COLUMNAS =
  'grid-cols-[minmax(0,1fr)_96px_104px_116px] md:grid-cols-[minmax(0,1fr)_120px_130px_130px_130px]';

type Props = {
  slug: string;
  torneoId: number;
  inscripciones: InscripcionDelTorneo[];
  // Dar de baja, hasta que se confirma el sorteo (decisión 077).
  sePuedeDarDeBaja: boolean;
  primeroEnEspera: EnListaDeEspera | null;
  horasReserva: number;
  vacio: string;
  pie?: string;
};

const vencida = ({ reservaVence }: InscripcionDelTorneo) => reservaVence !== null && new Date(reservaVence) <= new Date();

// Lo que va en la columna de fecha: el día en que se inscribió o, si reserva, cuándo vence.
function fechaDe({ estado, fecha, reservaVence }: InscripcionDelTorneo) {
  if (estado === 'pagada' || reservaVence === null) return { texto: diaCorto(fecha), urgente: false };
  return cuandoVence(reservaVence);
}

// Las inscripciones que ocupan un lugar: las pagadas, que se pueden dar de baja, y las reservas,
// a las que se les puede recordar el pago (estados 1, 3 y 4 de docs/pantallas/organizador/inscripciones.html).
export function TablaInscriptos({ slug, torneoId, inscripciones, sePuedeDarDeBaja, primeroEnEspera, horasReserva, vacio, pie }: Props) {
  const [enBaja, setEnBaja] = useState<number | null>(null);
  const [recordadas, setRecordadas] = useState<Set<number>>(new Set());
  const baja = useDarDeBaja(slug, torneoId);
  const recordar = useRecordarPago(slug, torneoId);
  const error = baja.error ?? recordar.error;

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-rojo-texto">{textoDelError(error)}</p>}
      <Tarjeta className="flex flex-col overflow-hidden">
        <div className={`grid gap-x-1 border-b border-linea bg-fondo-tabla px-[18px] py-[11px] ${COLUMNAS}`}>
          <span className="text-xs text-gris-500">jugador</span>
          <span className="font-mono text-[11px] text-gris-500">estado</span>
          <span className="hidden font-mono text-[11px] text-gris-500 md:block">medio</span>
          <span className="font-mono text-[11px] text-gris-500">fecha</span>
          <span />
        </div>

        {inscripciones.length === 0 ? (
          <p className="px-[18px] py-4 text-sm text-gris-500">{vacio}</p>
        ) : (
          <ul>
            {inscripciones.map((inscripcion) => {
              const pagada = inscripcion.estado === 'pagada';
              const fecha = fechaDe(inscripcion);
              const abierta = enBaja === inscripcion.id;
              const recordada = recordadas.has(inscripcion.id);
              return (
                <Fragment key={inscripcion.id}>
                  <li
                    className={`grid min-h-14 items-center gap-x-1 border-b border-linea-suave px-[18px] py-1.5 ${COLUMNAS} ${
                      pagada && !abierta ? '' : 'bg-fondo-tabla'
                    } ${abierta ? 'border-b-0' : ''}`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={`size-[7px] shrink-0 rounded-full ${pagada ? 'bg-lima' : 'bg-gris-400'}`} />
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className={`truncate text-[15px] ${pagada ? 'font-medium' : ''}`}>
                            {inscripcion.nombre} {inscripcion.apellido}
                          </span>
                          {inscripcion.revision && (
                            <Link
                              to={`/padron/revisar/${inscripcion.jugadorId}`}
                              className="shrink-0 rounded-full border border-negro px-[7px] py-px font-mono text-[11px] whitespace-nowrap hover:bg-negro hover:text-white"
                            >
                              para revisar
                            </Link>
                          )}
                        </div>
                        {inscripcion.deLaListaDeEspera && (
                          <span className="truncate font-mono text-xs text-gris-500">de la lista de espera</span>
                        )}
                      </div>
                    </div>
                    <span className={`text-sm ${pagada ? '' : 'text-gris-700'}`}>{pagada ? 'Pagada' : 'Reservando'}</span>
                    <Numero className="hidden text-[13px] text-gris-500 md:block">
                      {inscripcion.medio ? nombreDelMedio[inscripcion.medio] : '—'}
                    </Numero>
                    <Numero className={`text-[13px] whitespace-nowrap ${fecha.urgente ? 'text-rojo-texto' : 'text-gris-500'}`}>
                      {fecha.texto}
                    </Numero>
                    <div className="col-span-full flex justify-end pt-1 md:col-span-1 md:pt-0">
                      {/* Con la vinculación para revisar, la acción es revisarla: el lugar es suyo igual (decisión 051). */}
                      {inscripcion.revision && (
                        <Link
                          to={`/padron/revisar/${inscripcion.jugadorId}`}
                          className="flex h-8 shrink-0 items-center rounded-lg border border-negro px-3 text-[13px] font-semibold whitespace-nowrap hover:bg-fondo"
                        >
                          Revisar
                        </Link>
                      )}
                      {!inscripcion.revision && pagada && sePuedeDarDeBaja && (
                        <BotonAccion
                          onClick={() => setEnBaja(abierta ? null : inscripcion.id)}
                          aria-expanded={abierta}
                          className={abierta ? 'border-negro font-semibold text-negro' : ''}
                        >
                          Dar de baja
                        </BotonAccion>
                      )}
                      {/* Una reserva vencida se libera sola en menos de un minuto: no hay nada que recordar. */}
                      {!inscripcion.revision && !pagada && !vencida(inscripcion) && (
                        <BotonAccion
                          onClick={() =>
                            recordar.mutate(inscripcion.id, {
                              onSuccess: () => setRecordadas((antes) => new Set(antes).add(inscripcion.id)),
                            })
                          }
                          disabled={recordada || recordar.isPending}
                        >
                          {recordada ? 'Recordado' : recordar.isPending && recordar.variables === inscripcion.id ? 'Mandando…' : 'Recordarle'}
                        </BotonAccion>
                      )}
                    </div>
                  </li>
                  {abierta && (
                    <li>
                      <PanelDeBaja
                        inscripcion={inscripcion}
                        primeroEnEspera={primeroEnEspera}
                        horasReserva={horasReserva}
                        enCurso={baja.isPending}
                        alCancelar={() => setEnBaja(null)}
                        alConfirmar={(devolucion) =>
                          baja.mutate({ inscripcionId: inscripcion.id, devolucion }, { onSuccess: () => setEnBaja(null) })
                        }
                      />
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ul>
        )}

        {pie && <p className="border-t border-linea bg-fondo-tabla px-[18px] py-[13px] text-[13px] leading-normal text-gris-500">{pie}</p>}
      </Tarjeta>
    </div>
  );
}
