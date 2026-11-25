import {
  cortaDe,
  cruceEnPalabras,
  type CaraACara,
  type JugadorDelCaraACara,
  type RivalesDelJugador,
  type Superficie,
} from '@setpoint/shared';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Chip } from '../components/Chip';
import { EncabezadoPublico } from '../components/EncabezadoPublico';
import { Esqueleto } from '../components/Esqueleto';
import { LinkDeVuelta } from '../components/LinkDeVuelta';
import { Numero } from '../components/Numero';
import { PartidosDelCaraACara } from '../features/ficha/PartidosDelCaraACara';
import { useCaraACara, useRivales } from '../features/ficha/useCaraACara';
import { ErrorApi } from '../lib/api';

function mensajeDeError(error: Error) {
  if (error instanceof ErrorApi && (error.codigo === 'ORGANIZACION_NO_ENCONTRADA' || error.codigo === 'JUGADOR_NO_ENCONTRADO')) {
    return 'No encontramos a esos jugadores. Revisá el enlace.';
  }
  if (error instanceof ErrorApi && error.codigo === 'SIN_CONEXION') return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
  return 'No pudimos cargar la comparativa. Probá de nuevo en unos minutos.';
}

// El cara a cara entre dos jugadores para cualquiera con el enlace, sin cuenta (F18). Sin rival en la
// ruta, es la lista de con quiénes jugó el jugador, para elegir; con rival, el historial entre los dos.
// Vuelve a la ficha del jugador (decisión 102). Ningún dato de contacto.
export function CaraACaraPage() {
  const { slug = '', id = '', rivalId } = useParams();
  const rivales = useRivales(slug, id, rivalId === undefined);
  const cara = useCaraACara(slug, id, rivalId);
  const consulta = rivalId === undefined ? rivales : cara;

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col gap-[18px] px-4 pt-5 pb-7">
      {consulta.isPending && <Esqueleto forma="lista" />}
      {consulta.error && (
        <>
          <LinkDeVuelta ruta={`/c/${slug}/jugadores/${id}`}>Ficha</LinkDeVuelta>
          <p className="text-[15px] text-pizarra-700">{mensajeDeError(consulta.error)}</p>
        </>
      )}
      {rivalId === undefined && rivales.data && <ElegirRival datos={rivales.data} slug={slug} />}
      {cara.data && <Comparativa cara={cara.data} slug={slug} />}
    </main>
  );
}

