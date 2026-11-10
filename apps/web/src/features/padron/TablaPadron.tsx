import type { JugadorPadron } from '@setpoint/shared';
import { useState } from 'react';
import { Chip } from '../../components/Chip';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { FilaJugador } from './FilaJugador';
import { FilaVinculacion } from './FilaVinculacion';
import { esVinculacionNueva, laVisita } from './vinculacion';

type Props = {
  jugadores: JugadorPadron[];
  categorias: string[];
  conRanking: boolean;
  seleccionadoId: number | null;
  // La visita anterior al padrón (decisión 083): null la primera vez, undefined si no se pudo guardar.
  anterior: string | null | undefined;
  slug: string;
  organizacion: string;
  alEditar: (jugador: JugadorPadron) => void;
};

// Las columnas que no entran en una notebook se ocultan: partidos por debajo de xl, categoría por debajo de md.
const COLUMNAS_CON_RANKING =
  'grid-cols-[34px_minmax(0,1fr)_auto_40px] md:grid-cols-[34px_minmax(0,1fr)_118px_158px_40px] xl:grid-cols-[34px_minmax(0,1fr)_118px_158px_84px_40px]';
const COLUMNAS_SIN_RANKING =
  'grid-cols-[34px_minmax(0,1fr)_40px] md:grid-cols-[34px_minmax(0,1fr)_118px_40px] xl:grid-cols-[34px_minmax(0,1fr)_118px_84px_40px]';
// En Nuevas: categoría, cómo se vinculó y cuándo. En el celular queda solo cuándo.
const COLUMNAS_NUEVAS = 'grid-cols-[34px_minmax(0,1fr)_auto_40px] md:grid-cols-[34px_minmax(0,1fr)_118px_130px_70px_40px]';

// Además de las categorías, el padrón filtra las vinculaciones nuevas y las que quedaron para revisar.
type Filtro = { categoria: string } | 'nuevas' | 'revisar' | null;

// Sin tildes ni mayúsculas: "perez" encuentra a "Pérez".
function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Activos primero, de más a menos puntos; los de baja al final.
function ordenar(jugadores: JugadorPadron[]) {
  return [...jugadores].sort(
    (a, b) =>
      Number(b.activo) - Number(a.activo) ||
      b.puntos - a.puntos ||
      a.apellido.localeCompare(b.apellido, 'es') ||
      a.nombre.localeCompare(b.nombre, 'es'),
  );
}

