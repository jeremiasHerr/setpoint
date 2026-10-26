import type { SituacionEnElTorneo, TorneoPublico } from '@setpoint/shared';
import { Link, Navigate } from 'react-router-dom';
import { Numero } from '../../components/Numero';
import { Ayuda, Monto } from './piezas';
import { useCuentaRegresiva } from './useCuentaRegresiva';

type Props = {
  torneo: TorneoPublico;
  perfil: SituacionEnElTorneo['perfil'];
  inscripcion: NonNullable<SituacionEnElTorneo['inscripcion']>;
  email: string;
};

// Quien vuelve con una reserva vigente o ya inscripto: pasos 14 y 15 de identificacion.html.
export function EstadoInscripcion({ torneo, perfil, inscripcion, email }: Props) {
  const resta = useCuentaRegresiva(inscripcion.reservaVence);

  // La solicitud en revisión o aprobada se ve en la página de la inscripción, como desde el email.
  if (inscripcion.estado === 'solicitada' || inscripcion.estado === 'aprobada') {
    return <Navigate to={`/c/${torneo.organizacion.slug}/inscripciones/${inscripcion.id}`} replace />;
  }

  if (inscripcion.estado === 'pagada') {
    return (
      <>
        <div className="flex flex-col gap-3 rounded-tarjeta border border-linea p-[18px]">
          <div className="flex items-center gap-[9px]">
            <span className="size-[7px] rounded-full bg-lima" />
            <span className="text-[15px] font-semibold text-gris-700">Ya estás inscripto</span>
          </div>
          {perfil && (
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xl font-semibold tracking-[-0.025em]">
                {perfil.nombre} {perfil.apellido}
              </span>
              <span className="font-mono text-[15px] text-gris-500">{perfil.categoria}</span>
            </div>
          )}
          <div className="h-px bg-linea-suave" />
          <div className="flex justify-between gap-3">
            <span className="text-[15px] text-gris-500">Número de inscripción</span>
            <Numero className="text-base">{inscripcion.id}</Numero>
          </div>
          <Ayuda>El comprobante te llegó a {email} cuando se confirmó el pago.</Ayuda>
        </div>
        <Link
          to={`/c/${torneo.organizacion.slug}/torneos/${torneo.id}`}
          className="mt-auto flex h-[52px] items-center justify-center rounded-[12px] border border-linea text-base font-medium"
        >
          Ver el torneo
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2.5 rounded-tarjeta border border-linea p-[18px]">
        <span className="text-[17px] font-semibold">Tenés el lugar reservado</span>
        <div className="flex items-baseline gap-2.5">
          <Numero className="text-[40px] leading-none font-medium tracking-[-0.04em]">{resta ?? '—'}</Numero>
          <span className="text-[15px] text-gris-500">para pagar</span>
        </div>
        <Ayuda>Si no pagás antes de que termine, el lugar vuelve a quedar libre.</Ayuda>
      </div>
      <div className="mt-auto flex flex-col gap-3">
        <Monto precio={torneo.precio} />
        <Link
          to={`/c/${torneo.organizacion.slug}/inscripciones/${inscripcion.id}`}
          className="flex h-14 items-center justify-center rounded-[12px] bg-lima text-[17px] font-semibold"
        >
          Seguir con el pago
        </Link>
      </div>
    </>
  );
}
