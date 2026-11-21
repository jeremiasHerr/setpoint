import type { ProyeccionDelJugador } from '@setpoint/shared';
import { Link, useParams } from 'react-router-dom';
import { EncabezadoPublico } from '../components/EncabezadoPublico';
import { Esqueleto } from '../components/Esqueleto';
import { LinkDeVuelta } from '../components/LinkDeVuelta';
import { Numero } from '../components/Numero';
import { Tarjeta } from '../components/Tarjeta';
import { hastaDonde } from '../features/ficha/hastaDonde';
import { nombreDelEscenario } from '../features/proyeccion/escenario';
import { Escenarios } from '../features/proyeccion/Escenarios';
import { useProyeccion } from '../features/proyeccion/useProyeccion';
import { ErrorApi } from '../lib/api';

function mensajeDeError(error: Error) {
  if (error instanceof ErrorApi) {
    if (error.codigo === 'TORNEO_SIN_RANKING') return 'Este torneo no suma puntos al ranking: no hay nada en juego.';
    if (error.codigo === 'TORNEO_CERRADO') return 'El torneo ya cerró. Los puntos que sacó están en su ficha.';
    if (['ORGANIZACION_NO_ENCONTRADA', 'TORNEO_NO_ENCONTRADO', 'JUGADOR_NO_ENCONTRADO'].includes(error.codigo)) {
      return 'No encontramos a ese jugador en ese torneo. Revisá el enlace.';
    }
    if (error.codigo === 'SIN_CONEXION') return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
  }
  return 'No pudimos calcular lo que está en juego. Probá de nuevo en unos minutos.';
}

// Qué tiene en juego un jugador en un torneo que no cerró (F20): cuántos puntos suma y en qué
// puesto queda según hasta dónde llegue. Web pública, sin cuenta, como la ficha desde la que se
// llega (decisión 120). Es una cuenta exacta de la API, no IA (decisión 117).
export function EnJuegoPage() {
  const { slug = '', torneoId = '', jugadorId = '' } = useParams();
  const proyeccion = useProyeccion(slug, torneoId, jugadorId);
  const ficha = `/c/${slug}/jugadores/${jugadorId}`;

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col gap-[22px] px-4 pt-5 pb-7">
      {proyeccion.isPending && <Esqueleto forma="lista" />}
      {proyeccion.error && (
        <div className="flex flex-col gap-2">
          <LinkDeVuelta ruta={ficha}>Ficha del jugador</LinkDeVuelta>
          <p className="text-[15px] text-pizarra-700">{mensajeDeError(proyeccion.error)}</p>
        </div>
      )}
      {proyeccion.data && <EnJuego p={proyeccion.data} slug={slug} ficha={ficha} />}
    </main>
  );
}