export function TablaPadron({ jugadores, categorias, conRanking, seleccionadoId, anterior, slug, organizacion, alEditar }: Props) {
  const [filtro, setFiltro] = useState<Filtro>(null);
  const [busqueda, setBusqueda] = useState('');

  const nuevas = anterior === undefined ? [] : jugadores.filter((j) => esVinculacionNueva(j, anterior));
  const paraRevisar = jugadores.filter((j) => j.revision !== null);
  const enNuevas = filtro === 'nuevas';

  const delFiltro =
    filtro === 'nuevas'
      ? nuevas
      : filtro === 'revisar'
        ? paraRevisar
        : filtro === null
          ? jugadores
          : jugadores.filter((j) => j.categoria === filtro.categoria);
  const texto = normalizar(busqueda.trim());
  const encontrados = delFiltro.filter((j) => texto === '' || normalizar(`${j.apellido} ${j.nombre}`).includes(texto));
  // Las nuevas, de la última a la primera.
  const visibles = enNuevas ? [...encontrados].sort((a, b) => b.vinculadoEn!.localeCompare(a.vinculadoEn!)) : ordenar(encontrados);
  const columnas = enNuevas ? COLUMNAS_NUEVAS : conRanking ? COLUMNAS_CON_RANKING : COLUMNAS_SIN_RANKING;

  return (
    // Sin overflow-hidden: el menú de las últimas filas se saldría recortado.
    <Tarjeta className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-linea px-[18px] py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Chip activo={filtro === null} onClick={() => setFiltro(null)}>
            Todas
          </Chip>
          {categorias.map((nombre) => (
            <Chip
              key={nombre}
              activo={typeof filtro === 'object' && filtro?.categoria === nombre}
              onClick={() => setFiltro({ categoria: nombre })}
            >
              {nombre}
            </Chip>
          ))}
          {/* Solo si hay alguna; el elegido queda aunque se vacíe, para no dejar la tabla sin filtro a la vista. */}
          {(nuevas.length > 0 || enNuevas) && (
            <Chip activo={enNuevas} onClick={() => setFiltro('nuevas')}>
              {/* En un mismo renglón, para que el número quede en la línea de base del texto y no centrado como caja. */}
              <span>
                Nuevas <Numero className="ml-[3px] text-[13px]">{nuevas.length}</Numero>
              </span>
            </Chip>
          )}
          {(paraRevisar.length > 0 || filtro === 'revisar') && (
            <Chip activo={filtro === 'revisar'} onClick={() => setFiltro('revisar')}>
              <span>
                Para revisar <Numero className="ml-[3px] text-[13px]">{paraRevisar.length}</Numero>
              </span>
            </Chip>
          )}
        </div>

        <label className="flex h-[38px] w-full items-center gap-[9px] rounded-control border border-gris-300 px-[13px] focus-within:border-2 focus-within:border-negro focus-within:px-3 sm:w-[250px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className="size-[15px] shrink-0 text-gris-500" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por apellido"
            aria-label="Buscar por apellido"
            className="min-w-0 flex-1 text-sm outline-none placeholder:text-gris-400"
          />
        </label>
      </div>

      <div className={`grid h-[38px] items-center gap-x-4 border-b border-linea bg-fondo-tabla px-[18px] ${columnas}`}>
        <span />
        <span className="font-mono text-[11px] text-gris-500">jugador</span>
        <span className="hidden font-mono text-[11px] text-gris-500 md:block">categoría</span>
        {enNuevas ? (
          <>
            <span className="hidden font-mono text-[11px] text-gris-500 md:block">cómo se vinculó</span>
            <span className="text-right font-mono text-[11px] text-gris-500">cuándo</span>
          </>
        ) : (
          <>
            {conRanking && <span className="font-mono text-[11px] text-gris-500">ranking</span>}
            <span className="hidden text-right font-mono text-[11px] text-gris-500 xl:block">partidos</span>
          </>
        )}
        <span />
      </div>

      {enNuevas &&
        visibles.map((jugador) => (
          <FilaVinculacion
            key={jugador.id}
            jugador={jugador}
            columnas={columnas}
            seleccionado={jugador.id === seleccionadoId}
            slug={slug}
            organizacion={organizacion}
            alEditar={() => alEditar(jugador)}
          />
        ))}

      {!enNuevas && visibles.map((jugador) => (
        <FilaJugador
          key={jugador.id}
          jugador={jugador}
          columnas={columnas}
          conRanking={conRanking}
          seleccionado={jugador.id === seleccionadoId}
          slug={slug}
          organizacion={organizacion}
          alEditar={() => alEditar(jugador)}
        />
      ))}

      {visibles.length === 0 && (
        <p className="border-b border-linea-suave px-[18px] py-8 text-center text-sm text-gris-500">
          {jugadores.length === 0
            ? 'Todavía no hay jugadores. Agregá el primero con el formulario de al lado.'
            : enNuevas && delFiltro.length === 0
              ? 'No quedan vinculaciones nuevas.'
              : filtro === 'revisar' && delFiltro.length === 0
                ? 'No queda ninguna vinculación para revisar.'
                : 'Ningún jugador coincide con la búsqueda.'}
        </p>
      )}

      {enNuevas ? (
        <p className="rounded-b-tarjeta bg-fondo-tabla px-[18px] py-[15px] text-[13px] leading-normal text-gris-500">
          {anterior ? `Las vinculaciones desde tu última visita, ${laVisita(anterior)}.` : 'Es la primera vez que abrís el padrón: están todas las vinculaciones.'}{' '}
          No tenés que aprobar nada: si alguna no te cierra, la desvinculás.
        </p>
      ) : (
        <div className="rounded-b-tarjeta bg-fondo-tabla px-[18px] py-[15px]">
          <span className="font-mono text-[13px] text-gris-500">
            mostrando <Numero>{visibles.length}</Numero> de <Numero>{jugadores.length}</Numero>
          </span>
        </div>
      )}
    </Tarjeta>
  );
}
