import type { InscripcionesDelTorneo } from '@setpoint/shared';
import { useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Boton } from '../components/Boton';
import { EncabezadoOrganizador } from '../components/EncabezadoOrganizador';
import { Numero } from '../components/Numero';
import { leerSesion, type Sesion } from '../features/auth/sesion';
import { useCerrarSesion } from '../features/auth/useCerrarSesion';
import { useSesionInvalida } from '../features/auth/useSesionInvalida';
import { BarraDeLugares } from '../features/inscripciones/BarraDeLugares';
import { Conciliacion } from '../features/inscripciones/Conciliacion';
import { Devoluciones } from '../features/inscripciones/Devoluciones';
import { InscribirAMano } from '../features/inscripciones/InscribirAMano';
import { ResumenListaDeEspera } from '../features/inscripciones/ResumenListaDeEspera';
import { TablaBajas } from '../features/inscripciones/TablaBajas';
import { TablaInscriptos } from '../features/inscripciones/TablaInscriptos';
import { TablaListaDeEspera } from '../features/inscripciones/TablaListaDeEspera';
import { TablaSolicitudes } from '../features/inscripciones/TablaSolicitudes';
import { normalizar } from '../features/inscripciones/texto';
import { useCerrarInscripcion, useInscripciones } from '../features/inscripciones/useInscripciones';
import { iniciales, navegacionOrganizador } from '../features/organizador/encabezado';
import { diaConSemana } from '../features/torneos/texto';
import { ErrorApi } from '../lib/api';

// El mismo mínimo que usa el sorteo: con menos de 3 por zona no se sortea (decisión 015).
const MINIMO_POR_ZONA = 3;

// Inscripciones de una categoría (F13): quiénes ocupan el cupo, la lista de espera, las bajas y la
// conciliación; cerrar la inscripción, dar de baja, inscribir a mano y recordar el pago.
// docs/pantallas/organizador/inscripciones.html
export function InscripcionesPage() {
  const sesion = leerSesion();
  const { id } = useParams();
  if (!sesion) return <Navigate to="/ingresar" replace />;
  return <CargarInscripciones sesion={sesion} id={Number(id)} />;
}

function Encabezado({ sesion }: { sesion: Sesion }) {
  const cerrarSesion = useCerrarSesion();
  return (
    <EncabezadoOrganizador
      organizacion={sesion.organizacion.nombre}
      navegacion={navegacionOrganizador}
      iniciales={iniciales(sesion.usuario.nombre)}
      alSalir={cerrarSesion}
    />
  );
}

function CargarInscripciones({ sesion, id }: { sesion: Sesion; id: number }) {
  const inscripciones = useInscripciones(sesion.organizacion.slug, id);
  const sesionInvalida = useSesionInvalida(inscripciones.error);
  const navegar = useNavigate();

  if (inscripciones.data) return <Inscripciones sesion={sesion} datos={inscripciones.data} />;

  const noExiste = inscripciones.error?.message === 'TORNEO_NO_ENCONTRADO';

  return (
    <div className="min-h-screen bg-white text-negro">
      <Encabezado sesion={sesion} />
      <div className="flex flex-col items-start gap-3 px-7 pt-[26px]">
        {noExiste ? (
          <>
            <p className="text-[15px] text-gris-500">No encontramos ese torneo.</p>
            <Boton onClick={() => navegar('/inicio')}>Volver al inicio</Boton>
          </>
        ) : inscripciones.error && !sesionInvalida ? (
          <>
            <p className="text-[15px] text-gris-500">No pudimos cargar las inscripciones.</p>
            <Boton onClick={() => void inscripciones.refetch()}>Probar de nuevo</Boton>
          </>
        ) : (
          <p className="text-[15px] text-gris-500">Cargando…</p>
        )}
      </div>
    </div>
  );
}

// 'AAAA-MM-DD' de hoy, en la hora de quien mira.
const hoy = () => new Intl.DateTimeFormat('en-CA').format(new Date());

