import type { SolicitudDelTorneo } from '@setpoint/shared';
import { MensajeError } from '../../components/Aviso';
import { useState } from 'react';
import { Confirmacion } from '../../components/Confirmacion';
import { ConCifras, Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { ErrorApi } from '../../lib/api';
import { diaCorto } from '../torneos/texto';
import { useAprobarSolicitud, useRechazarSolicitud } from './useInscripciones';

// En el celular, el día va debajo del nombre y Rechazar y Aprobar abajo: al lado no entran.
const COLUMNAS = 'grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_230px_110px_200px]';

type Props = {
  slug: string;
  torneoId: number;
  solicitudes: SolicitudDelTorneo[];
  // Solo con la inscripción abierta: al cerrarla, las que quedan se cierran con ella (decisión 054).
  abierta: boolean;
};

function textoDeError(error: Error) {
  const codigo = error instanceof ErrorApi ? error.codigo : '';
  switch (codigo) {
    case 'SOLICITUD_NO_ENCONTRADA':
      return 'Esa solicitud ya no estaba pendiente. La lista se actualizó.';
    case 'INSCRIPCION_NO_ABIERTA':
      return 'La inscripción ya está cerrada.';
    case 'SIN_CONEXION':
      return 'No hay conexión. Probá de nuevo.';
    default:
      return 'No se pudo guardar. Probá de nuevo.';
  }
}

// Quienes no están en el padrón y piden entrar a un torneo con aprobación (estado 2 de
// docs/pantallas/organizador/inscripciones.html). Rechazar no pide motivo (02-dominio §2).
export function TablaSolicitudes({ slug, torneoId, solicitudes, abierta }: Props) {
  const aprobar = useAprobarSolicitud(slug, torneoId);
  const rechazar = useRechazarSolicitud(slug, torneoId);
  const enCurso = aprobar.isPending ? aprobar.variables : rechazar.isPending ? rechazar.variables : null;
  // Rechazar pide confirmación: le llega un aviso y no se deshace (decisión 096).
  const [aRechazar, setARechazar] = useState<SolicitudDelTorneo | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {aprobar.error && <MensajeError>{textoDeError(aprobar.error)}</MensajeError>}
      <Tarjeta className="flex flex-col overflow-hidden">
        <div className={`grid gap-x-1 border-b border-linea bg-niebla px-4 py-[11px] md:px-[18px] ${COLUMNAS}`}>
          <span className="text-xs text-pizarra-500">jugador</span>
          <span className="hidden text-[12.5px] font-medium text-noche md:block">email</span>
          <span className="hidden text-[12.5px] font-medium text-noche md:block">pidió</span>
          <span className="hidden md:block" />
        </div>

        {solicitudes.length === 0 ? (
          <p className="px-4 py-4 text-sm md:px-[18px] text-pizarra-500">Todavía no pidió nadie.</p>
        ) : (
          <ul>
            {solicitudes.map((solicitud) => {
              const aprobada = solicitud.estado === 'aprobada';
              return (
                <li
                  key={solicitud.id}
                  className={`grid min-h-[60px] items-center gap-x-1 border-b border-linea-suave px-4 py-3 last:border-b-0 md:h-[60px] md:px-[18px] md:py-0 ${COLUMNAS}`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {/* Punto hueco la solicitud; noche lleno la aprobada que falta pagar (design.md §7). */}
                    <span
                      className={`size-2 shrink-0 rounded-full ${aprobada ? 'bg-noche' : 'border-[1.5px] border-pizarra-400'}`}
                    />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-[15px] font-medium">
                        {solicitud.nombre} {solicitud.apellido}
                      </span>
                      <span className="truncate text-[13px] text-pizarra-500">
                        {aprobada ? 'aprobada · falta pagar' : 'no está en el padrón'}
                        <span className="md:hidden"> · {diaCorto(solicitud.fecha)}</span>
                      </span>
                    </div>
                  </div>
                  <span className="hidden truncate text-sm text-pizarra-700 md:block">{solicitud.email}</span>
                  <ConCifras className="hidden text-[13px] whitespace-nowrap text-pizarra-500 md:block">{diaCorto(solicitud.fecha)}</ConCifras>
                  <div className="flex justify-end gap-2 pt-2.5 max-md:empty:hidden md:pt-0">
                    {!aprobada && abierta && (
                      <>
                        <button
                          type="button"
                          onClick={() => setARechazar(solicitud)}
                          disabled={enCurso !== null}
                          aria-haspopup="dialog"
                          className="flex h-8 items-center rounded-lg border border-linea px-3 text-[13px] text-pizarra-700 hover:bg-niebla disabled:opacity-40"
                        >
                          Rechazar
                        </button>
                        <button
                          type="button"
                          onClick={() => aprobar.mutate(solicitud.id)}
                          disabled={enCurso !== null}
                          className="flex h-8 items-center rounded-lg border border-noche bg-noche px-3 text-[13px] font-semibold text-white disabled:opacity-40"
                        >
                          {enCurso === solicitud.id && aprobar.isPending ? 'Aprobando…' : 'Aprobar'}
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="border-t border-linea bg-niebla px-4 py-[13px] md:px-[18px] text-[13px] leading-normal text-pizarra-500">
          Al aprobar, le llega un email con el link para pagar. No tiene lugar hasta que paga: los lugares se asignan por orden de
          pago. Cuando paga, entra al padrón con <Numero className="text-noche">0</Numero> puntos. Al rechazar, le llega un aviso, sin
          motivo.
        </p>
      </Tarjeta>

      <Confirmacion
        abierta={aRechazar !== null}
        titulo={aRechazar && `Rechazar a ${aRechazar.nombre} ${aRechazar.apellido}`}
        consecuencias={['Le llega un email, sin motivo.', 'No entra al torneo ni al padrón.']}
        accion="Rechazar"
        accionEnCurso="Rechazando…"
        enCurso={rechazar.isPending}
        error={rechazar.error && textoDeError(rechazar.error)}
        alCancelar={() => {
          rechazar.reset();
          setARechazar(null);
        }}
        alConfirmar={() => aRechazar && rechazar.mutate(aRechazar.id, { onSuccess: () => setARechazar(null) })}
      />
    </div>
  );
}