function EnJuego({ p, slug, ficha }: { p: ProyeccionDelJugador; slug: string; ficha: string }) {
  const nombre = `${p.nombre} ${p.apellido}`;
  const anio = (a: number) => String(a).slice(-2);
  // Con el sorteo confirmado hay algo para mirar: las zonas o, si ya está en un cuadro, los cuadros.
  const verElTorneo =
    p.situacion === null
      ? null
      : p.situacion.tipo === 'cuadro'
        ? { ruta: `/c/${slug}/torneos/${p.torneoId}/cuadros`, texto: 'Ver el cuadro' }
        : { ruta: `/c/${slug}/torneos/${p.torneoId}/en-vivo`, texto: 'Ver las zonas' };

  return (
    <>
      <title>{`Qué está en juego · ${nombre}`}</title>
      <header>
        <EncabezadoPublico organizacion={p.organizacion} />
      </header>

      <section className="flex flex-col gap-1.5">
        <LinkDeVuelta ruta={ficha}>Ficha del jugador</LinkDeVuelta>
        <h1 className="text-[28px] leading-[1.1] font-display font-semibold tracking-[-0.02em]">Qué está en juego</h1>
        <p className="text-[15px] text-pizarra-700">
          Para {nombre}, según hasta dónde llegue.
        </p>
      </section>

      <Tarjeta variante="noche" className="flex flex-col gap-[17px]">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <Numero className="text-[13px] text-pizarra-400">{p.torneo}</Numero>
          <Numero className="text-[13px] text-white">{p.situacion ? hastaDonde(p.situacion) : 'Antes del sorteo'}</Numero>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-[3px]">
            <span className="text-sm text-pizarra-400">Hoy tiene</span>
            <div className="flex items-baseline gap-2">
              <Numero className="text-[44px] leading-none font-medium tracking-[-0.04em] text-white">{p.hoy.puntos}</Numero>
              <span className="text-[15px] text-pizarra-400">{p.hoy.puntos === 1 ? 'punto' : 'puntos'}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-[3px]">
            <span className="text-sm text-pizarra-400">Puesto</span>
            <Numero className="text-[44px] leading-none font-medium tracking-[-0.04em] text-white">
              {p.hoy.puesto === null ? '—' : `${p.hoy.puesto}º`}
            </Numero>
          </div>
        </div>
        <div className="h-px bg-borde-noche" />
        <p className="text-sm leading-normal text-pizarra-400">
          {p.defiende ? (
            <>
              En {p.torneoDelCalendario} {anio(p.defiende.anio)} sacó <Numero className="text-white">{p.defiende.puntos}</Numero>{' '}
              {p.defiende.puntos === 1 ? 'punto' : 'puntos'}. Lo que haga ahora <span className="text-white">reemplaza</span> ese
              casillero, no se suma encima.
            </>
          ) : (
            <>
              No tiene puntos de {p.torneoDelCalendario} en el ranking: lo que sume en este torneo se agrega a lo que tiene.
            </>
          )}
        </p>
      </Tarjeta>

      <section className="flex flex-col gap-2.5">
        <h2 className="text-xl font-semibold tracking-[-0.01em]">{p.definido ? 'Su torneo ya está definido' : 'Si llega a…'}</h2>
        <Escenarios escenarios={p.escenarios} definido={p.definido} numeroUnoDesde={p.numeroUno.desde} />
        {!p.definido && (
          <p className="text-[13px] leading-[1.42] text-pizarra-500">
            El puesto cuenta lo que los demás ya tienen asegurado. Si ellos siguen ganando, puede quedar más abajo.
          </p>
        )}
      </section>

      <NumeroUno p={p} />

      {verElTorneo && (
        <Link
          to={verElTorneo.ruta}
          className="inline-flex h-12 items-center justify-center rounded-control bg-noche-900 px-4 text-[15px] font-medium text-white hover:bg-pizarra-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-noche"
        >
          {verElTorneo.texto}
        </Link>
      )}
    </>
  );
}

// Qué le hace falta para quedar primero, y quién es el mejor de los demás con lo que ya tiene seguro.
function NumeroUno({ p }: { p: ProyeccionDelJugador }) {
  const { desde, rival } = p.numeroUno;
  const asegurada = p.escenarios[0]?.instancia;

  let falta: string;
  if (desde === null) falta = 'Con este torneo no le alcanza para quedar primero.';
  else if (desde === asegurada) falta = 'Queda primero pase lo que pase en este torneo.';
  else if (desde === 'campeon') falta = 'Tiene que ganar el torneo.';
  else falta = `Tiene que llegar a ${nombreDelEscenario(desde, false).toLowerCase()}.`;

  return (
    <Tarjeta className="flex flex-col gap-[9px] px-[18px] py-4">
      <h2 className="text-[15px] font-semibold">Para ser número uno</h2>
      <p className="text-[15px] leading-normal text-pizarra-700">
        {falta}
        {rival && (
          <>
            {' '}
            {rival.nombre} {rival.apellido} tiene asegurados <Numero className="text-noche">{rival.puntos}</Numero>{' '}
            {rival.puntos === 1 ? 'punto' : 'puntos'}
            {rival.sigueEnJuego ? ' y todavía puede sumar.' : '.'}
          </>
        )}
      </p>
    </Tarjeta>
  );
}