// "cierra el viernes 26"
function textoDelCierre({ estado, cierreInscripcion }: InscripcionesDelTorneo) {
  if (estado === 'borrador') return 'todavía no se publicó';
  if (estado !== 'publicado') return 'inscripción cerrada';
  if (cierreInscripcion === null) return 'sin fecha de cierre';
  if (cierreInscripcion === hoy()) return 'cierra hoy';
  return cierreInscripcion > hoy()
    ? `cierra el ${diaConSemana(cierreInscripcion)}`
    : `la fecha de cierre era el ${diaConSemana(cierreInscripcion)}`;
}

// Lo que pasa al cerrar, dicho antes de que pase. Una vez cerrada, quiénes entran al sorteo.
function QuePasaAlCerrar({ datos, pagados, reservando }: { datos: InscripcionesDelTorneo; pagados: number; reservando: number }) {
  const reservas =
    reservando === 1 ? (
      'La reserva sin pagar'
    ) : (
      <>
        Las <Numero>{reservando}</Numero> reservas sin pagar
      </>
    );

  if (datos.estado === 'borrador') {
    return <p className="text-sm text-gris-500">La inscripción se abre cuando publiques el torneo.</p>;
  }

  if (datos.estado === 'publicado' && !datos.alcanzanParaLasZonas) {
    return (
      <p className="text-sm text-gris-700">
        Para armar <Numero>{datos.cantidadGrupos}</Numero> zonas hacen falta al menos{' '}
        <Numero>{datos.cantidadGrupos * MINIMO_POR_ZONA}</Numero> inscriptos que hayan pagado, y hay <Numero>{pagados}</Numero>.
        Para poder cerrar, esperá a que paguen más o{' '}
        <Link to={`/torneos/${datos.convocatoriaId}`} className="underline">
          bajá la cantidad de zonas del torneo
        </Link>
        .
      </p>
    );
  }

  if (datos.estado === 'publicado') {
    return (
      <p className="text-sm text-gris-500">
        Al cerrar, nadie más se puede inscribir y la categoría queda lista para sortear.
        {reservando > 0 && <> {reservas} {reservando === 1 ? 'no entra' : 'no entran'} al sorteo.</>}
      </p>
    );
  }

  if (datos.sorteoConfirmado) return <p className="text-sm text-gris-500">Las zonas ya se sortearon.</p>;

  if (datos.estado === 'inscripciones_cerradas') {
    return (
      <p className="text-sm text-gris-500">
        Entran al sorteo los <Numero>{pagados}</Numero> que pagaron.
        {reservando > 0 && <> {reservas} {reservando === 1 ? 'queda' : 'quedan'} afuera.</>}
      </p>
    );
  }

  return null;
}

function textoDeError(error: Error): ReactNode {
  const codigo = error instanceof ErrorApi ? error.codigo : '';
  switch (codigo) {
    case 'INSCRIPTOS_INSUFICIENTES':
      return 'Los que pagaron no alcanzan para las zonas del torneo.';
    case 'INSCRIPCION_NO_ABIERTA':
      return 'La inscripción ya estaba cerrada.';
    case 'SIN_CONEXION':
      return 'No hay conexión. Probá de nuevo.';
    default:
      return 'No se pudo cerrar. Probá de nuevo.';
  }
}

function Pestana({ activa, onClick, children }: { activa: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={activa}
      onClick={onClick}
      className={`flex h-9 items-center gap-1.5 rounded-[9px] border px-[15px] text-sm ${
        activa ? 'border-negro bg-negro font-semibold text-white' : 'border-linea font-medium text-gris-700 hover:bg-fondo'
      }`}
    >
      {children}
    </button>
  );
}

type Pestana = 'confirmados' | 'reservando' | 'espera' | 'bajas' | 'solicitudes';

// Si tiene apellido parecido a lo que se busca. Sin búsqueda, todos.
const coincide = (termino: string) => (fila: { apellido: string }) => !termino || normalizar(fila.apellido).includes(termino);

