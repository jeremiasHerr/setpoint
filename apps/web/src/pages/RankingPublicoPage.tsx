import { coincideConElNombre, type RankingPublico } from '@setpoint/shared';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Campo } from '../components/Campo';
import { Chip } from '../components/Chip';
import { EncabezadoPublico } from '../components/EncabezadoPublico';
import { LinkDeVuelta } from '../components/LinkDeVuelta';
import { leerSesion } from '../features/auth/sesion';
import { Numero } from '../components/Numero';
import { PlanillaRanking } from '../features/ranking/PlanillaRanking';
import { TablaRanking } from '../features/ranking/TablaRanking';
import { useRankingPublico } from '../features/ranking/useRankingPublico';
import { ErrorApi } from '../lib/api';
import { Esqueleto } from '../components/Esqueleto';

function mensajeDeError(error: Error) {
  if (error instanceof ErrorApi && error.codigo === 'ORGANIZACION_NO_ENCONTRADA') return 'No encontramos ese circuito. Revisá el enlace.';
  if (error instanceof ErrorApi && error.codigo === 'SIN_CONEXION') return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
  return 'No pudimos cargar el ranking. Probá de nuevo en unos minutos.';
}

// Ranking del circuito para cualquiera con el enlace, sin cuenta (F09).
export function RankingPublicoPage() {
  const { slug = '' } = useParams();
  const ranking = useRankingPublico(slug);

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col gap-[18px] px-4 pt-5 pb-7 lg:max-w-[1040px] lg:px-8">
      {/* Las páginas que se comparten por link dicen en la pestaña qué son. React lo sube al <head>. */}
      {ranking.data && <title>{`Ranking · ${ranking.data.organizacion}`}</title>}
      {/* Quien llega por el link no tiene historial: vuelve a su Inicio o a Setpoint (decisión 157). */}
      {leerSesion() ? <LinkDeVuelta ruta="/inicio">Inicio</LinkDeVuelta> : <LinkDeVuelta ruta="/">Setpoint</LinkDeVuelta>}
      {ranking.data && <EncabezadoPublico organizacion={ranking.data.organizacion} />}
      {ranking.isPending && <Esqueleto forma="lista" />}
      {ranking.error && <p className="text-[15px] text-pizarra-700">{mensajeDeError(ranking.error)}</p>}
      {ranking.data &&
        (ranking.data.usaRanking ? (
          <Ranking ranking={ranking.data} slug={slug} />
        ) : (
          <p className="text-[15px] text-pizarra-700">Este circuito no lleva ranking.</p>
        ))}
    </main>
  );
}

function Ranking({ ranking, slug }: { ranking: RankingPublico; slug: string }) {
  // La categoría va en la URL, para que la ficha vuelva a la misma (decisión 102). Sin ella, abre en la
  // primera que tiene jugadores: una vacía no dice nada a quien llega del enlace.
  const [parametros, setParametros] = useSearchParams();
  const [busqueda, setBusqueda] = useState('');
  const pedida = ranking.categorias.find((c) => String(c.id) === parametros.get('categoria'));
  const categoria = pedida ?? ranking.categorias.find((c) => c.filas.length > 0) ?? ranking.categorias[0];

  if (!categoria) return <p className="text-[15px] text-pizarra-700">Este circuito todavía no cargó sus categorías.</p>;

  // Cada fila conserva su puesto: se busca para ver dónde está alguien, no para reordenar.
  // Por nombre, apellido o los dos (decisión 146).
  const filas = categoria.filas.filter((f) => coincideConElNombre(f, busqueda));
  const filtrando = busqueda.trim() !== '';
  const vuelta = { ruta: `/c/${slug}/ranking?categoria=${categoria.id}`, etiqueta: 'Ranking' };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-display font-semibold tracking-[-0.02em]">Ranking</h1>
        <div className="flex flex-wrap gap-1.5">
          {ranking.categorias.map((c) => (
            <Chip key={c.id} activo={c.id === categoria.id} onClick={() => setParametros({ categoria: String(c.id) }, { replace: true })}>
              {c.nombre}
            </Chip>
          ))}
        </div>
      </div>

      <Campo
        id="buscar-jugador"
        rotulo="Buscar por nombre o apellido"
        type="search"
        autoComplete="off"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="flex items-baseline justify-between gap-3 pt-0.5">
        <h2 className="text-xl font-semibold tracking-[-0.02em]">Toda la tabla</h2>
        <span className="text-[13px] text-pizarra-500">
          {filtrando ? (
            <>
              <Numero>{filas.length}</Numero> de <Numero>{categoria.filas.length}</Numero>{' '}
              {categoria.filas.length === 1 ? 'jugador' : 'jugadores'}
            </>
          ) : (
            <>
              <Numero>{categoria.filas.length}</Numero> {categoria.filas.length === 1 ? 'jugador' : 'jugadores'}
            </>
          )}
        </span>
      </div>

      {/* Arriba de la tabla: al pie quedaba después de todas las filas, y nadie lo veía. */}
      {filas.length > 0 && <p className="text-[15px] text-pizarra-500 lg:hidden">Tocá un jugador para ver sus puntos por torneo y su ficha.</p>}

      {categoria.filas.length === 0 ? (
        <p className="text-[15px] text-pizarra-500">Todavía no hay jugadores en esta categoría.</p>
      ) : filas.length === 0 ? (
        <p className="text-[15px] text-pizarra-500">Nadie en {categoria.nombre} se llama así.</p>
      ) : (
        // En la compu, la planilla con una columna por torneo del calendario (decisión 155).
        <>
          <div className="lg:hidden">
            <TablaRanking slug={slug} filas={filas} torneosDelCalendario={ranking.torneosDelCalendario} vuelta={vuelta} />
          </div>
          <div className="hidden lg:block">
            <PlanillaRanking
              slug={slug}
              filas={filas}
              todasLasFilas={categoria.filas}
              torneosDelCalendario={ranking.torneosDelCalendario}
              vuelta={vuelta}
            />
          </div>
        </>
      )}
    </>
  );
}
