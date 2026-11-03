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
    <Tarjeta className="flex min-w-0 flex-col gap-4 px-5 pt-[18px] pb-4">
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
        <h2 className="text-[15px] font-semibold">
          <TextoConNumeros frase={titulo} />
        </h2>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {leyenda.map(([situacion, rotulo]) => (
            <li key={situacion} className="flex items-center gap-1.5 text-[13px] text-gris-500">
              <span className={`size-[9px] rounded-[2px] ${COLOR_DE_LA_SITUACION[situacion]}`} />
              {rotulo}
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`grid gap-[18px] ${
          deZonas ? 'grid-cols-[repeat(auto-fill,minmax(84px,1fr))]' : 'grid-cols-[repeat(auto-fill,minmax(150px,1fr))]'
        }`}
      >
        {tablero.bloques.map((bloque) => {
          const jugados = bloque.partidos.filter((p) => p.situacion === 'jugado').length;
          const conVencidos = bloque.partidos.some((p) => p.situacion === 'vencido');
          return (
            <div key={bloque.clave} className="flex flex-col gap-[9px]">
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
                      className={`h-11 grow rounded-[3px] ${COLOR_DE_LA_SITUACION[partido.situacion]}`}
                    />
                  );
                })}
              </ul>
              <div className={`flex items-baseline justify-between gap-2 ${conVencidos ? 'text-rojo-texto' : ''}`}>
                <span className="min-w-0 text-sm font-semibold">{nombreDelBloque(bloque, tablero)}</span>
                <Numero className={`text-xs ${conVencidos ? '' : 'text-gris-500'}`}>
                  {jugados}/{bloque.partidos.length}
                </Numero>
              </div>
            </div>
          );
        })}
      </div>
    </Tarjeta>
  );
}
