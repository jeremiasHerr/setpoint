import type { InscripcionParaPagar } from '@setpoint/shared';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { EncabezadoPublico } from '../components/EncabezadoPublico';
import { Numero } from '../components/Numero';
import { Aviso, BotonPrincipal, BotonSecundario, Caja, Monto } from '../features/inscripcion/piezas';
import { leerSesionJugador } from '../features/inscripcion/sesionJugador';
import { useCuentaRegresiva } from '../features/inscripcion/useCuentaRegresiva';
import { mensajeReserva } from '../features/inscripcion/mensajeReserva';
import { useIniciarPago, useInscripcionParaPagar, useReservarAprobada, useSimularPago } from '../features/pago/usePago';
import { importe } from '../features/torneo-publico/convocatoria';
import { ErrorApi } from '../lib/api';

// El pago de la inscripción, de la reserva al final (F12, docs/pantallas/jugador/inscripcion-y-pago.html).
// MercadoPago vuelve acá; la confirmación llega por el webhook, así que la pantalla espera.
export function PagoPage() {
  const { slug = '', id = '' } = useParams();
  const [parametros] = useSearchParams();
  const sesion = leerSesionJugador();
  // MercadoPago agrega estos parámetros al volver del checkout.
  const volviendo = parametros.has('payment_id') || parametros.has('collection_status') || parametros.has('status');
  const inscripcion = useInscripcionParaPagar(slug, id, sesion?.token, volviendo);

  if (!sesion) {
    return (
      <Marco>
        <p className="text-[15px] text-gris-700">Para ver tu inscripción, entrá con tu email desde el link del torneo.</p>
      </Marco>
    );
  }

  return (
    <Marco organizacion={inscripcion.data?.torneo.organizacion.nombre}>
      {inscripcion.isPending && <p className="text-[15px] text-gris-500">Cargando tu inscripción…</p>}
      {inscripcion.error && (
        <p className="text-[15px] text-gris-700">
          {inscripcion.error instanceof ErrorApi && inscripcion.error.codigo === 'INSCRIPCION_NO_ENCONTRADA'
            ? 'No encontramos esa inscripción con tu email.'
            : 'No pudimos cargar tu inscripción. Probá de nuevo en unos minutos.'}
        </p>
      )}
      {inscripcion.data && <Estado datos={inscripcion.data} volviendo={volviendo} token={sesion.token} />}
    </Marco>
  );
}

function Marco({ organizacion, children }: { organizacion?: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col gap-[22px] px-4 pt-5 pb-7">
      <EncabezadoPublico organizacion={organizacion ?? 'SetPoint'} />
      {children}
    </main>
  );
}

function Estado({ datos, volviendo, token }: { datos: InscripcionParaPagar; volviendo: boolean; token: string }) {
  if (datos.estado === 'pagada') return <Listo datos={datos} />;
  if (datos.estado === 'rechazada') return <Rechazado datos={datos} />;
  if (datos.estado === 'vencida') return <Vencida datos={datos} />;
  if (datos.estado === 'solicitada') return <EnRevision datos={datos} />;
  if (datos.estado === 'aprobada') return <Aprobada datos={datos} token={token} />;
  if (datos.estado === 'no_aprobada') return <NoAprobada datos={datos} />;
  if (datos.estado === 'cancelada') {
    return <p className="text-[15px] text-gris-700">Esta inscripción se dio de baja. Si es un error, hablá con la organización.</p>;
  }
  return volviendo ? <Confirmando datos={datos} /> : <Pagar datos={datos} token={token} />;
}

const linkInscripcion = (datos: InscripcionParaPagar) => `/c/${datos.torneo.organizacion.slug}/torneos/${datos.torneo.id}/inscripcion`;
const linkTorneo = (datos: InscripcionParaPagar) => `/c/${datos.torneo.organizacion.slug}/torneos/${datos.torneo.id}`;

function VolverAlTorneo({ datos }: { datos: InscripcionParaPagar }) {
  return (
    <Link to={linkTorneo(datos)} className="mt-auto flex h-[52px] items-center justify-center rounded-[12px] border border-linea text-base font-medium hover:bg-fondo">
      Volver al torneo
    </Link>
  );
}

function Resumen({ datos }: { datos: InscripcionParaPagar }) {
  return (
    <div className="flex flex-col gap-3 rounded-tarjeta border border-linea p-4">
      <div className="flex justify-between gap-3">
        <span className="text-[15px] text-gris-500">
          {datos.torneo.nombre} · {datos.torneo.categoria}
        </span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-[15px] text-gris-500">Jugador</span>
        <span className="text-base font-medium">
          {datos.jugador.nombre} {datos.jugador.apellido}
        </span>
      </div>
    </div>
  );
}

