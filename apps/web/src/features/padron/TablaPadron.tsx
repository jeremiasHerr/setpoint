import type { JugadorPadron } from '@setpoint/shared';
import { useState } from 'react';
import { Chip } from '../../components/Chip';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { FilaJugador } from './FilaJugador';

type Props = {
  jugadores: JugadorPadron[];
  categorias: string[];
  conRanking: boolean;
  seleccionadoId: number | null;
  alEditar: (jugador: JugadorPadron) => void;
};

// Las columnas que no entran en una notebook se ocultan: partidos por debajo de xl, categoría por debajo de md.
const COLUMNAS_CON_RANKING =
  'grid-cols-[34px_minmax(0,1fr)_auto_40px] md:grid-cols-[34px_minmax(0,1fr)_118px_158px_40px] xl:grid-cols-[34px_minmax(0,1fr)_118px_158px_84px_40px]';
const COLUMNAS_SIN_RANKING =
  'grid-cols-[34px_minmax(0,1fr)_40px] md:grid-cols-[34px_minmax(0,1fr)_118px_40px] xl:grid-cols-[34px_minmax(0,1fr)_118px_84px_40px]';

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

export function TablaPadron({ jugadores, categorias, conRanking, seleccionadoId, alEditar }: Props) {
  const [categoria, setCategoria] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const texto = normalizar(busqueda.trim());
  const visibles = ordenar(
    jugadores.filter(
      (j) =>
        (categoria === null || j.categoria === categoria) &&
        (texto === '' || normalizar(`${j.apellido} ${j.nombre}`).includes(texto)),
    ),
  );
  const columnas = conRanking ? COLUMNAS_CON_RANKING : COLUMNAS_SIN_RANKING;

  return (
    <Tarjeta className="flex flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-linea px-[18px] py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Chip activo={categoria === null} onClick={() => setCategoria(null)}>
            Todas
          </Chip>
          {categorias.map((nombre) => (
            <Chip key={nombre} activo={categoria === nombre} onClick={() => setCategoria(nombre)}>
              {nombre}
            </Chip>
          ))}
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
        {conRanking && <span className="font-mono text-[11px] text-gris-500">ranking</span>}
        <span className="hidden text-right font-mono text-[11px] text-gris-500 xl:block">partidos</span>
        <span />
      </div>

      {visibles.map((jugador) => (
        <FilaJugador
          key={jugador.id}
          jugador={jugador}
          columnas={columnas}
          conRanking={conRanking}
          seleccionado={jugador.id === seleccionadoId}
          alEditar={() => alEditar(jugador)}
        />
      ))}

      {visibles.length === 0 && (
        <p className="border-b border-linea-suave px-[18px] py-8 text-center text-sm text-gris-500">
          {jugadores.length === 0
            ? 'Todavía no hay jugadores. Agregá el primero con el formulario de al lado.'
            : 'Ningún jugador coincide con la búsqueda.'}
        </p>
      )}

      <div className="bg-fondo-tabla px-[18px] py-[15px]">
        <span className="font-mono text-[13px] text-gris-500">
          mostrando <Numero>{visibles.length}</Numero> de <Numero>{jugadores.length}</Numero>
        </span>
      </div>
    </Tarjeta>
  );
}
