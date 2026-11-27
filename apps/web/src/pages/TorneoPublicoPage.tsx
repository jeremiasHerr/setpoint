import { rutaDelTorneo, type TorneoPublico } from '@setpoint/shared';
import { Link, Navigate, useParams } from 'react-router-dom';
import { EncabezadoPublico } from '../components/EncabezadoPublico';
import { ConCifras, Numero } from '../components/Numero';
import { ContactosDeLaOrganizacion } from '../features/torneo-publico/ContactosDeLaOrganizacion';
import { diaLargo, formato, importe, lugaresLibres } from '../features/torneo-publico/convocatoria';
import { useTorneoPublico } from '../features/torneo-publico/useTorneoPublico';
import { ErrorApi } from '../lib/api';
import { Esqueleto } from '../components/Esqueleto';

function mensajeDeError(error: Error) {
  if (error instanceof ErrorApi && error.codigo === 'TORNEO_NO_ENCONTRADO') return 'No encontramos ese torneo. Revisá el enlace.';
  if (error instanceof ErrorApi && error.codigo === 'SIN_CONEXION') return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
  return 'No pudimos cargar el torneo. Probá de nuevo en unos minutos.';
}

// La convocatoria que hoy se manda por WhatsApp, hecha página: lo que abre el link del torneo,
// sin cuenta y sin instalar nada (F12, docs/pantallas/jugador/el-torneo.html). Con el cupo lleno,
// lleva a la lista de espera (F13, estado 4).
export function TorneoPublicoPage() {
  // El link con nombre, /inscripcion/:slug/:torneo (decisión 140), o el de antes, con el número.
  const { slug = '', id, torneo: delLink } = useParams();
  const torneo = useTorneoPublico(slug, delLink ?? id ?? '');

  // Por el link viejo, al nuevo: si alguien lo copia de la barra del navegador, copia el del nombre.
  if (id && torneo.data?.slugPublico) return <Navigate to={rutaDelTorneo(slug, torneo.data)} replace />;

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] md:min-h-0 flex-col gap-5 px-4 pt-5 pb-7">
      {torneo.isPending && <Esqueleto forma="lista" />}
      {torneo.error && <p className="text-[15px] text-pizarra-700">{mensajeDeError(torneo.error)}</p>}
      {torneo.data && <Convocatoria torneo={torneo.data} />}
    </main>
  );
}