// La reserva vigente, antes de ir a MercadoPago.
function Pagar({ datos, token }: { datos: InscripcionParaPagar; token: string }) {
  const slug = datos.torneo.organizacion.slug;
  const iniciar = useIniciarPago(slug, String(datos.id), token);
  const simular = useSimularPago(slug, String(datos.id), token);
  const resta = useCuentaRegresiva(datos.reservaVence);

  const pagar = () =>
    iniciar.mutate(undefined, {
      onSuccess: ({ url }) => {
        if (url) window.location.assign(url);
      },
    });

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] leading-[1.12] font-semibold tracking-[-0.032em]">Tenés el lugar reservado</h1>
        <p className="text-base text-gris-500">
          Quedan <Numero className="text-negro">{resta ?? '—'}</Numero> para pagar. Si no llegás, el lugar vuelve a quedar libre.
        </p>
      </div>
      <Resumen datos={datos} />
      <Aviso mensaje={iniciar.error || simular.error ? 'No pudimos seguir con el pago. Probá de nuevo en unos minutos.' : null} />

      {datos.pagoSimulado ? (
        <div className="mt-auto flex flex-col gap-3">
          {/* Sin credenciales de MercadoPago (decisión 053). Ningún jugador real ve esto. */}
          <Caja>
            <strong className="mb-1 block font-semibold text-negro">Pago simulado</strong>
            Esta instalación no tiene credenciales de MercadoPago. Elegí cómo termina el pago para seguir el flujo.
          </Caja>
          <Monto precio={datos.precio} />
          <BotonPrincipal onClick={() => simular.mutate({ resultado: 'aprobado' })} disabled={simular.isPending}>
            Simular pago aprobado
          </BotonPrincipal>
          <BotonSecundario onClick={() => simular.mutate({ resultado: 'rechazado' })} disabled={simular.isPending}>
            Simular pago rechazado
          </BotonSecundario>
        </div>
      ) : (
        <div className="mt-auto flex flex-col gap-3">
          <Monto precio={datos.precio} />
          <BotonPrincipal onClick={pagar} disabled={iniciar.isPending}>
            {iniciar.isPending ? 'Abriendo MercadoPago…' : 'Ir a pagar con MercadoPago'}
          </BotonPrincipal>
        </div>
      )}
    </>
  );
}

// Torneo con aprobación: la solicitud todavía no tiene lugar ni se cobra (decisión 054).
function EnRevision({ datos }: { datos: InscripcionParaPagar }) {
  return (
    <>
      <div className="flex flex-col gap-4 pt-10">
        <span className="flex size-[46px] items-center justify-center rounded-full bg-fondo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" />
          </svg>
        </span>
        <h1 className="text-[28px] leading-[1.12] font-semibold tracking-[-0.032em]">Tu solicitud está en revisión</h1>
        <p className="text-base leading-[1.45] text-gris-500">
          {datos.torneo.organizacion.nombre} la revisa y te avisamos a {datos.email}.
        </p>
      </div>
      <Resumen datos={datos} />
      <Caja>Todavía no tenés lugar: se asignan por orden de pago. Si te aprueban, pagá apenas te llegue el email.</Caja>
      <VolverAlTorneo datos={datos} />
    </>
  );
}

// La aprobada reserva el lugar recién ahora, como desde el link del email. Si la reserva vence sin
// pagar, vuelve a este estado.
function Aprobada({ datos, token }: { datos: InscripcionParaPagar; token: string }) {
  const reservar = useReservarAprobada(datos.torneo.organizacion.slug, String(datos.id), token);
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] leading-[1.12] font-semibold tracking-[-0.032em]">Te aprobaron la solicitud</h1>
        <p className="text-base leading-[1.45] text-gris-500">
          Los lugares se asignan por orden de pago. Al reservar te guardamos el tuyo unos minutos mientras pagás.
        </p>
      </div>
      <Resumen datos={datos} />
      <Aviso mensaje={mensajeReserva(reservar.error)} />
      <div className="mt-auto flex flex-col gap-3">
        <Monto precio={datos.precio} />
        <BotonPrincipal onClick={() => reservar.mutate()} disabled={reservar.isPending}>
          {reservar.isPending ? 'Reservando…' : 'Reservar y pagar'}
        </BotonPrincipal>
      </div>
    </>
  );
}

// Sin explicación (02-dominio §2), y sin rojo: no es un vencimiento.
function NoAprobada({ datos }: { datos: InscripcionParaPagar }) {
  return (
    <>
      <div className="flex flex-col gap-4 pt-10">
        <h1 className="text-[28px] leading-[1.12] font-semibold tracking-[-0.032em]">La organización no aprobó tu solicitud</h1>
        <p className="text-base leading-[1.45] text-gris-500">No se te cobró nada. Si tenés dudas, hablá con {datos.torneo.organizacion.nombre}.</p>
      </div>
      <Resumen datos={datos} />
      <VolverAlTorneo datos={datos} />
    </>
  );
}

