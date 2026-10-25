import type { TorneoPublico } from '@setpoint/shared';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EncabezadoPublico } from '../components/EncabezadoPublico';
import { Numero } from '../components/Numero';
import { EncontrarPerfil } from '../features/inscripcion/EncontrarPerfil';
import { EstadoInscripcion } from '../features/inscripcion/EstadoInscripcion';
import { CuentaVerificada } from '../features/inscripcion/piezas';
import {
  borrarSesionJugador,
  guardarSesionJugador,
  leerSesionJugador,
  type SesionJugador,
} from '../features/inscripcion/sesionJugador';
import { useSituacion } from '../features/inscripcion/useInscripcion';
import { VerificarEmail } from '../features/inscripcion/VerificarEmail';
import { useTorneoPublico } from '../features/torneo-publico/useTorneoPublico';
import { ErrorApi } from '../lib/api';

function mensajeDeError(error: Error) {
  if (error instanceof ErrorApi && error.codigo === 'TORNEO_NO_ENCONTRADO') return 'No encontramos ese torneo. Revisá el enlace.';
  if (error instanceof ErrorApi && error.codigo === 'SIN_CONEXION') return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
  return 'No pudimos cargar el torneo. Probá de nuevo en unos minutos.';
}

// La inscripción desde el link del torneo: verificar el email y encontrar el perfil antes de pagar
// (F12, docs/pantallas/jugador/identificacion.html, decisiones 049 y 051).
export function InscripcionPage() {
  const { slug = '', id = '' } = useParams();
  const torneo = useTorneoPublico(slug, id);

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col gap-5 px-4 pt-5 pb-7">
      {torneo.isPending && <p className="text-[15px] text-gris-500">Cargando el torneo…</p>}
      {torneo.error && <p className="text-[15px] text-gris-700">{mensajeDeError(torneo.error)}</p>}
      {torneo.data && <Inscripcion torneo={torneo.data} />}
    </main>
  );
}

function Inscripcion({ torneo }: { torneo: TorneoPublico }) {
  const navegar = useNavigate();
  const [sesion, setSesion] = useState<SesionJugador | null>(leerSesionJugador);
  const situacion = useSituacion(torneo.organizacion.slug, String(torneo.id), sesion?.token);

  const verificado = (nueva: SesionJugador) => {
    guardarSesionJugador(nueva);
    setSesion(nueva);
  };
  const cambiarEmail = () => {
    borrarSesionJugador();
    setSesion(null);
  };

  // Con la sesión vencida o inválida se vuelve a pedir el código. La guardada se pisa al verificar.
  const sesionVencida = situacion.error instanceof ErrorApi && situacion.error.codigo === 'NO_AUTENTICADO';
  const activa = sesionVencida ? null : sesion;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <EncabezadoPublico organizacion={torneo.organizacion.nombre} />
        <Numero className="rounded-full border border-linea px-2.5 py-1.5 text-[14px] font-medium text-gris-500">{torneo.categoria}</Numero>
      </div>
      <h1 className="text-2xl leading-[1.15] font-semibold tracking-[-0.03em]">{torneo.nombre}</h1>

      {torneo.inscripcion === 'cerrada' ? (
        <p className="rounded-[12px] bg-fondo px-4 py-3.5 text-[15px] leading-[1.42] text-gris-700">
          La inscripción de este torneo ya cerró.
        </p>
      ) : !activa ? (
        <VerificarEmail onVerificado={verificado} />
      ) : (
        <>
          <CuentaVerificada email={activa.usuario.email} onCambiar={cambiarEmail} />
          {situacion.isPending && <p className="text-[15px] text-gris-500">Buscando tu perfil…</p>}
          {situacion.error && (
            <p className="text-[15px] text-gris-700">No pudimos cargar tu inscripción. Probá de nuevo en unos minutos.</p>
          )}
          {situacion.data &&
            (situacion.data.inscripcion ? (
              <EstadoInscripcion
                torneo={torneo}
                perfil={situacion.data.perfil}
                inscripcion={situacion.data.inscripcion}
                email={activa.usuario.email}
              />
            ) : (
              <EncontrarPerfil
                torneo={torneo}
                token={activa.token}
                situacion={situacion.data}
                onReservado={(inscripcionId) => navegar(`/c/${torneo.organizacion.slug}/inscripciones/${inscripcionId}`)}
              />
            ))}
        </>
      )}
    </>
  );
}