function Convocatoria({ torneo }: { torneo: TorneoPublico }) {
  const abierta = torneo.inscripcion === 'abierta';
  const libres = lugaresLibres(torneo);
  // Con el cupo lleno, si el torneo tiene lista de espera (decisión 081).
  const lista = abierta && libres === 0 ? torneo.listaDeEspera : null;

  return (
    <>
      <title>{`${torneo.nombre} · ${torneo.categoria} · ${torneo.organizacion.nombre}`}</title>
      <div className="flex items-center justify-between gap-3">
        <EncabezadoPublico organizacion={torneo.organizacion.nombre} />
        <span className="rounded-full border border-linea px-2.5 py-1.5 text-[14px] font-medium text-pizarra-500">{torneo.categoria}</span>
      </div>

      <section className="flex flex-col gap-[18px] rounded-superficie bg-noche px-5 py-[22px]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className={`size-[7px] rounded-full ${abierta ? 'bg-lona' : 'bg-pizarra-500'}`} />
            <p className={`text-[15px] font-medium ${abierta ? 'text-white' : 'text-pizarra-400'}`}>
              {abierta ? 'Inscripción abierta' : 'Inscripción cerrada'}
            </p>
          </div>
          <h1 className="text-[32px] leading-[1.08] font-display font-semibold tracking-[-0.02em] text-white">{torneo.nombre}</h1>
        </div>

        <div className="h-px bg-borde-noche" />

        <dl className="flex flex-col gap-[13px]">
          {torneo.cierreInscripcion && (
            <Dato rotulo={abierta ? 'Cierra' : 'Cerró'} valor={diaLargo(torneo.cierreInscripcion)} />
          )}
          {torneo.fechaInicio && <Dato rotulo="Arranca" valor={diaLargo(torneo.fechaInicio)} />}
          <Dato rotulo="Formato" valor={formato(torneo)} />
        </dl>

        <div className="flex flex-col gap-[9px]">
          <Dato rotulo={abierta ? 'Lugares' : 'Inscriptos'} valor={`${torneo.ocupados} de ${torneo.cupo}`} />
          {/* La barra de marcas del cupo, en una sola franja (design.md §6). */}
          <div className="flex gap-[3px]">
            {torneo.ocupados > 0 && (
              <div className={`h-2 rounded-[2px] ${abierta ? 'bg-lona' : 'bg-pizarra-400'}`} style={{ flexGrow: torneo.ocupados }} />
            )}
            {libres > 0 && <div className="h-2 rounded-[2px] bg-borde-noche" style={{ flexGrow: libres }} />}
          </div>
          {abierta && (
            <p className="text-[15px] text-pizarra-400">
              {libres > 0 ? (
                `${libres === 1 ? 'Queda 1 lugar' : `Quedan ${libres} lugares`}. Se asignan por orden de pago.`
              ) : lista && lista.personas > 0 ? (
                <>
                  No quedan lugares. Hay <Numero className="text-white">{lista.personas}</Numero> en la lista de espera.
                </>
              ) : (
                'No quedan lugares.'
              )}
            </p>
          )}
        </div>
      </section>

      {lista && (
        <div className="flex gap-[11px] rounded-[12px] bg-niebla px-4 py-3.5 text-[15px] leading-[1.42] text-pizarra-700">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-px shrink-0 text-pizarra-500" aria-hidden>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 11v5.5M12 8h.01" />
          </svg>
          <p>
            Si alguien se baja o no termina de pagar, el lugar es del primero de la lista: le llega un email y tiene{' '}
            <Numero>{lista.horas}</Numero> horas para pagar. Si no paga, pasa al siguiente.
          </p>
        </div>
      )}

      {torneo.descripcion && (
        <section className="flex flex-col gap-[13px] rounded-[16px] border border-linea p-[18px]">
          <h2 className="text-base font-semibold">Sobre el torneo</h2>
          <p className="text-base leading-[1.45] whitespace-pre-line">{torneo.descripcion}</p>
        </section>
      )}

      {abierta ? (
        <div className="mt-auto flex flex-col gap-3 md:mt-0">
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-base text-pizarra-500">Inscripción</p>
            {torneo.precio === 0 ? (
              <span className="text-[26px] font-medium tracking-[-0.02em]">Gratis</span>
            ) : (
              <Numero className="text-[26px] font-medium tracking-[-0.02em]">{importe(torneo.precio)}</Numero>
            )}
          </div>
          {libres > 0 || lista ? (
            // La lista de espera sigue el mismo camino que inscribirse: el email y el código.
            <Link
              to={`/c/${torneo.organizacion.slug}/torneos/${torneo.id}/inscripcion`}
              className="flex h-[60px] items-center justify-center gap-2.5 rounded-[12px] bg-noche-900 text-white text-lg font-semibold hover:bg-pizarra-700"
            >
              {lista ? 'Anotarme en la lista de espera' : torneo.precio === 0 ? 'Inscribirme' : 'Inscribirme y pagar'}
            </Link>
          ) : (
            <p className="rounded-[12px] bg-niebla px-4 py-3.5 text-[15px] leading-[1.42] text-pizarra-700">
              El cupo está completo y este torneo no tiene lista de espera.
            </p>
          )}
          <p className="px-1 text-[15px] leading-[1.42] text-pizarra-500">
            {lista
              ? 'No pagás nada ahora. Te anotás con tu email, con el mismo código que para inscribirte.'
              : 'Te inscribís con tu email: te mandamos un código para confirmarlo. No hay registro ni contraseña.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="rounded-[12px] bg-niebla px-4 py-3.5 text-[15px] leading-[1.42] text-pizarra-700">
            Ya no se puede inscribir nadie. Después del sorteo, las zonas, los cuadros y los resultados se pueden mirar sin cuenta.
          </p>
          {/* Antes del sorteo, la página en vivo lo dice: no hace falta saber acá si ya se confirmó. */}
          <Link
            to={`/c/${torneo.organizacion.slug}/torneos/${torneo.id}/en-vivo`}
            className="flex h-[52px] items-center justify-center rounded-[12px] border border-linea text-[15px] font-semibold hover:bg-niebla"
          >
            Ver el torneo en vivo
          </Link>
        </div>
      )}

      <ContactosDeLaOrganizacion contactos={torneo.organizacion.contactos} torneo={torneo.nombre} />
    </>
  );
}

function Dato({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[15px] text-pizarra-400">{rotulo}</dt>
      <dd>
        <ConCifras className="text-[15px] text-white">{valor}</ConCifras>
      </dd>
    </div>
  );
}