// 1 · Volviendo de MercadoPago: la espera hasta que llega el webhook.
function Confirmando({ datos }: { datos: InscripcionParaPagar }) {
  const resta = useCuentaRegresiva(datos.reservaVence);
  return (
    <>
      <div className="flex grow flex-col items-center justify-center gap-6 text-center">
        <svg className="animate-spin" width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden>
          <circle cx="26" cy="26" r="22" stroke="#E6E8EB" strokeWidth="5" />
          <path d="M26 4a22 22 0 0 1 22 22" stroke="#0A0B0D" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <div className="flex flex-col gap-2.5">
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">Confirmando el pago</h1>
          <p className="max-w-[290px] text-base leading-[1.45] text-gris-500">MercadoPago nos tiene que avisar que salió bien. Suele tardar unos segundos.</p>
        </div>
        <Numero className="rounded-full border border-linea px-3.5 py-2 text-[15px] text-gris-500">tu lugar sigue reservado · {resta ?? '—'}</Numero>
      </div>
      <Caja>
        Podés cerrar esta página: cuando se confirme, te mandamos el comprobante a {datos.email}. Si el pago no sale, el lugar se libera y no se te cobra.
      </Caja>
    </>
  );
}

// 2 · Listo.
function Listo({ datos }: { datos: InscripcionParaPagar }) {
  return (
    <div className="-mx-4 flex grow flex-col">
      <div className="flex flex-col gap-4 bg-negro px-5 pt-[30px] pb-[26px]">
        <span className="flex size-[46px] items-center justify-center rounded-full bg-lima">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A0B0D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-[30px] leading-[1.1] font-semibold tracking-[-0.032em] text-white">Listo, estás inscripto</h1>
          <p className="text-base text-gris-400">
            {datos.torneo.nombre} · {datos.torneo.categoria}
          </p>
        </div>
      </div>
      <dl className="flex flex-col gap-[13px] border-b border-linea px-[18px] py-5">
        <div className="flex justify-between gap-3">
          <dt className="text-[15px] text-gris-500">Pagaste</dt>
          <dd>
            <Numero className="text-base font-medium">{importe(datos.precio)}</Numero>
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[15px] text-gris-500">Número de inscripción</dt>
          <dd>
            <Numero className="text-base">{datos.id}</Numero>
          </dd>
        </div>
        <p className="pt-1 text-[15px] leading-[1.42] text-gris-500">Te mandamos el comprobante a {datos.email}.</p>
      </dl>
      <div className="flex flex-col gap-3 px-[18px] py-[22px]">
        <h2 className="text-xl font-semibold tracking-[-0.025em]">Seguí tus partidos en la app</h2>
        <p className="text-base leading-[1.45] text-gris-500">
          Entrás con este mismo email y un código. Ahí ves tu zona cuando se sortee, anotás las fechas que arreglás y te avisamos cuando tu rival confirma.
        </p>
      </div>
      <p className="mt-auto border-t border-linea px-[18px] pt-[18px] text-[15px] leading-[1.42] text-gris-500">
        Sin la app también podés ver el ranking, las zonas y los cuadros desde el link del torneo.
      </p>
    </div>
  );
}

// 3 · Pago rechazado: no es un vencimiento, así que no hay rojo.
function Rechazado({ datos }: { datos: InscripcionParaPagar }) {
  return (
    <>
      <div className="flex flex-col gap-4 pt-10">
        <span className="flex size-[46px] items-center justify-center rounded-full bg-fondo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A0B0D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="5.5" width="18" height="13" rx="2" />
            <path d="M3 10h18" />
          </svg>
        </span>
        <h1 className="text-[28px] leading-[1.12] font-semibold tracking-[-0.032em]">MercadoPago no aprobó el pago</h1>
        <p className="text-base leading-[1.45] text-gris-500">
          No se te cobró nada y el lugar que te guardamos se liberó. Podés probar de nuevo, con otra tarjeta o con dinero en tu cuenta de MercadoPago.
        </p>
      </div>
      <Resumen datos={datos} />
      <div className="mt-auto flex flex-col gap-3">
        <Link to={linkInscripcion(datos)} className="flex h-14 items-center justify-center rounded-[12px] bg-lima text-[17px] font-semibold">
          Probar de nuevo
        </Link>
        <p className="text-center text-[15px] text-gris-500">Al probar de nuevo te guardamos otros 15 minutos.</p>
      </div>
    </>
  );
}

// 4 · Reserva vencida: el único rojo de la pantalla, porque es un vencimiento.
function Vencida({ datos }: { datos: InscripcionParaPagar }) {
  return (
    <>
      <div className="flex flex-col gap-4 pt-10">
        <span className="self-start rounded-full border border-rojo-linea bg-rojo-fondo px-3 py-1.5 font-mono text-[15px] font-medium text-rojo-texto">
          venció la reserva
        </span>
        <h1 className="text-[28px] leading-[1.12] font-semibold tracking-[-0.032em]">Pasaron los 15 minutos</h1>
        <p className="text-base leading-[1.45] text-gris-500">El lugar volvió a quedar libre y no se te cobró nada. Si todavía hay lugares, podés reservar otra vez.</p>
      </div>
      <Resumen datos={datos} />
      <div className="mt-auto flex flex-col gap-3">
        <Link to={linkInscripcion(datos)} className="flex h-14 items-center justify-center rounded-[12px] bg-lima text-[17px] font-semibold">
          Reservar otra vez y pagar
        </Link>
      </div>
    </>
  );
}
