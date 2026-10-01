import { Numero } from '../Numero';
import { partidosPendientesEjemplo, zonasEjemplo, type EstadoPartido } from './datosLanding';

// La barra de marcas del tablero, sobre fondo oscuro.
const colorMarca: Record<EstadoPartido, string> = {
  hecho: 'bg-lima',
  enCurso: 'bg-gris-700',
  pendiente: 'bg-borde-oscuro',
  vencido: 'bg-rojo',
};

export function AvanceZonas() {
  const totalPartidos = zonasEjemplo.reduce((total, zona) => total + zona.partidos.length, 0);
  const jugados = zonasEjemplo.reduce(
    (total, zona) => total + zona.partidos.filter((estado) => estado === 'hecho').length,
    0,
  );

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-borde-oscuro bg-carbon p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">Fase de grupos</span>
        {/* La referencia muestra el avance del torneo completo (8 zonas), no solo de las 4 dibujadas */}
        <Numero className="text-xs text-gris-400">31 de 48</Numero>
      </div>

      <div className="grid grid-cols-4 gap-3" aria-label={`${jugados} de ${totalPartidos} partidos jugados en estas zonas`}>
        {zonasEjemplo.map((zona) => (
          <div key={zona.letra} className="flex flex-col gap-[7px]">
            <div className="flex gap-0.5">
              {zona.partidos.map((estado, i) => (
                <div key={i} className={`h-[30px] grow rounded-[2px] ${colorMarca[estado]}`} />
              ))}
            </div>
            <Numero className="text-[11px] text-gris-500">
              {zona.letra} · {zona.partidos.filter((estado) => estado === 'hecho').length}/{zona.partidos.length}
            </Numero>
          </div>
        ))}
      </div>

      <div className="h-px bg-borde-oscuro" />

      <div className="flex flex-col gap-[9px]">
        {partidosPendientesEjemplo.map((partido) => (
          <div key={partido.jugadores} className="flex items-center justify-between gap-2.5">
            <span className="text-[13px] text-white">{partido.jugadores}</span>
            <Numero className={`text-xs ${partido.vencido ? 'text-rojo' : 'text-gris-400'}`}>{partido.estado}</Numero>
          </div>
        ))}
      </div>
    </div>
  );
}
