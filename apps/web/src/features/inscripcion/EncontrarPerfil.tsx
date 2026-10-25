import type { PerfilEncontrado, SituacionEnElTorneo, TorneoPublico } from '@setpoint/shared';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Aviso,
  AvisoReserva,
  Ayuda,
  BotonPrincipal,
  BotonSecundario,
  Caja,
  Consentimiento,
  Monto,
  Tilde,
  Titulo,
} from './piezas';
import { AvisarALaOrganizacion, AvisoEnviado } from './AvisarALaOrganizacion';
import { mensajeReserva } from './mensajeReserva';
import { useBusqueda, useReservar } from './useInscripcion';

type Props = {
  torneo: TorneoPublico;
  token: string;
  // El email verificado: el aviso de reclamo dice a dónde le escribe la organización.
  email: string;
  situacion: SituacionEnElTorneo;
  onReservado: (inscripcionId: number) => void;
};

// Después del código: pasos 3 a 10 de docs/pantallas/jugador/identificacion.html (decisión 051).
export function EncontrarPerfil({ torneo, token, email, situacion, onReservado }: Props) {
  const reservar = useReservar(torneo.organizacion.slug, String(torneo.id), token);
  const [modo, setModo] = useState<'propuesta' | 'buscar' | 'vinculado' | 'no-esta'>(
    situacion.propuestas.length > 0 ? 'propuesta' : 'buscar',
  );
  const [elegido, setElegido] = useState<PerfilEncontrado | null>(null);

  const pagar = (jugadorId: number, vinculaPor?: 'busqueda' | 'propuesta') =>
    reservar.mutate({ jugadorId, vinculaPor }, { onSuccess: (reserva) => onReservado(reserva.inscripcionId) });

  const pie = (texto: string, jugadorId: number, vinculaPor?: 'busqueda' | 'propuesta', consentimiento = true) => (
    <div className="mt-auto flex flex-col gap-3">
      {consentimiento && <Consentimiento organizacion={torneo.organizacion.nombre} />}
      <Aviso mensaje={mensajeReserva(reservar.error)} />
      <Monto precio={torneo.precio} />
      <BotonPrincipal onClick={() => pagar(jugadorId, vinculaPor)} disabled={reservar.isPending}>
        {reservar.isPending ? 'Reservando…' : texto}
      </BotonPrincipal>
      <AvisoReserva minutos={torneo.minutosReserva} />
    </div>
  );

  // Ya tiene perfil en este circuito: se ve su nombre, que es de acá, y paga.
  const { perfil } = situacion;
  if (perfil) {
    if (perfil.categoria !== torneo.categoria) {
      return (
        <div className="flex flex-col gap-2">
          <Titulo>Tu perfil es de {perfil.categoria ?? 'otra categoría'}</Titulo>
          <Ayuda>
            Este torneo es de {torneo.categoria}. La categoría la asigna la organización: si te corresponde esta, hablá con
            ella.
          </Ayuda>
        </div>
      );
    }
    return (
      <>
        <div className="flex flex-col gap-2 rounded-tarjeta border border-linea p-[18px]">
          <div className="flex items-center gap-[9px]">
            <span className="size-[7px] rounded-full bg-lima" />
            <span className="text-[15px] font-semibold text-gris-700">Tu perfil en {torneo.organizacion.nombre}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xl font-semibold tracking-[-0.025em]">
              {perfil.nombre} {perfil.apellido}
            </span>
            <span className="font-mono text-[15px] text-gris-500">{perfil.categoria}</span>
          </div>
        </div>
        {pie('Ir a pagar con MercadoPago', perfil.jugadorId, undefined, false)}
      </>
    );
  }

  if (modo === 'propuesta') {
    const unico = situacion.propuestas.length === 1 ? situacion.propuestas[0] : null;
    return (
      <>
        {unico ? (
          <div className="flex flex-col gap-3 pt-2.5">
            <h2 className="text-[30px] leading-[1.12] font-semibold tracking-[-0.032em] text-balance">
              ¿Sos {unico.nombre} {unico.apellido}, de {torneo.categoria}?
            </h2>
            <p className="text-base leading-[1.45] text-gris-500">
              Lo encontramos por tu apellido en el padrón de {torneo.organizacion.nombre}.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Titulo>¿Sos alguno de estos?</Titulo>
            <Ayuda>Los encontramos por tu apellido en el padrón de {torneo.organizacion.nombre}.</Ayuda>
            <ListaPerfiles perfiles={situacion.propuestas} elegido={elegido} onElegir={setElegido} />
          </div>
        )}
        <div className="mt-auto flex flex-col gap-3">
          <Consentimiento organizacion={torneo.organizacion.nombre} />
          <Aviso mensaje={mensajeReserva(reservar.error)} />
          <Monto precio={torneo.precio} />
          <BotonPrincipal
            onClick={() => {
              const perfilElegido = unico ?? elegido;
              if (perfilElegido) pagar(perfilElegido.jugadorId, 'propuesta');
            }}
            disabled={reservar.isPending || (!unico && !elegido)}
          >
            {reservar.isPending ? 'Reservando…' : 'Soy yo: inscribirme y pagar'}
          </BotonPrincipal>
          <BotonSecundario
            onClick={() => {
              setElegido(null);
              reservar.reset();
              setModo('buscar');
            }}
          >
            No soy yo
          </BotonSecundario>
        </div>
      </>
    );
  }

  if (modo === 'vinculado' && elegido) {
    return (
      <AvisarALaOrganizacion
        slug={torneo.organizacion.slug}
        token={token}
        jugadorId={elegido.jugadorId}
        enviado={
          <AvisoEnviado
            organizacion={torneo.organizacion.nombre}
            perfil={`${elegido.nombre} ${elegido.apellido}`}
            email={email}
            torneo={torneo.nombre}
            pie={
              <Link
                to={`/c/${torneo.organizacion.slug}/torneos/${torneo.id}`}
                className="flex h-[52px] w-full items-center justify-center rounded-[12px] border border-linea text-base font-medium hover:bg-fondo"
              >
                Volver al torneo
              </Link>
            }
          />
        }
      >
        <div className="flex h-14 items-center justify-between gap-3 rounded-tarjeta border-2 border-negro px-[15px] text-[17px] font-medium">
          <span>
            {elegido.nombre} {elegido.apellido}
          </span>
          <MarcaVinculado />
        </div>
        <div className="flex flex-col gap-2">
          <Titulo>Este perfil ya está vinculado a otra cuenta</Titulo>
          <Ayuda>¿Te inscribiste antes con otro email? Entrá con ese y vas directo.</Ayuda>
        </div>
        <Caja>Si es tu perfil y no fuiste vos, avisale a la organización. Ve las dos cuentas y decide de quién es.</Caja>
        <button
          type="button"
          onClick={() => setModo('buscar')}
          className="self-start text-[15px] font-medium text-gris-500 underline underline-offset-[3px]"
        >
          Volver a buscarme
        </button>
      </AvisarALaOrganizacion>
    );
  }


  if (modo === 'no-esta') {
    return (
      <>
        <div className="flex flex-col gap-2">
          <Titulo>No estás en el padrón de {torneo.organizacion.nombre}</Titulo>
          <Ayuda>Este torneo es solo para los jugadores del circuito. Pedile a la organización que te agregue, y después volvé a este link.</Ayuda>
        </div>
        {torneo.organizacion.contacto && <Contacto contacto={torneo.organizacion.contacto} />}
        <div className="mt-auto">
          <BotonSecundario onClick={() => setModo('buscar')}>Volver a buscarme</BotonSecundario>
        </div>
      </>
    );
  }

  return (
    <Buscar
      torneo={torneo}
      elegido={elegido}
      onElegir={(perfilElegido) => {
        reservar.reset();
        setElegido(perfilElegido);
        if (perfilElegido?.vinculado) setModo('vinculado');
      }}
      onNoEsta={() => setModo('no-esta')}
      pie={elegido && !elegido.vinculado ? pie('Ir a pagar con MercadoPago', elegido.jugadorId, 'busqueda') : null}
    />
  );
}

