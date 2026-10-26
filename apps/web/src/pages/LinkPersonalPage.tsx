import type { LinkPersonal } from '@setpoint/shared';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EncabezadoPublico } from '../components/EncabezadoPublico';
import { Numero } from '../components/Numero';
import { AvisarALaOrganizacion, AvisoEnviado } from '../features/inscripcion/AvisarALaOrganizacion';
import { Ayuda, Caja, CuentaVerificada, Titulo } from '../features/inscripcion/piezas';
import {
  borrarSesionJugador,
  guardarSesionJugador,
  leerSesionJugador,
  type SesionJugador,
} from '../features/inscripcion/sesionJugador';
import { VerificarEmail } from '../features/inscripcion/VerificarEmail';
import { ElegirTorneo } from '../features/link-personal/ElegirTorneo';
import { useLinkPersonal, useSituacionDelLink } from '../features/link-personal/useLinkPersonal';
import { ErrorApi } from '../lib/api';

// El link personal que la organización le manda a cada jugador por WhatsApp (F12,
// docs/pantallas/jugador/link-personal.html, decisión 050): se saltea la búsqueda.
export function LinkPersonalPage() {
  const { codigo = '' } = useParams();
  const link = useLinkPersonal(codigo);
  const noAnda = link.error instanceof ErrorApi && link.error.codigo === 'LINK_NO_ENCONTRADO';

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col gap-5 px-4 pt-5 pb-7">
      {link.isPending && <p className="text-[15px] text-gris-500">Cargando…</p>}
      {noAnda && <LinkQueNoAnda />}
      {link.error && !noAnda && (
        <p className="text-[15px] text-gris-700">
          {link.error instanceof ErrorApi && link.error.codigo === 'SIN_CONEXION'
            ? 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.'
            : 'No pudimos abrir el link. Probá de nuevo en unos minutos.'}
        </p>
      )}
      {link.data && <LinkEncontrado link={link.data} codigo={codigo} />}
    </main>
  );
}

function LinkEncontrado({ link, codigo }: { link: LinkPersonal; codigo: string }) {
  const navegar = useNavigate();
  const [sesion, setSesion] = useState<SesionJugador | null>(leerSesionJugador);
  const situacion = useSituacionDelLink(codigo, sesion?.token);

  const verificado = (nueva: SesionJugador) => {
    guardarSesionJugador(nueva);
    setSesion(nueva);
  };
  const cambiarEmail = () => {
    borrarSesionJugador();
    setSesion(null);
  };

  // Con la sesión vencida o inválida se vuelve a pedir el código, como en el link del torneo.
  const sesionVencida = situacion.error instanceof ErrorApi && situacion.error.codigo === 'NO_AUTENTICADO';
  const activa = sesionVencida ? null : sesion;
  const enCurso = situacion.data?.situacion;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <EncabezadoPublico organizacion={link.organizacion.nombre} />
        {link.jugador.categoria && (
          <Numero className="rounded-full border border-linea px-2.5 py-1.5 text-[14px] font-medium text-gris-500">
            {link.jugador.categoria}
          </Numero>
        )}
      </div>

      {(!activa || enCurso === 'otra_cuenta') && (
        <div className="flex flex-col gap-2.5 pt-2">
          <h1 className="text-[34px] leading-[1.08] font-semibold tracking-[-0.032em]">Hola, {link.jugador.nombre}</h1>
          {!activa && (
            <p className="text-base leading-[1.45] text-gris-500">
              Este es tu link para inscribirte en los torneos de {link.organizacion.nombre}. Te lo mandó la organización.
            </p>
          )}
        </div>
      )}

      {!activa ? (
        <VerificarEmail onVerificado={verificado} desdeLink />
      ) : (
        <>
          <CuentaVerificada email={activa.usuario.email} onCambiar={cambiarEmail} />
          {situacion.isPending && <p className="text-[15px] text-gris-500">Revisando tu perfil…</p>}
          {situacion.error && !sesionVencida && (
            <p className="text-[15px] text-gris-700">No pudimos revisar tu perfil. Probá de nuevo en unos minutos.</p>
          )}
          {enCurso === 'otra_cuenta' && (
            <AvisarALaOrganizacion
              slug={link.organizacion.slug}
              token={activa.token}
              jugadorId={link.jugador.id}
              enviado={
                <AvisoEnviado
                  organizacion={link.organizacion.nombre}
                  perfil={`${link.jugador.nombre} ${link.jugador.apellido}`}
                  email={activa.usuario.email}
                />
              }
            >
              <div className="flex flex-col gap-2">
                <Titulo>Este perfil ya está vinculado a otra cuenta</Titulo>
                <Ayuda>¿Te inscribiste antes con otro email? Entrá con ese y vas directo.</Ayuda>
              </div>
              <Caja>Si es tu perfil y no fuiste vos, avisale a la organización. Ve las dos cuentas y decide de quién es.</Caja>
            </AvisarALaOrganizacion>
          )}
          {enCurso === 'otro_perfil' && (
            <div className="flex flex-col gap-2">
              <Titulo>Tu cuenta ya tiene otro perfil en este circuito</Titulo>
              <Ayuda>Una cuenta tiene un solo perfil en cada circuito. Escribile a la organización para que lo revise.</Ayuda>
            </div>
          )}
          {(enCurso === 'libre' || enCurso === 'propio') && (
            <ElegirTorneo
              link={link}
              codigo={codigo}
              token={activa.token}
              propio={enCurso === 'propio'}
              onReservado={(inscripcionId) => navegar(`/c/${link.organizacion.slug}/inscripciones/${inscripcionId}`)}
            />
          )}
        </>
      )}
    </>
  );
}

// Un link regenerado y uno que nunca existió se ven igual. Sin código encontrado no se sabe de qué
// organización es: el encabezado es de SetPoint.
function LinkQueNoAnda() {
  return (
    <>
      <EncabezadoPublico organizacion="SetPoint" />
      <div className="flex flex-col gap-3 pt-10">
        <h1 className="text-[30px] leading-[1.1] font-semibold tracking-[-0.032em]">Este link ya no anda</h1>
        <p className="text-base leading-[1.45] text-gris-500">
          Puede que la organización haya generado uno nuevo. El anterior deja de funcionar.
        </p>
      </div>
      <section className="flex flex-col gap-3.5 rounded-tarjeta border border-linea p-[18px]">
        <h2 className="text-base font-semibold">Para inscribirte</h2>
        <ol className="flex flex-col gap-3.5">
          <li className="flex gap-3">
            <Numero className="text-[15px] text-gris-500">1</Numero>
            <span className="text-base leading-[1.42]">Pedile a tu organización tu link nuevo.</span>
          </li>
          <li className="flex gap-3">
            <Numero className="text-[15px] text-gris-500">2</Numero>
            <span className="text-base leading-[1.42]">O entrá desde el link del torneo que compartieron en el grupo, con tu email.</span>
          </li>
        </ol>
      </section>
      <p className="mt-auto text-center text-[15px] leading-[1.42] text-gris-500">
        Mirar el ranking, las zonas y los cuadros no necesita cuenta ni link personal.
      </p>
    </>
  );
}
