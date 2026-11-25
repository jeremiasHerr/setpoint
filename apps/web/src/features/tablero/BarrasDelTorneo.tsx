import type { SituacionDelPartido, Tablero } from '@setpoint/shared';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { TextoConNumeros } from '../resultados/AlGuardar';
import { COLOR_DE_LA_SITUACION, nombreDelBloque, nombresDelPartido, textoDeLosDias } from './tablero';

const LEYENDA: [SituacionDelPartido, string][] = [
  ['jugado', 'jugado'],
  ['con_fecha', 'con fecha'],
  ['sin_coordinar', 'sin coordinar'],
  ['vencido', 'vencido'],
];

const SITUACION: Record<SituacionDelPartido, string> = {
  jugado: 'jugado',
  con_fecha: 'con fecha',
  sin_coordinar: 'sin coordinar',
  vencido: 'vencido',
  esperando: 'esperando a los ganadores de la ronda anterior',
};

// Una barra por partido, agrupadas por zona (o por ronda de cada cuadro): se ve qué zona está
// atrasada sin leer un número. Las que tienen vencidos van en rojo.
export function BarrasDelTorneo({ tablero }: { tablero: Tablero }) {
  const deZonas = tablero.fase === 'grupos';
  const total = tablero.totales.partidos;
  // Solo los cuadros tienen partidos que esperan a los ganadores de la ronda anterior.
  const leyenda: [SituacionDelPartido, string][] = deZonas ? LEYENDA : [...LEYENDA, ['esperando', 'esperando rival']];
  const titulo = deZonas
    ? ['Los ', total, ' partidos, zona por zona']
    : ['Los ', total, ' partidos de los cuadros, ronda por ronda'];

  return (
    <Tarjeta className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-linea-suave px-5 pt-4 pb-3.5">
        <h2 className="text-base font-semibold">
          <TextoConNumeros frase={titulo} />
        </h2>
        <p className="flex items-baseline whitespace-pre">
          <Numero className="text-[22px] leading-7 font-medium">{tablero.totales.jugados}</Numero>
          <Numero className="text-[15px] text-pizarra-500"> / {total}</Numero>
          <span className="sr-only"> jugados</span>
        </p>
      </div>

      <div className="flex flex-col gap-4 px-5 pt-3.5 pb-5">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {leyenda.map(([situacion, rotulo]) => (
            <li key={situacion} className="flex items-center gap-1.5 text-[13px] text-pizarra-500">
              <span className={`size-[9px] rounded-[2px] ${COLOR_DE_LA_SITUACION[situacion]}`} />
              {rotulo}
            </li>
          ))}
        </ul>

        <div
          className={`grid ${
            deZonas ? 'gap-5 grid-cols-[repeat(auto-fit,minmax(84px,1fr))]' : 'gap-[18px] grid-cols-[repeat(auto-fit,minmax(190px,1fr))]'
          }`}
        >
          {tablero.bloques.map((bloque) => {
            const jugados = bloque.partidos.filter((p) => p.situacion === 'jugado').length;
            const conVencidos = bloque.partidos.some((p) => p.situacion === 'vencido');
            return (
              <div key={bloque.clave} className={`flex flex-col gap-[9px] ${deZonas ? 'w-full max-w-[120px]' : ''}`}>
                <ul className="flex gap-[3px]" aria-label={`Partidos de ${nombreDelBloque(bloque, tablero)}`}>
                  {bloque.partidos.map((partido) => {
                    const nombres = partido.jugadorA && partido.jugadorB ? `${nombresDelPartido(partido)}: ` : '';
                    const detalle =
                      partido.situacion === 'sin_coordinar' || partido.situacion === 'con_fecha' ? `, ${textoDeLosDias(partido.dias)}` : '';
                    const descripcion = `${nombres}${SITUACION[partido.situacion]}${detalle}`;
                    return (
                      <li
                        key={partido.id}
                        title={descripcion}
                        aria-label={descripcion}
                        className={`h-9 grow rounded-[3px] ${COLOR_DE_LA_SITUACION[partido.situacion]}`}
                      />
                    );
                  })}
                </ul>
                <div className={`flex items-baseline justify-between gap-2 ${conVencidos ? 'text-rojo-texto' : ''}`}>
                  <span className="min-w-0 truncate text-sm font-semibold">{nombreDelBloque(bloque, tablero)}</span>
                  <Numero className={`text-xs ${conVencidos ? '' : 'text-pizarra-500'}`}>
                    {jugados}/{bloque.partidos.length}
                  </Numero>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Tarjeta>
  );
}