function Buscar({
  torneo,
  elegido,
  onElegir,
  onNoEsta,
  pie,
}: {
  torneo: TorneoPublico;
  elegido: PerfilEncontrado | null;
  onElegir: (perfil: PerfilEncontrado | null) => void;
  onNoEsta: () => void;
  pie: React.ReactNode;
}) {
  const [consulta, setConsulta] = useState('');
  const busqueda = useBusqueda(torneo.organizacion.slug, String(torneo.id), consulta);
  const corta = consulta.trim().length < 3;

  if (elegido && !elegido.vinculado) {
    return (
      <>
        <button
          type="button"
          onClick={() => onElegir(null)}
          className="flex h-14 items-center justify-between gap-3 rounded-tarjeta border-2 border-negro px-[15px] text-left text-[17px] font-medium"
        >
          <span>
            {elegido.nombre} {elegido.apellido}
          </span>
          <Tilde />
        </button>
        <Ayuda>Tu perfil queda vinculado a este email cuando se confirme el pago.</Ayuda>
        {pie}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Titulo>Buscate en el padrón</Titulo>
        <Ayuda>Escribí tu apellido. Buscamos entre los jugadores de {torneo.categoria}.</Ayuda>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="flex h-14 items-center gap-3 rounded-[12px] border-2 border-negro px-[15px]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6A7079" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            aria-label="Tu apellido"
            autoFocus
            className="min-w-0 grow text-[17px] outline-none"
          />
        </div>
        {corta && (
          <Ayuda>
            Escribí al menos <span className="font-mono tabular-nums">3</span> letras.
          </Ayuda>
        )}
        {busqueda.error && <Aviso mensaje="No pudimos buscar. Probá de nuevo en unos minutos." />}
      </div>

      {!corta && busqueda.data && (
        <>
          {busqueda.data.perfiles.length > 0 ? (
            <>
              <ListaPerfiles perfiles={busqueda.data.perfiles} elegido={null} onElegir={onElegir} />
              <Ayuda>Tocá tu nombre. "Vinculado" quiere decir que ese perfil ya tiene una cuenta.</Ayuda>
            </>
          ) : (
            <Ayuda>No encontramos a nadie con ese nombre en {torneo.categoria}. Revisá cómo lo escribiste.</Ayuda>
          )}
          <div className="mt-auto">
            <BotonSecundario onClick={onNoEsta}>No estoy en la lista</BotonSecundario>
          </div>
        </>
      )}

      {corta && (
        <div className="mt-auto">
          <Caja>Tu perfil queda vinculado a este email cuando se confirme el pago. La próxima vez vas directo.</Caja>
        </div>
      )}
    </>
  );
}

function ListaPerfiles({
  perfiles,
  elegido,
  onElegir,
}: {
  perfiles: PerfilEncontrado[];
  elegido: PerfilEncontrado | null;
  onElegir: (perfil: PerfilEncontrado) => void;
}) {
  return (
    <ul className="overflow-hidden rounded-tarjeta border border-linea">
      {perfiles.map((perfil) => (
        <li key={perfil.jugadorId} className="border-b border-linea-suave last:border-b-0">
          <button
            type="button"
            onClick={() => onElegir(perfil)}
            className={`flex h-14 w-full items-center justify-between gap-3 px-4 text-left text-[17px] font-medium hover:bg-fondo ${
              elegido?.jugadorId === perfil.jugadorId ? 'bg-fondo' : ''
            }`}
          >
            <span>
              {perfil.nombre} {perfil.apellido}
            </span>
            {perfil.vinculado ? <MarcaVinculado /> : elegido?.jugadorId === perfil.jugadorId ? <Tilde /> : null}
          </button>
        </li>
      ))}
    </ul>
  );
}

function MarcaVinculado() {
  return <span className="rounded-full bg-linea-suave px-2 py-[3px] font-mono text-[13px] text-gris-500">vinculado</span>;
}

function Contacto({ contacto }: { contacto: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-tarjeta border border-linea p-4">
      <span className="text-[15px] text-gris-500">Contacto de la organización</span>
      <span className="text-[17px] font-semibold break-words">{contacto}</span>
    </div>
  );
}
