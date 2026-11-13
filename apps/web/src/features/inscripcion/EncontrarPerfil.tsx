import type { Contacto, PerfilEncontrado, SituacionEnElTorneo, TorneoPublico } from '@setpoint/shared';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { urlDeWhatsApp } from '../padron/linkPersonal';
import { lugaresLibres } from '../torneo-publico/convocatoria';
import {
  Aviso,
  AvisoLista,
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
import { InscribirmeComoNuevo } from './InscribirmeComoNuevo';
import { mensajeReserva } from './mensajeReserva';
import { useAnotarEnListaDeEspera, useBusqueda, useReservar } from './useInscripcion';

type Props = {
  torneo: TorneoPublico;
  token: string;
  // El email verificado: el aviso de reclamo dice a dónde le escribe la organización.
  email: string;
  // El nombre de la cuenta: completa el formulario de quien no está en la lista.
  nombre: string;
  situacion: SituacionEnElTorneo;
  onReservado: (inscripcionId: number) => void;
};

// Después del código: pasos 3 a 13 de docs/pantallas/jugador/identificacion.html (decisiones 051 y 054).
// Con el cupo lleno, el mismo camino termina en la lista de espera, sin pagar (decisión 081).
export function EncontrarPerfil({ torneo, token, email, nombre, situacion, onReservado }: Props) {
  const reservar = useReservar(torneo.organizacion.slug, String(torneo.id), token);
  const anotar = useAnotarEnListaDeEspera(torneo.organizacion.slug, String(torneo.id), token);
  const [modo, setModo] = useState<'propuesta' | 'buscar' | 'vinculado' | 'no-esta'>(
    situacion.propuestas.length > 0 ? 'propuesta' : 'buscar',
  );
  const [elegido, setElegido] = useState<PerfilEncontrado | null>(null);

  // La lista de espera, si no quedan lugares y el torneo tiene.
  const lista = lugaresLibres(torneo) === 0 ? torneo.listaDeEspera : null;
  const enCurso = reservar.isPending || anotar.isPending;
  const error = reservar.error ?? anotar.error;
  const reiniciar = () => {
    reservar.reset();
    anotar.reset();
  };

  const seguir = (jugadorId: number, vinculaPor?: 'busqueda' | 'propuesta') => {
    const alTerminar = { onSuccess: ({ inscripcionId }: { inscripcionId: number }) => onReservado(inscripcionId) };
    reiniciar();
    if (lista) anotar.mutate({ jugadorId, vinculaPor }, alTerminar);
    else reservar.mutate({ jugadorId, vinculaPor }, alTerminar);
  };
  const textoDelBoton = (pagar: string) =>
    enCurso ? (lista ? 'Anotándote…' : 'Reservando…') : lista ? 'Anotarme en la lista de espera' : pagar;

  const pie = (texto: string, jugadorId: number, vinculaPor?: 'busqueda' | 'propuesta', consentimiento = true) => (
    <div className="mt-auto flex flex-col gap-3">
      {consentimiento && <Consentimiento organizacion={torneo.organizacion.nombre} al={lista ? 'Al anotarte' : undefined} />}
      <Aviso mensaje={mensajeReserva(error)} />
      <Monto precio={torneo.precio} />
      <BotonPrincipal onClick={() => seguir(jugadorId, vinculaPor)} disabled={enCurso}>
        {textoDelBoton(texto)}
      </BotonPrincipal>
      {lista ? <AvisoLista horas={lista.horas} /> : <AvisoReserva minutos={torneo.minutosReserva} />}
    </div>
  );

  // Ya tiene perfil en este circuito: se ve su nombre, que es de acá, y paga.
  const { perfil } = situacion;
  if (perfil) {
    // A un torneo suelto se anota cualquiera del padrón (decisión 089).
    if (!torneo.suelto && perfil.categoria !== torneo.categoria) {
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
          <Consentimiento organizacion={torneo.organizacion.nombre} al={lista ? 'Al anotarte' : undefined} />
          <Aviso mensaje={mensajeReserva(error)} />
          <Monto precio={torneo.precio} />
          <BotonPrincipal
            onClick={() => {
              const perfilElegido = unico ?? elegido;
              if (perfilElegido) seguir(perfilElegido.jugadorId, 'propuesta');
            }}
            disabled={enCurso || (!unico && !elegido)}
          >
            {lista && !enCurso ? 'Soy yo: anotarme en la lista de espera' : textoDelBoton('Soy yo: inscribirme y pagar')}
          </BotonPrincipal>
          {lista && <AvisoLista horas={lista.horas} />}
          <BotonSecundario
            onClick={() => {
              setElegido(null);
              reiniciar();
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


  // Con aprobación o abierto, quien no está en la lista deja su nombre (decisión 054).
  if (modo === 'no-esta' && torneo.modoInscripcion !== 'cerrada') {
    return (
      <InscribirmeComoNuevo
        torneo={torneo}
        token={token}
        email={email}
        nombre={nombre}
        onReservado={onReservado}
        onVolver={() => setModo('buscar')}
      />
    );
  }

  if (modo === 'no-esta') {
    return (
      <>
        <div className="flex flex-col gap-2">
          <Titulo>No estás en el padrón de {torneo.organizacion.nombre}</Titulo>
          <Ayuda>Este torneo es solo para los jugadores del circuito. Pedile a la organización que te agregue, y después volvé a este link.</Ayuda>
        </div>
        {torneo.organizacion.contactos.length > 0 && <Contactos contactos={torneo.organizacion.contactos} torneo={torneo.nombre} />}
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
        reiniciar();
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

// Un link de red social se abre; un usuario ("@polenta") se muestra tal cual.
const esLink = (valor: string) => /^https?:\/\//i.test(valor);

// El WhatsApp abre el chat con el torneo ya escrito (decisión 091).
function Contactos({ contactos, torneo }: { contactos: Contacto[]; torneo: string }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-tarjeta border border-linea p-4">
      <span className="text-[15px] text-gris-500">Contacto de la organización</span>
      <ul className="flex flex-col gap-2">
        {contactos.map((c) => (
          <li key={`${c.tipo}-${c.valor}`} className="flex flex-col gap-0.5">
            <span className="font-mono text-xs text-gris-500">{c.tipo === 'whatsapp' ? 'whatsapp' : 'red social'}</span>
            {c.tipo === 'whatsapp' ? (
              <a
                href={urlDeWhatsApp(c.valor, `Hola, te escribo por el torneo ${torneo}`)}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[17px] font-semibold tabular-nums underline underline-offset-[3px]"
              >
                {c.valor}
              </a>
            ) : esLink(c.valor) ? (
              <a href={c.valor} target="_blank" rel="noreferrer" className="text-[17px] font-semibold break-words underline underline-offset-[3px]">
                {c.valor}
              </a>
            ) : (
              <span className="text-[17px] font-semibold break-words">{c.valor}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
