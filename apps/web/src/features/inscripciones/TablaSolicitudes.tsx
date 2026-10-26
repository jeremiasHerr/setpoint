import type { SolicitudDelTorneo } from '@setpoint/shared';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { ErrorApi } from '../../lib/api';
import { diaCorto } from '../torneos/texto';
import { useAprobarSolicitud, useRechazarSolicitud } from './useInscripciones';

// El email se oculta en pantallas angostas: el nombre y las acciones dicen más.
const COLUMNAS = 'grid-cols-[minmax(0,1fr)_90px_180px] md:grid-cols-[minmax(0,1fr)_230px_110px_200px]';

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
  const error = aprobar.error ?? rechazar.error;

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-rojo-texto">{textoDeError(error)}</p>}
      <Tarjeta className="flex flex-col overflow-hidden">
        <div className={`grid gap-x-1 border-b border-linea bg-fondo-tabla px-[18px] py-[11px] ${COLUMNAS}`}>
          <span className="text-xs text-gris-500">jugador</span>
          <span className="hidden font-mono text-[11px] text-gris-500 md:block">email</span>
          <span className="font-mono text-[11px] text-gris-500">pidió</span>
          <span />
        </div>

        {solicitudes.length === 0 ? (
          <p className="px-[18px] py-4 text-sm text-gris-500">Todavía no pidió nadie.</p>
        ) : (
          <ul>
            {solicitudes.map((solicitud) => {
              const aprobada = solicitud.estado === 'aprobada';
              return (
                <li
                  key={solicitud.id}
                  className={`grid h-[60px] items-center gap-x-1 border-b border-linea-suave px-[18px] last:border-b-0 ${COLUMNAS}`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {/* Punto hueco la solicitud; negro lleno la aprobada que falta pagar (design.md §7). */}
                    <span
                      className={`size-2 shrink-0 rounded-full ${aprobada ? 'bg-negro' : 'border-[1.5px] border-gris-400'}`}
                    />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-[15px] font-medium">
                        {solicitud.nombre} {solicitud.apellido}
                      </span>
                      <span className="truncate font-mono text-xs text-gris-500">
                        {aprobada ? 'aprobada · falta pagar' : 'no está en el padrón'}
                      </span>
                    </div>
                  </div>
                  <span className="hidden truncate text-sm text-gris-700 md:block">{solicitud.email}</span>
                  <Numero className="text-[13px] whitespace-nowrap text-gris-500">{diaCorto(solicitud.fecha)}</Numero>
                  <div className="flex justify-end gap-2">
                    {!aprobada && abierta && (
                      <>
                        <button
                          type="button"
                          onClick={() => rechazar.mutate(solicitud.id)}
                          disabled={enCurso !== null}
                          className="flex h-8 items-center rounded-lg border border-linea px-3 text-[13px] text-gris-700 hover:bg-fondo disabled:opacity-40"
                        >
                          {enCurso === solicitud.id && rechazar.isPending ? 'Rechazando…' : 'Rechazar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => aprobar.mutate(solicitud.id)}
                          disabled={enCurso !== null}
                          className="flex h-8 items-center rounded-lg border border-negro bg-negro px-3 text-[13px] font-semibold text-white disabled:opacity-40"
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

        <p className="border-t border-linea bg-fondo-tabla px-[18px] py-[13px] text-[13px] leading-normal text-gris-500">
          Al aprobar, le llega un email con el link para pagar. No tiene lugar hasta que paga: los lugares se asignan por orden de
          pago. Cuando paga, entra al padrón con <Numero className="text-negro">0</Numero> puntos. Al rechazar, le llega un aviso, sin
          motivo.
        </p>
      </Tarjeta>
    </div>
  );
}