function ElegirRival({ datos, slug }: { datos: RivalesDelJugador; slug: string }) {
  const nombre = `${datos.nombre} ${datos.apellido}`;
  return (
    <>
      <title>{`Comparar a ${nombre} · ${datos.organizacion}`}</title>
      <EncabezadoPublico organizacion={datos.organizacion} />
      <section className="flex flex-col gap-1.5">
        <LinkDeVuelta ruta={`/c/${slug}/jugadores/${datos.jugadorId}`}>{nombre}</LinkDeVuelta>
        <h1 className="text-[28px] leading-[1.1] font-display font-semibold tracking-[-0.02em]">
          ¿Contra quién comparamos a {datos.nombre}?
        </h1>
        <p className="text-[15px] text-pizarra-500">Estos son los jugadores con los que ya jugó un partido.</p>
      </section>

      {datos.rivales.length === 0 ? (
        <p className="text-[15px] text-pizarra-700">Todavía no jugó contra nadie del circuito, así que no hay nada para comparar.</p>
      ) : (
        <ul className="flex flex-col">
          {datos.rivales.map((rival) => (
            <li key={rival.jugadorId} className="border-b border-linea-suave last:border-b-0">
              <Link
                to={`/c/${slug}/jugadores/${datos.jugadorId}/cara-a-cara/${rival.jugadorId}`}
                className="grid min-h-[56px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 py-2 hover:text-pizarra-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-noche"
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-base font-medium">
                    {rival.nombre} {rival.apellido}
                  </span>
                  {rival.categoria && <span className="text-xs text-pizarra-500">{rival.categoria}</span>}
                </span>
                <Numero className="text-sm text-pizarra-500">
                  {rival.partidos} {rival.partidos === 1 ? 'partido' : 'partidos'}
                </Numero>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Lado({ jugador, derecha }: { jugador: JugadorDelCaraACara; derecha?: boolean }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${derecha ? 'items-end text-right' : ''}`}>
      <span className="text-[19px] leading-[1.15] font-semibold break-words text-white">
        {jugador.nombre}
        <br />
        {jugador.apellido}
      </span>
      {jugador.puesto !== null && (
        <Numero className="text-xs text-pizarra-400">
          {jugador.puesto}º · {jugador.puntos} puntos
        </Numero>
      )}
    </div>
  );
}

const conMayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

function Comparativa({ cara, slug }: { cara: CaraACara; slug: string }) {
  const { a, b, resumen } = cara;
  // El filtro solo achica la lista: el panel sigue mostrando el cruce de todas las canchas.
  const [superficie, setSuperficie] = useState<Superficie | null>(null);
  const partidos = superficie ? cara.partidos.filter((p) => p.superficie === superficie) : cara.partidos;
  const titulo = `${a.apellido} y ${b.apellido}`;
  const { jugados, ganadosA, ganadosB, walkovers } = resumen;
  // Quien lidera va en verde sobre el panel; con el cruce igualado, nadie.
  const color = (propios: number, ajenos: number) => (propios > ajenos ? 'text-lona-borde' : 'text-white');

  return (
    <>
      <title>{`${titulo} · ${cara.organizacion}`}</title>
      <EncabezadoPublico organizacion={cara.organizacion} />
      <LinkDeVuelta ruta={`/c/${slug}/jugadores/${a.jugadorId}`}>
        {a.nombre} {a.apellido}
      </LinkDeVuelta>
      <h1 className="sr-only">Cara a cara de {titulo}</h1>

      <section aria-label="Resumen" className="flex flex-col gap-5 rounded-2xl bg-noche px-[18px] py-6">
        <p className="text-sm text-pizarra-400">
          {jugados === 0 ? 'Todavía no se jugaron' : jugados === 1 ? 'Se jugaron una vez' : `Se jugaron ${jugados} veces`}
        </p>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3">
          <Lado jugador={a} />
          <Numero className="flex items-baseline gap-1.5 text-[34px] font-medium tracking-[-0.02em]">
            <span className={color(ganadosA, ganadosB)}>{ganadosA}</span>
            <span className="text-pizarra-400">-</span>
            <span className={color(ganadosB, ganadosA)}>{ganadosB}</span>
          </Numero>
          <Lado jugador={b} derecha />
        </div>
      </section>

      {walkovers > 0 && (
        <p className="text-[13px] text-pizarra-500">
          {walkovers === 1 ? (
            'Sin contar un W.O., que no se jugó.'
          ) : (
            <>
              Sin contar <Numero>{walkovers}</Numero> W.O., que no se jugaron.
            </>
          )}
        </p>
      )}

      <section className="flex flex-col gap-2.5">
        <h2 className="text-[17px] font-semibold tracking-[-0.015em]">Partidos</h2>
        {/* Solo las superficies en las que jugaron: sin el dato del club, no hay filtro (decisión 126). */}
        {cara.porSuperficie.length > 0 && (
          <div role="group" aria-label="Filtrar por superficie" className="flex flex-wrap gap-2">
            <Chip activo={superficie === null} onClick={() => setSuperficie(null)}>
              Todas
            </Chip>
            {cara.porSuperficie.map((cruce) => (
              <Chip key={cruce.superficie} activo={superficie === cruce.superficie} onClick={() => setSuperficie(cruce.superficie)}>
                {conMayuscula(cortaDe(cruce.superficie))}
              </Chip>
            ))}
          </div>
        )}
        {cara.partidos.length === 0 ? (
          <p className="text-[15px] text-pizarra-500">Todavía no hay partidos con resultado entre los dos.</p>
        ) : (
          <PartidosDelCaraACara partidos={partidos} apellidoA={a.apellido} apellidoB={b.apellido} consuelo={cara.nombreCuadroConsuelo} />
        )}
      </section>

      {cara.porSuperficie.length > 0 && (
        <p className="max-w-[60ch] text-[15px] leading-[1.45] text-pizarra-700">
          {cruceEnPalabras(cara.porSuperficie, a.apellido, b.apellido)}
        </p>
      )}

      <Link
        to={`/c/${slug}/jugadores/${a.jugadorId}/cara-a-cara`}
        className="self-start text-sm font-medium text-noche underline underline-offset-[3px] hover:text-pizarra-500"
      >
        Comparar a {a.nombre} con otro jugador
      </Link>
      <p className="text-sm leading-[1.42] text-pizarra-500">Ninguna pantalla pública muestra datos de contacto.</p>
    </>
  );
}
