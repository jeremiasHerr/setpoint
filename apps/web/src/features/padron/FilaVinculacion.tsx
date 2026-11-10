import type { JugadorPadron } from '@setpoint/shared';
import { Link } from 'react-router-dom';
import { Numero } from '../../components/Numero';
import { motivoCorto } from '../revisiones/textos';
import { MenuJugador } from './MenuJugador';
import { COMO_EN_LA_LISTA, cuandoSeVinculo } from './vinculacion';

function iniciales({ nombre, apellido }: JugadorPadron) {
  return `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase();
}

type Props = {
  jugador: JugadorPadron;
  // Clases de grid-cols: las define la tabla para que encabezado y filas coincidan.
  columnas: string;
  seleccionado: boolean;
  slug: string;
  organizacion: string;
  alEditar: () => void;
};

// Una fila de "Nuevas" (decisión 083): quién se vinculó, con qué cuenta, cómo y cuándo. No hay nada
// que aprobar; las que el sistema no resuelve solo llevan "para revisar" en vez de "nueva".
export function FilaVinculacion({ jugador, columnas, seleccionado, slug, organizacion, alEditar }: Props) {
  const nombre = `${jugador.nombre} ${jugador.apellido}`;
  const detalle = jugador.revision ? `${jugador.cuenta?.email} · ${motivoCorto(jugador.revision, nombre)}` : jugador.cuenta?.email;

  return (
    <div
      className={`grid h-[58px] items-center gap-x-4 border-b border-linea-suave px-[18px] ${columnas} ${
        seleccionado ? 'bg-fondo-tabla' : ''
      }`}
    >
      <span
        className={`flex size-[34px] items-center justify-center rounded-full text-[13px] font-semibold ${
          jugador.revision ? 'bg-linea-suave text-gris-500' : 'bg-lima text-negro'
        }`}
        aria-hidden="true"
      >
        {iniciales(jugador)}
      </span>

      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-[9px]">
          <span className="truncate text-base font-medium">{nombre}</span>
          {jugador.revision ? (
            <Link
              to={`/padron/revisar/${jugador.id}`}
              className="shrink-0 rounded-full border border-negro px-[7px] py-px font-mono text-[11px] whitespace-nowrap hover:bg-negro hover:text-white"
            >
              para revisar
            </Link>
          ) : (
            <span className="shrink-0 rounded-full bg-lima px-[7px] py-0.5 font-mono text-[11px] whitespace-nowrap">nueva</span>
          )}
        </div>
        <span className="truncate font-mono text-xs text-gris-500">{detalle}</span>
      </div>

      <div className="hidden md:block">
        <span
          className={`inline-flex h-[34px] items-center rounded-full border border-linea bg-fondo px-[13px] text-sm font-medium ${
            jugador.categoria ? '' : 'text-gris-500'
          }`}
        >
          {jugador.categoria ?? 'Sin categoría'}
        </span>
      </div>

      <span className="hidden text-sm md:block">{jugador.vinculadoPor ? COMO_EN_LA_LISTA[jugador.vinculadoPor] : '—'}</span>

      <Numero className="text-right text-[13px] text-gris-500">{jugador.vinculadoEn ? cuandoSeVinculo(jugador.vinculadoEn) : '—'}</Numero>

      <MenuJugador jugador={jugador} slug={slug} organizacion={organizacion} alEditar={alEditar} />
    </div>
  );
}
