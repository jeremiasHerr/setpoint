import type { TorneoPublico } from '@setpoint/shared';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Numero } from '../../components/Numero';
import { diaLargo } from '../torneo-publico/convocatoria';
import { Aviso, AvisoReserva, Ayuda, BotonPrincipal, Caja, Consentimiento, Monto, Titulo } from './piezas';
import { mensajeReserva } from './mensajeReserva';
import { useInscribirComoNuevo } from './useInscripcion';

type Props = {
  torneo: TorneoPublico;
  token: string;
  email: string;
  // El nombre de la cuenta, si ya tiene: el campo viene completo.
  nombre: string;
  onReservado: (inscripcionId: number) => void;
  onVolver: () => void;
};

// Quien no está en la lista, en un torneo con aprobación o abierto: estados 11 a 13 de
// docs/pantallas/jugador/identificacion.html. El perfil se crea pendiente (decisión 054).
export function InscribirmeComoNuevo({ torneo, token, email, nombre: nombreDeLaCuenta, onReservado, onVolver }: Props) {
  const inscribir = useInscribirComoNuevo(torneo.organizacion.slug, String(torneo.id), token);
  const [nombre, setNombre] = useState(nombreDeLaCuenta);
  const [apellido, setApellido] = useState('');
  const [solicitada, setSolicitada] = useState(false);
  const conAprobacion = torneo.modoInscripcion === 'con_aprobacion';
  const completo = nombre.trim().length > 0 && apellido.trim().length > 0;

  if (solicitada) return <SolicitudEnviada torneo={torneo} email={email} />;

  const enviar = () =>
    inscribir.mutate(
      { nombre: nombre.trim(), apellido: apellido.trim() },
      {
        onSuccess: (resultado) => {
          if (resultado.estado === 'solicitada') setSolicitada(true);
          else onReservado(resultado.inscripcionId);
        },
      },
    );

  return (
    <>
      <div className="flex flex-col gap-2">
        <Titulo>No estás en el padrón de {torneo.organizacion.nombre}</Titulo>
        <Ayuda>
          {conAprobacion ? (
            'En este torneo pueden anotarse jugadores nuevos, con aprobación de la organización.'
          ) : (
            <>
              Este torneo es abierto: te sumamos al circuito en {torneo.categoria}, con <Numero>0</Numero> puntos.
            </>
          )}
        </Ayuda>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Campo id="nombre" etiqueta="Nombre" valor={nombre} onCambiar={setNombre} autoComplete="given-name" />
        <Campo id="apellido" etiqueta="Apellido" valor={apellido} onCambiar={setApellido} autoComplete="family-name" />
      </div>
      <button
        type="button"
        onClick={onVolver}
        className="self-start text-[15px] font-medium text-gris-500 underline underline-offset-[3px]"
      >
        Volver a buscarme
      </button>

      <div className="mt-auto flex flex-col gap-3">
        {conAprobacion && (
          <Caja>No te cobramos ni te guardamos lugar hasta que te aprueben. Si te aprueban, te llega un email con el link para pagar.</Caja>
        )}
        <Consentimiento organizacion={torneo.organizacion.nombre} al={conAprobacion ? 'Al mandarla' : 'Al inscribirte'} />
        <Aviso mensaje={mensajeReserva(inscribir.error)} />
        {!conAprobacion && <Monto precio={torneo.precio} />}
        <BotonPrincipal onClick={enviar} disabled={!completo || inscribir.isPending}>
          {conAprobacion
            ? inscribir.isPending
              ? 'Mandando…'
              : 'Mandar mi solicitud'
            : inscribir.isPending
              ? 'Reservando…'
              : 'Ir a pagar con MercadoPago'}
        </BotonPrincipal>
        {!conAprobacion && <AvisoReserva minutos={torneo.minutosReserva} />}
      </div>
    </>
  );
}

function Campo({
  id,
  etiqueta,
  valor,
  onCambiar,
  autoComplete,
}: {
  id: string;
  etiqueta: string;
  valor: string;
  onCambiar: (valor: string) => void;
  autoComplete: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-semibold">
        {etiqueta}
      </label>
      <input
        id={id}
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        autoComplete={autoComplete}
        maxLength={60}
        className="h-14 min-w-0 rounded-[12px] border border-gris-300 px-4 text-[17px] outline-none focus:border-2 focus:border-negro focus:px-[15px]"
      />
    </div>
  );
}

// 12 · La solicitud quedó mandada: todavía no tiene lugar ni se le cobró.
function SolicitudEnviada({ torneo, email }: { torneo: TorneoPublico; email: string }) {
  return (
    <>
      <div className="flex flex-col gap-4 pt-7">
        <span className="flex size-[46px] items-center justify-center rounded-full bg-fondo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" />
          </svg>
        </span>
        <h2 className="text-[28px] leading-[1.12] font-semibold tracking-[-0.032em]">Mandamos tu solicitud</h2>
        <p className="text-base leading-[1.45] text-gris-500">La organización la revisa y te avisamos a {email}.</p>
      </div>
      <dl className="flex flex-col gap-3 rounded-tarjeta border border-linea p-4">
        <div className="flex justify-between gap-3">
          <dt className="text-[15px] text-gris-500">Torneo</dt>
          <dd className="text-right text-base font-medium">
            {torneo.nombre} · {torneo.categoria}
          </dd>
        </div>
        {torneo.cierreInscripcion && (
          <div className="flex justify-between gap-3">
            <dt className="text-[15px] text-gris-500">Cierra</dt>
            <dd>
              <Numero className="text-base">{diaLargo(torneo.cierreInscripcion)}</Numero>
            </dd>
          </div>
        )}
      </dl>
      <Caja>Todavía no tenés lugar: se asignan por orden de pago. Si te aprueban, pagá apenas te llegue el email.</Caja>
      <div className="mt-auto">
        <Link
          to={`/c/${torneo.organizacion.slug}/torneos/${torneo.id}`}
          className="flex h-[52px] w-full items-center justify-center rounded-[12px] border border-linea text-base font-medium hover:bg-fondo"
        >
          Volver al torneo
        </Link>
      </div>
    </>
  );
}
