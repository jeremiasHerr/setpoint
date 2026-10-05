import type { JugadorPadron } from '@setpoint/shared';
import { Numero } from '../../components/Numero';

const DIAS_COMO_NUEVO = 7;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

type Props = {
  jugador: JugadorPadron;
  // Clases de grid-cols: las define la tabla para que encabezado y filas coincidan.
  columnas: string;
  conRanking: boolean;
  seleccionado: boolean;
  alEditar: () => void;
};

function iniciales({ nombre, apellido }: JugadorPadron) {
  return `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase();
}

function diasDesde(fecha: string, hoy = new Date()) {
  const inicioDelDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((inicioDelDia(hoy) - inicioDelDia(new Date(fecha))) / MS_POR_DIA);
}

// Tres letras en minúscula, como las etapas abreviadas (design.md §8). toLocaleDateString da "sept".
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// "oct 26": mes y año corto.
function mesYAnio(fecha: string) {
  const d = new Date(fecha);
  return `${MESES[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
}

function textoAlta(dias: number) {
  if (dias <= 0) return 'dado de alta hoy';
  if (dias === 1) return 'dado de alta ayer';
  return `dado de alta hace ${dias} días`;
}

export function FilaJugador({ jugador, columnas, conRanking, seleccionado, alEditar }: Props) {
  const dias = diasDesde(jugador.creadoEn);
  const esNuevo = jugador.activo && dias < DIAS_COMO_NUEVO;
  // Un jugador con 0 puntos comparte el último puesto con los demás: mostrarlo no aporta.
  const muestraPuesto = jugador.puesto !== null && jugador.puntos > 0;

  let detalle = `desde ${mesYAnio(jugador.creadoEn)}`;
  if (!jugador.activo) detalle = 'no aparece en el ranking';
  else if (esNuevo) detalle = textoAlta(dias);

  return (
    <div
      className={`grid h-[58px] items-center gap-x-4 border-b border-linea-suave px-[18px] ${columnas} ${
        seleccionado || esNuevo ? 'bg-fondo-tabla' : ''
      } ${jugador.activo ? '' : 'opacity-50'}`}
    >
      <span
        className={`flex size-[34px] items-center justify-center rounded-full text-[13px] font-semibold ${
          esNuevo ? 'bg-lima text-negro' : 'bg-linea-suave text-gris-500'
        }`}
        aria-hidden="true"
      >
        {iniciales(jugador)}
      </span>

      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-[9px]">
          <span className="truncate text-base font-medium">
            {jugador.nombre} {jugador.apellido}
          </span>
          {esNuevo && <span className="shrink-0 rounded-full bg-lima px-[7px] py-0.5 font-mono text-[11px] whitespace-nowrap">nuevo</span>}
          {jugador.cuenta && (
            <span className="shrink-0 rounded-full bg-linea-suave px-[7px] py-0.5 font-mono text-[11px] whitespace-nowrap text-gris-500">
              con cuenta
            </span>
          )}
          {!jugador.activo && (
            <span className="shrink-0 rounded-full bg-linea-suave px-[7px] py-0.5 font-mono text-[11px] whitespace-nowrap text-gris-500">
              de baja
            </span>
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

      {conRanking && (
        <div className="flex items-baseline gap-[7px]">
          {muestraPuesto && jugador.activo && <Numero className="text-[13px] text-gris-500">{jugador.puesto}º</Numero>}
          <Numero className={`text-[17px] font-medium ${jugador.puntos > 0 && jugador.activo ? '' : 'text-gris-500'}`}>
            {jugador.puntos}
          </Numero>
          <span className="text-[13px] text-gris-500">puntos</span>
        </div>
      )}

      <Numero className={`hidden text-right text-[15px] xl:block ${jugador.partidos > 0 ? '' : 'text-gris-400'}`}>
        {jugador.partidos}
      </Numero>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={alEditar}
          aria-label={`Editar a ${jugador.nombre} ${jugador.apellido}`}
          className="flex size-8 items-center justify-center rounded-lg text-gris-400 hover:bg-linea-suave hover:text-negro"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="size-[17px]" aria-hidden="true">
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
