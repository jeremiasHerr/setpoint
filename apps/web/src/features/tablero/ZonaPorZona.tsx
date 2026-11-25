import type { FilaDePosiciones, Tablero, ZonaDelTablero } from '@setpoint/shared';
import { useState, type CSSProperties } from 'react';
import { Chip } from '../../components/Chip';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { DesempateDeLaZona } from './DesempateDeLaZona';
import { comoVieneLaZona, elDiaCorto, marcadorDesde, partidoEntre } from './tablero';

const rotulo = 'text-[12.5px] font-medium text-noche';

// Lo que va en el cruce de dos jugadores, desde quien está en la fila.
function Cruce({ zona, fila, rival }: { zona: ZonaDelTablero; fila: FilaDePosiciones; rival: FilaDePosiciones }) {
  const celda = 'hidden h-[60px] items-center justify-center md:flex';
  if (fila.jugadorId === rival.jugadorId) return <div className={`${celda} bg-linea-suave`} />;

  const partido = partidoEntre(zona.partidos, fila.jugadorId, rival.jugadorId);
  if (!partido) return <div className={celda} />;

  if (partido.situacion === 'jugado') {
    const gano = partido.ganadorId === fila.jugadorId;
    return (
      <div className={`${celda} ${gano ? 'bg-lona-fondo font-semibold' : 'text-pizarra-450'}`}>
        <Numero className="text-[13px]">{marcadorDesde(partido, fila.jugadorId)}</Numero>
      </div>
    );
  }
  if (partido.situacion === 'vencido') {
    return (
      <div className={celda}>
        <Numero className="text-xs text-rojo-texto">vencido</Numero>
      </div>
    );
  }
  if (partido.fechaAcordada) {
    return (
      <div className={celda}>
        <Numero className="text-xs text-pizarra-500">{elDiaCorto(partido.fechaAcordada)}</Numero>
      </div>
    );
  }
  return (
    <div className={celda}>
      <span aria-label="sin coordinar" className="h-[26px] w-12 rounded-md border border-dashed border-borde-campo" />
    </div>
  );
}

function Tabla({ zona, consuelo, usaRanking }: { zona: ZonaDelTablero; consuelo: string; usaRanking: boolean }) {
  // Una columna por rival: el ancho depende de cuántos son, así que va en una variable.
  const columnas = { '--columnas': `200px repeat(${zona.filas.length}, minmax(0, 1fr)) 48px 58px 74px` } as CSSProperties;
  const grilla = 'grid grid-cols-[minmax(0,1fr)_40px_52px_64px] md:grid-cols-[var(--columnas)]';

  return (
    <Tarjeta className="overflow-hidden">
      <div className={`${grilla} border-b border-linea bg-niebla`} style={columnas}>
        <span className="px-4 py-2.5 text-xs text-pizarra-500">jugador</span>
        {zona.filas.map((rival) => (
          <span key={rival.jugadorId} className={`hidden truncate px-1 py-2.5 text-center md:block ${rotulo}`}>
            {rival.apellido.toLowerCase()}
          </span>
        ))}
        <span className={`py-2.5 text-center ${rotulo}`}>pg</span>
        <span className={`py-2.5 text-center ${rotulo}`}>sets</span>
        <span className={`py-2.5 pr-2.5 text-right ${rotulo}`}>games</span>
      </div>

      {zona.filas.map((fila) => {
        const clasifica = fila.destino === 'campeonato';
        return (
          <div key={fila.jugadorId} className={`${grilla} items-center border-b border-linea-suave`} style={columnas}>
            <div className="flex h-[60px] min-w-0 items-center gap-2.5 px-4">
              <Numero className={`text-xs ${clasifica ? 'text-pizarra-500' : 'text-pizarra-450'}`}>{fila.posicion}</Numero>
              <span className={`size-1.5 shrink-0 rounded-full ${clasifica ? 'bg-lona-texto' : 'bg-linea'}`} />
              <span className={`truncate text-[15px] ${clasifica ? 'font-semibold' : 'font-medium text-pizarra-700'}`}>{fila.apellido}</span>
            </div>
            {zona.filas.map((rival) => (
              <Cruce key={rival.jugadorId} zona={zona} fila={fila} rival={rival} />
            ))}
            <Numero className={`text-center text-[15px] font-semibold ${clasifica ? '' : 'text-pizarra-700'}`}>{fila.partidosGanados}</Numero>
            <Numero className={`text-center text-[13px] ${clasifica ? 'text-pizarra-500' : 'text-pizarra-450'}`}>
              {fila.setsGanados}-{fila.setsPerdidos}
            </Numero>
            <Numero className={`pr-2.5 text-right text-[13px] ${clasifica ? 'text-pizarra-500' : 'text-pizarra-450'}`}>
              {fila.gamesGanados}-{fila.gamesPerdidos}
            </Numero>
          </div>
        );
      })}

      <div className="flex items-start gap-2.5 bg-niebla px-5 py-[13px]">
        <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-lona-texto" />
        <div className="flex flex-col gap-1">
          <p className="text-[13px] text-pizarra-500">{comoVieneLaZona(zona.filas, consuelo)}</p>
          <DesempateDeLaZona filas={zona.filas} usaRanking={usaRanking} />
        </div>
      </div>
    </Tarjeta>
  );
}

// Una zona a la vez, con su matriz de resultados y su tabla. Las que tienen vencidos van marcadas.
export function ZonaPorZona({ tablero }: { tablero: Tablero }) {
  const [elegida, setElegida] = useState(tablero.zonas[0]?.grupo ?? '');
  const zona = tablero.zonas.find((z) => z.grupo === elegida) ?? tablero.zonas[0];
  if (!zona) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-[-0.025em]">Zona por zona</h2>
        <div role="group" aria-label="Zona" className="flex flex-wrap gap-[5px]">
          {tablero.zonas.map(({ grupo, partidos }) => {
            const activa = grupo === zona.grupo;
            const conVencidos = partidos.some((p) => p.situacion === 'vencido');
            return (
              <Chip
                key={grupo}
                activo={activa}
                aria-label={conVencidos ? `Zona ${grupo}, con partidos vencidos` : `Zona ${grupo}`}
                onClick={() => setElegida(grupo)}
                className="gap-[7px]"
              >
                {grupo}
                {conVencidos && <span className="size-[5px] rounded-full bg-rojo" />}
              </Chip>
            );
          })}
        </div>
      </div>
      <Tabla zona={zona} consuelo={tablero.nombreCuadroConsuelo} usaRanking={tablero.usaRanking} />
    </section>
  );
}
