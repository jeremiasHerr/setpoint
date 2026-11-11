import type { TorneoEnVivo } from '@setpoint/shared';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Chip } from '../components/Chip';
import { EncabezadoPublico } from '../components/EncabezadoPublico';
import { BotonCompartir } from '../features/cuadros/BotonCompartir';
import { LosCuadros } from '../features/cuadros/LosCuadros';
import { CalendarioEnVivo } from '../features/en-vivo/CalendarioEnVivo';
import { useTorneoEnVivo } from '../features/en-vivo/useTorneoEnVivo';
import { ZonasEnVivo } from '../features/en-vivo/ZonasEnVivo';
import { ErrorApi } from '../lib/api';

type Pestana = 'zonas' | 'cuadros' | 'calendario';
const PESTANAS: { clave: Pestana; nombre: string }[] = [
  { clave: 'zonas', nombre: 'Zonas' },
  { clave: 'cuadros', nombre: 'Cuadros' },
  { clave: 'calendario', nombre: 'Calendario' },
];

function mensajeDeError(error: Error) {
  if (error instanceof ErrorApi && (error.codigo === 'ORGANIZACION_NO_ENCONTRADA' || error.codigo === 'TORNEO_NO_ENCONTRADO')) {
    return 'No encontramos ese torneo. Revisá el enlace.';
  }
  if (error instanceof ErrorApi && error.codigo === 'ZONAS_NO_GENERADAS') {
    return 'Las zonas se publican cuando la organización confirma el sorteo. Volvé a mirar más adelante.';
  }
  if (error instanceof ErrorApi && error.codigo === 'SIN_CONEXION') return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
  return 'No pudimos cargar el torneo. Probá de nuevo en unos minutos.';
}

// El torneo en vivo para cualquiera con el enlace, sin cuenta (F10): las zonas, los cuadros y el
// calendario, en pestañas de una sola página (decisión 069). Es el enlace que la organización
// comparte en el grupo. /cuadros abre la pestaña Cuadros, para no romper los enlaces ya compartidos.
export function EnVivoPage({ pestanaInicial }: { pestanaInicial?: Pestana }) {
  const { slug = '', id = '' } = useParams();
  const torneo = useTorneoEnVivo(slug, id);

  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col gap-[18px] px-4 pt-5 pb-7 xl:max-w-none xl:px-[30px]">
      {torneo.isPending && <p className="text-[15px] text-gris-500">Cargando el torneo…</p>}
      {/* Si falla una actualización, queda lo último que se cargó. */}
      {torneo.error && !torneo.data && <p className="text-[15px] text-gris-700">{mensajeDeError(torneo.error)}</p>}
      {torneo.data && <Contenido torneo={torneo.data} slug={slug} id={id} pestanaInicial={pestanaInicial} />}
    </main>
  );
}

function Contenido({ torneo, slug, id, pestanaInicial }: { torneo: TorneoEnVivo; slug: string; id: string; pestanaInicial?: Pestana }) {
  const [parametros, setParametros] = useSearchParams();
  const pedida = parametros.get('ver') as Pestana | null;
  // Sin pestaña pedida, abre donde está el torneo: en las zonas mientras se juegan, y en los
  // cuadros después.
  const pestana: Pestana =
    pedida && PESTANAS.some((p) => p.clave === pedida) ? pedida : (pestanaInicial ?? (torneo.hayCuadros ? 'cuadros' : 'zonas'));

  return (
    <>
      <title>{`${torneo.nombre} · en vivo · ${torneo.organizacion}`}</title>
      <header className="xl:-mx-[30px] xl:flex xl:h-[58px] xl:items-center xl:border-b xl:border-linea xl:px-[30px]">
        <EncabezadoPublico organizacion={torneo.organizacion} detalle={torneo.nombre} />
      </header>

      <div className="flex flex-col gap-1.5 xl:pt-2">
        {/* Las páginas públicas no tienen menú: esta vuelve a la del torneo, que enlaza acá (decisión 084). */}
        <Link to={`/c/${slug}/torneos/${id}`} className="self-start py-1 text-sm text-gris-500 hover:text-negro">
          ← El torneo
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <h1 className="text-[30px] font-semibold tracking-[-0.035em]">El torneo en vivo</h1>
          <BotonCompartir titulo={`${torneo.nombre} · ${torneo.organizacion}`} />
        </div>
      </div>

      <div role="group" aria-label="Qué ver" className="flex flex-wrap gap-1.5">
        {PESTANAS.map(({ clave, nombre }) => (
          <Chip key={clave} activo={clave === pestana} onClick={() => setParametros({ ver: clave }, { replace: true })}>
            {nombre}
          </Chip>
        ))}
      </div>

      {pestana === 'zonas' && <ZonasEnVivo torneo={torneo} slug={slug} />}
      {pestana === 'cuadros' &&
        (torneo.hayCuadros ? (
          <LosCuadros slug={slug} torneoId={id} />
        ) : (
          <p className="text-[15px] text-gris-500">Los cuadros se arman cuando terminan las zonas. Volvé a mirar más adelante.</p>
        ))}
      {pestana === 'calendario' && <CalendarioEnVivo torneo={torneo} />}
    </>
  );
}