function Inscripciones({ sesion, datos }: { sesion: Sesion; datos: InscripcionesDelTorneo }) {
  const slug = sesion.organizacion.slug;
  const cerrar = useCerrarInscripcion(slug, datos.torneoId);
  useSesionInvalida(cerrar.error);
  const navegar = useNavigate();

  // Con aprobación, las solicitudes van en su propia pestaña; abre en ella si hay alguna para resolver.
  const conAprobacion = datos.modoInscripcion === 'con_aprobacion';
  const [pestana, setPestana] = useState<Pestana>(() =>
    datos.solicitudes.some((s) => s.estado === 'solicitada') ? 'solicitudes' : 'confirmados',
  );
  const [busqueda, setBusqueda] = useState('');
  const [aMano, setAMano] = useState(false);

  const confirmados = datos.inscripciones.filter((i) => i.estado === 'pagada');
  const reservas = datos.inscripciones.filter((i) => i.estado === 'reservando');
  const pagados = confirmados.length;
  const reservando = reservas.length;
  const irAlSorteo = () => navegar(`/torneos/${datos.torneoId}/sorteo`);
  const termino = normalizar(busqueda);
  const primeroEnEspera = datos.listaDeEspera[0] ?? null;
  // Sin lugares no se inscribe a mano: la organización no se pasa del cupo (decisión 079).
  const sinLugares = datos.libres === 0;

  return (
    <div className="flex min-h-screen flex-col bg-white text-negro">
      <Encabezado sesion={sesion} />

      <div className="flex flex-wrap items-end justify-between gap-6 px-7 pt-[26px] pb-5">
        <div className="flex flex-col gap-[7px]">
          <h1 className="text-[30px] font-semibold tracking-[-0.035em]">Inscripciones</h1>
          <p className="text-[15px] text-gris-500">
            {datos.nombre} · {conAprobacion && 'con aprobación · '}
            {textoDelCierre(datos)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex flex-wrap gap-[9px]">
            {datos.sePuedeModificar && (
              <Boton onClick={() => setAMano(true)} disabled={sinLugares || aMano} className="text-sm">
                Inscribir a mano
              </Boton>
            )}
            {datos.estado === 'publicado' && (
              <Boton
                variante="organizador"
                className="font-semibold"
                disabled={!datos.alcanzanParaLasZonas || cerrar.isPending}
                onClick={() => cerrar.mutate()}
              >
                {cerrar.isPending ? 'Cerrando…' : 'Cerrar inscripciones'}
              </Boton>
            )}
            {datos.estado === 'inscripciones_cerradas' && !datos.sorteoConfirmado && (
              <Boton variante="organizador" className="font-semibold" onClick={irAlSorteo}>
                Sortear zonas
              </Boton>
            )}
            {datos.sorteoConfirmado && <Boton onClick={irAlSorteo}>Ver zonas</Boton>}
          </div>
          {datos.sePuedeModificar && sinLugares && (
            <p className="text-[13px] text-gris-500">No quedan lugares para inscribir a mano.</p>
          )}
        </div>
      </div>

      <main className="flex flex-col gap-[22px] px-7 pb-7">
        <section className="flex flex-col gap-3">
          <BarraDeLugares
            cupo={datos.cupo}
            pagados={pagados}
            reservando={reservando}
            solicitudes={conAprobacion ? datos.solicitudes.length : undefined}
            enEspera={datos.tieneListaEspera ? datos.listaDeEspera.length : undefined}
          />
          <QuePasaAlCerrar datos={datos} pagados={pagados} reservando={reservando} />
          {cerrar.error && <p className="text-sm text-rojo-texto">{textoDeError(cerrar.error)}</p>}
        </section>

        {/* La columna de la derecha va al costado desde 1280, como en la referencia: en una notebook de
            1024 la tabla necesita el ancho para los nombres. */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <div role="tablist" aria-label="Inscripciones" className="flex flex-wrap items-center gap-1.5">
                <Pestana activa={pestana === 'confirmados'} onClick={() => setPestana('confirmados')}>
                  Confirmados <Numero>{pagados}</Numero>
                </Pestana>
                <Pestana activa={pestana === 'reservando'} onClick={() => setPestana('reservando')}>
                  Reservando <Numero>{reservando}</Numero>
                </Pestana>
                {conAprobacion && (
                  <Pestana activa={pestana === 'solicitudes'} onClick={() => setPestana('solicitudes')}>
                    Solicitudes <Numero>{datos.solicitudes.length}</Numero>
                  </Pestana>
                )}
                {datos.tieneListaEspera && (
                  <Pestana activa={pestana === 'espera'} onClick={() => setPestana('espera')}>
                    Lista de espera <Numero>{datos.listaDeEspera.length}</Numero>
                  </Pestana>
                )}
                <Pestana activa={pestana === 'bajas'} onClick={() => setPestana('bajas')}>
                  Bajas <Numero>{datos.bajas.length}</Numero>
                </Pestana>
              </div>
              <label className="ml-auto flex h-9 items-center gap-2 rounded-[9px] border border-linea px-[13px] text-sm text-gris-500 focus-within:border-negro">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="M16 16l4.5 4.5" />
                </svg>
                <input
                  type="search"
                  aria-label="Buscar por apellido"
                  placeholder="Buscar por apellido"
                  autoComplete="off"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-40 bg-transparent text-negro outline-none placeholder:text-gris-500"
                />
              </label>
            </div>

            {pestana === 'confirmados' && (
              <TablaInscriptos
                slug={slug}
                torneoId={datos.torneoId}
                inscripciones={confirmados.filter(coincide(termino))}
                sePuedeDarDeBaja={datos.sePuedeModificar}
                primeroEnEspera={primeroEnEspera}
                horasReserva={datos.horasReservaListaEspera}
                vacio={termino ? 'Nadie con ese apellido.' : 'Todavía no pagó nadie.'}
                pie={
                  datos.sePuedeModificar
                    ? 'Se puede dar de baja hasta que se confirma el sorteo de zonas. Después, quien no juega pierde sus partidos por W.O. desde el tablero.'
                    : undefined
                }
              />
            )}
            {pestana === 'reservando' && (
              <TablaInscriptos
                slug={slug}
                torneoId={datos.torneoId}
                inscripciones={reservas.filter(coincide(termino))}
                sePuedeDarDeBaja={false}
                primeroEnEspera={primeroEnEspera}
                horasReserva={datos.horasReservaListaEspera}
                vacio={termino ? 'Nadie con ese apellido.' : 'Nadie está pagando ahora.'}
                pie={'"Recordarle" le manda otra vez el link para pagar. Si la reserva vence, el lugar pasa al primero de la lista de espera.'}
              />
            )}
            {pestana === 'solicitudes' && (
              <TablaSolicitudes
                slug={slug}
                torneoId={datos.torneoId}
                solicitudes={datos.solicitudes.filter(coincide(termino))}
                abierta={datos.estado === 'publicado'}
              />
            )}
            {pestana === 'espera' && (
              <TablaListaDeEspera
                listaDeEspera={datos.listaDeEspera.filter(coincide(termino))}
                horasReserva={datos.horasReservaListaEspera}
              />
            )}
            {pestana === 'bajas' && (
              <TablaBajas slug={slug} torneoId={datos.torneoId} bajas={datos.bajas.filter(coincide(termino))} />
            )}
          </section>

          <aside className="flex flex-col gap-4">
            {aMano && !sinLugares && (
              <InscribirAMano
                slug={slug}
                torneoId={datos.torneoId}
                categoria={datos.categoria}
                suelto={datos.suelto}
                precio={datos.precio}
                libres={datos.libres}
                inscripciones={datos.inscripciones}
                bajas={datos.bajas}
                alCerrar={() => setAMano(false)}
              />
            )}
            {datos.tieneListaEspera && !(aMano && !sinLugares) && (
              <ResumenListaDeEspera listaDeEspera={datos.listaDeEspera} horasReserva={datos.horasReservaListaEspera} />
            )}
            <Devoluciones slug={slug} torneoId={datos.torneoId} bajas={datos.bajas} />
            <Conciliacion conciliacion={datos.conciliacion} />
          </aside>
        </div>
      </main>
    </div>
  );
}
