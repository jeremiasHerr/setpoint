import type { JugadorPadron } from '@setpoint/shared';
import { Numero } from '../../components/Numero';
import { EnlaceParaRevisar } from '../revisiones/piezas';
import { MenuJugador } from './MenuJugador';
import { diasDesde } from './vinculacion';

const DIAS_COMO_NUEVO = 7;

type Props = {
  jugador: JugadorPadron;
  // Clases de grid-cols: las define la tabla para que encabezado y filas coincidan.
  columnas: string;
  conRanking: boolean;
  seleccionado: boolean;
  // Para el link personal: el mensaje nombra a la organización.
  slug: string;
  organizacion: string;
  // Vinculada desde la última visita de la organización (decisión 083).
  vinculacionNueva: boolean;
  alEditar: () => void;
};

function iniciales({ nombre, apellido }: JugadorPadron) {
  return `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase();
}

export function FilaJugador({ jugador, columnas, conRanking, seleccionado, slug, organizacion, vinculacionNueva, alEditar }: Props) {
  const dias = diasDesde(jugador.creadoEn);
  const esNuevo = jugador.activo && dias < DIAS_COMO_NUEVO;
  // Un jugador con 0 puntos comparte el último puesto con los demás: mostrarlo no aporta.
  const muestraPuesto = jugador.puesto !== null && jugador.puntos > 0;

  return (
    <div
      className={`grid min-h-[58px] items-center gap-x-3 border-b border-linea-suave px-4 py-2 md:h-[58px] md:gap-x-4 md:px-[18px] md:py-0 ${columnas} ${
        seleccionado || esNuevo ? 'bg-niebla' : ''
      } ${jugador.activo ? '' : 'opacity-50'}`}
    >
      <span
        className={`flex size-[34px] items-center justify-center rounded-full text-[13px] font-semibold ${
          esNuevo ? 'bg-lona-fondo text-lona-texto' : 'bg-linea-suave text-pizarra-500'
        }`}
        aria-hidden="true"
      >
        {iniciales(jugador)}
      </span>

      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-[9px] gap-y-1 md:flex-nowrap">
          <span className="max-w-full shrink-0 truncate text-base font-medium md:shrink">
            {jugador.nombre} {jugador.apellido}
          </span>
          {esNuevo && <span className="shrink-0 rounded-full bg-lona-fondo text-lona-texto px-[7px] py-0.5 text-[12.5px] font-medium whitespace-nowrap">nuevo</span>}
          {vinculacionNueva && (
            <span className="shrink-0 rounded-full bg-lona-fondo text-lona-texto px-[7px] py-0.5 text-[12.5px] font-medium whitespace-nowrap">nueva</span>
          )}
          {jugador.revision && (
            <EnlaceParaRevisar jugadorId={jugador.id} />
          )}
          {!jugador.activo && (
            <span className="shrink-0 rounded-full bg-linea-suave px-[7px] py-0.5 text-[12.5px] font-medium whitespace-nowrap text-noche">
              de baja
            </span>
          )}
        </div>
        <span className="truncate text-[13px] text-pizarra-500">{jugador.cuenta ? jugador.cuenta.email : 'sin vincular'}</span>
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

      {conRanking && (
        <div className="flex items-baseline justify-end gap-[7px] md:justify-start">
          {muestraPuesto && jugador.activo && <Numero className="hidden text-[13px] text-pizarra-500 md:inline">{jugador.puesto}º</Numero>}
          <Numero className={`text-[17px] font-medium ${jugador.puntos > 0 && jugador.activo ? '' : 'text-pizarra-500'}`}>
            {jugador.puntos}
          </Numero>
          <span className="hidden text-[13px] text-pizarra-500 md:inline">puntos</span>
        </div>
      )}

      <Numero className={`hidden text-right text-[15px] xl:block ${jugador.partidos > 0 ? '' : 'text-pizarra-400'}`}>
        {jugador.partidos}
      </Numero>

      <MenuJugador jugador={jugador} slug={slug} organizacion={organizacion} alEditar={alEditar} />
    </div>
  );
}
