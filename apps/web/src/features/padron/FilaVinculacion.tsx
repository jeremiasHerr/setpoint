import type { JugadorPadron } from '@setpoint/shared';
import { ConCifras } from '../../components/Numero';
import { EnlaceParaRevisar } from '../revisiones/piezas';
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
      className={`grid min-h-[58px] items-center gap-x-3 border-b border-linea-suave px-4 py-2 md:h-[58px] md:gap-x-4 md:px-[18px] md:py-0 ${columnas} ${
        seleccionado ? 'bg-niebla' : ''
      }`}
    >
      <span
        className={`flex size-[34px] items-center justify-center rounded-full text-[13px] font-semibold ${
          jugador.revision ? 'bg-linea-suave text-pizarra-500' : 'bg-lona-fondo text-lona-texto'
        }`}
        aria-hidden="true"
      >
        {iniciales(jugador)}
      </span>

      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-[9px] gap-y-1 md:flex-nowrap">
          <span className="max-w-full shrink-0 truncate text-base font-medium md:shrink">{nombre}</span>
          {jugador.revision ? (
            <EnlaceParaRevisar jugadorId={jugador.id} />
          ) : (
            <span className="shrink-0 rounded-full bg-lona-fondo text-lona-texto px-[7px] py-0.5 text-[12.5px] font-medium whitespace-nowrap">nueva</span>
          )}
        </div>
        <span className="truncate text-[13px] text-pizarra-500">{detalle}</span>
      </div>

      <div className="hidden md:block">
        <span
          className={`inline-flex h-[34px] items-center rounded-full border border-linea bg-niebla px-[13px] text-sm font-medium ${
            jugador.categoria ? '' : 'text-pizarra-500'
          }`}
        >
          {jugador.categoria ?? 'Sin categoría'}
        </span>
      </div>

      <span className="hidden text-sm md:block">{jugador.vinculadoPor ? COMO_EN_LA_LISTA[jugador.vinculadoPor] : '—'}</span>

      <ConCifras className="text-right text-[13px] text-pizarra-500">{jugador.vinculadoEn ? cuandoSeVinculo(jugador.vinculadoEn) : '—'}</ConCifras>

      <MenuJugador jugador={jugador} slug={slug} organizacion={organizacion} alEditar={alEditar} />
    </div>
  );
}
