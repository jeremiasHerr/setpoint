import type { FilaDePosiciones, Tablero, ZonaDelTablero } from '@setpoint/shared';
import { useState, type CSSProperties } from 'react';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { comoVieneLaZona, elDiaCorto, marcadorDesde, partidoEntre } from './tablero';

const rotulo = 'font-mono text-[11px] text-gris-500';

// Lo que va en el cruce de dos jugadores, desde quien está en la fila.
function Cruce({ zona, fila, rival }: { zona: ZonaDelTablero; fila: FilaDePosiciones; rival: FilaDePosiciones }) {
  const celda = 'hidden h-[60px] items-center justify-center md:flex';
  if (fila.jugadorId === rival.jugadorId) return <div className={`${celda} bg-linea-suave`} />;

  const partido = partidoEntre(zona.partidos, fila.jugadorId, rival.jugadorId);
  if (!partido) return <div className={celda} />;

  if (partido.situacion === 'jugado') {
    const gano = partido.ganadorId === fila.jugadorId;
    return (
      <div className={`${celda} ${gano ? 'bg-lima-tenue font-semibold' : 'text-gris-400'}`}>
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
        <Numero className="text-xs text-gris-500">{elDiaCorto(partido.fechaAcordada)}</Numero>
      </div>
    );
  }
  return (
    <div className={celda}>
      <span aria-label="sin coordinar" className="h-[26px] w-12 rounded-md border border-dashed border-gris-300" />
    </div>
  );
}

function Tabla({ zona }: { zona: ZonaDelTablero }) {
  // Una columna por rival: el ancho depende de cuántos son, así que va en una variable.
  const columnas = { '--columnas': `200px repeat(${zona.filas.length}, minmax(0, 1fr)) 48px 58px 74px` } as CSSProperties;
  const grilla = 'grid grid-cols-[minmax(0,1fr)_40px_52px_64px] md:grid-cols-[var(--columnas)]';

  return (
    <Tarjeta className="overflow-hidden">
      <div className={`${grilla} border-b border-linea bg-fondo-tabla`} style={columnas}>
        <span className="px-4 py-2.5 text-xs text-gris-500">jugador</span>
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
              <Numero className={`text-xs ${clasifica ? 'text-gris-500' : 'text-gris-400'}`}>{fila.posicion}</Numero>
              <span className={`size-1.5 shrink-0 rounded-full ${clasifica ? 'bg-lima' : 'bg-linea'}`} />
              <span className={`truncate text-[15px] ${clasifica ? 'font-semibold' : 'font-medium text-gris-700'}`}>{fila.apellido}</span>
            </div>
            {zona.filas.map((rival) => (
              <Cruce key={rival.jugadorId} zona={zona} fila={fila} rival={rival} />
            ))}
            <Numero className={`text-center text-[15px] font-semibold ${clasifica ? '' : 'text-gris-700'}`}>{fila.partidosGanados}</Numero>
            <Numero className={`text-center text-[13px] ${clasifica ? 'text-gris-500' : 'text-gris-400'}`}>
              {fila.setsGanados}-{fila.setsPerdidos}
            </Numero>
            <Numero className={`pr-2.5 text-right text-[13px] ${clasifica ? 'text-gris-500' : 'text-gris-400'}`}>
              {fila.gamesGanados}-{fila.gamesPerdidos}
            </Numero>
          </div>
        );
      })}

      <div className="flex items-start gap-2.5 bg-fondo-tabla px-5 py-[13px]">
        <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-lima" />
        <p className="text-[13px] text-gris-500">{comoVieneLaZona(zona.filas)}</p>
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
              <button
                key={grupo}
                type="button"
                aria-pressed={activa}
                aria-label={conVencidos ? `Zona ${grupo}, con partidos vencidos` : `Zona ${grupo}`}
                onClick={() => setElegida(grupo)}
                className={`inline-flex h-[34px] items-center gap-[7px] rounded-[9px] px-[15px] text-sm ${
                  activa
                    ? 'bg-negro font-semibold text-white'
                    : conVencidos
                      ? 'border border-rojo-linea font-medium text-rojo-texto'
                      : 'border border-linea font-medium text-gris-700 hover:bg-fondo'
                }`}
              >
                {grupo}
                {conVencidos && <span className="size-[5px] rounded-full bg-rojo" />}
              </button>
            );
          })}
        </div>
      </div>
      <Tabla zona={zona} />
    </section>
  );
}
