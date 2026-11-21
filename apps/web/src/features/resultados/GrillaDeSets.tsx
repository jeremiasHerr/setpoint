import type { SistemaDeJuego } from '@setpoint/shared';
import { Fragment, type CSSProperties, type InputHTMLAttributes } from 'react';
import { MensajeError } from '../../components/Aviso';
import { columnasDeLaGrilla, llevaTieBreak, type Problemas, type SetEscrito } from './resultado';

type Props = {
  sistema: SistemaDeJuego;
  nombres: [string, string];
  sets: SetEscrito[];
  problemas: Problemas;
  ganador: 'A' | 'B' | null;
  alCambiar: (columna: number, campo: keyof SetEscrito, valor: string) => void;
  // En un W.O. o un abandono no se cargan sets: los casilleros quedan vacíos y no se pueden editar
  // (decisiones 016 y 059).
  bloqueada?: boolean;
};

const VACIO: SetEscrito = { gamesA: '', gamesB: '', tieBreakA: '', tieBreakB: '' };

// Solo dígitos, como mucho dos: un super tie-break puede pasar de 10.
const soloDigitos = (valor: string) => valor.replace(/\D/g, '').slice(0, 2);

function CampoNumerico({ alCambiar, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { alCambiar: (valor: string) => void }) {
  return (
    <input
      inputMode="numeric"
      autoComplete="off"
      maxLength={2}
      onChange={(e) => alCambiar(soloDigitos(e.target.value))}
      className={`min-w-0 border border-borde-campo bg-papel text-center font-mono font-medium tabular-nums outline-none focus:border-2 focus:border-noche disabled:cursor-not-allowed disabled:border-linea disabled:bg-niebla ${className}`}
      {...props}
    />
  );
}

// Una fila por jugador y una columna por set, según el sistema de juego del torneo. En un set
// que queda 7-6 aparecen abajo los puntos del tie-break, que son opcionales (decisión 030).
export function GrillaDeSets({ sistema, nombres, sets: escritos, problemas, ganador, alCambiar, bloqueada = false }: Props) {
  const columnas = columnasDeLaGrilla(sistema);
  const sets = bloqueada ? columnas.map(() => VACIO) : escritos;
  const conTieBreak = columnas.map((columna, i) => llevaTieBreak(sets[i], columna, sistema));
  const filaDeMensajes = conTieBreak.some(Boolean) ? 5 : 4;
  // En el celular el nombre se lleva lo que sobra y no hay columna final para los mensajes, que igual
  // van de su columna al final. Los casilleros son angostos para que entre el apellido: siguen
  // teniendo 56 de alto. En escritorio, la última columna flexible les deja lugar a los mensajes.
  const escritorio = ['minmax(0,200px)', ...columnas.map((c) => (c.esSuperTieBreak ? '118px' : '84px')), 'minmax(0,1fr)'].join(' ');
  const celular = ['minmax(0,1fr)', ...columnas.map((c) => (c.esSuperTieBreak ? '64px' : '52px'))].join(' ');

  // Cada mensaje va debajo de su set, en una fila propia: desde esa columna hasta el final.
  const mensajes = columnas.flatMap((_, i) =>
    [
      { id: `problema-set-${i}`, texto: problemas.sets[i] },
      { id: `problema-tie-break-${i}`, texto: problemas.tieBreaks[i] },
    ].flatMap(({ id, texto }) => (texto ? [{ id, texto, columna: i }] : [])),
  );
  const describe = (id: string) => (mensajes.some((m) => m.id === id) ? id : undefined);

  return (
    <div
      className="grid items-center gap-x-1.5 gap-y-2.5 grid-cols-(--celular) sm:gap-x-3.5 sm:grid-cols-(--escritorio)"
      style={{ '--celular': celular, '--escritorio': escritorio } as CSSProperties}
    >
      {nombres.map((nombre, j) => {
        const lado = j === 0 ? 'A' : 'B';
        const perdio = ganador !== null && ganador !== lado;
        return (
          <div key={lado} className="flex min-w-0 items-center gap-2.5" style={{ gridColumn: 1, gridRow: j + 2 }}>
            <span className={`size-[7px] shrink-0 rounded-full ${ganador === lado ? 'bg-lona-texto' : 'bg-linea'}`} />
            <span className={`truncate text-[15px] sm:text-lg ${perdio ? 'font-medium text-pizarra-700' : 'font-semibold'}`}>{nombre}</span>
          </div>
        );
      })}

      {conTieBreak.some(Boolean) && (
        <p className="text-[13px] text-pizarra-500" style={{ gridColumn: 1, gridRow: 4 }}>
          tie-break · opcional
        </p>
      )}

      {/* Cada set es una columna, y en el orden del documento van juntos los dos jugadores:
          así Tab recorre el marcador como se lee, 6-4 3-6 10-8. */}
      {columnas.map((columna, i) => {
        const set = sets[i];
        const campo = (gridRow: number) => ({ gridColumn: i + 2, gridRow });
        return (
          <Fragment key={i}>
            <span className="text-center text-[12.5px] font-medium leading-[13px] text-noche" style={campo(1)}>
              {columna.rotulo}
            </span>
            {(['gamesA', 'gamesB'] as const).map((games, j) => (
              <CampoNumerico
                key={games}
                aria-label={`${columna.rotulo}, ${nombres[j]}`}
                aria-invalid={problemas.sets[i] !== null}
                aria-describedby={describe(`problema-set-${i}`)}
                value={set[games]}
                disabled={bloqueada}
                alCambiar={(valor) => alCambiar(i, games, valor)}
                className="h-14 w-full rounded-control text-[19px] sm:text-[22px]"
                style={campo(j + 2)}
              />
            ))}
            {conTieBreak[i] && (
              <div className="flex items-center justify-between" style={campo(4)}>
                {(['tieBreakA', 'tieBreakB'] as const).map((puntos, j) => (
                  <Fragment key={puntos}>
                    {j === 1 && <span className="text-xs text-pizarra-400 sm:text-base">-</span>}
                    <CampoNumerico
                      aria-label={`Tie-break del ${columna.rotulo}, ${nombres[j]}`}
                      aria-invalid={problemas.tieBreaks[i] !== null}
                      aria-describedby={describe(`problema-tie-break-${i}`)}
                      value={set[puntos]}
                      alCambiar={(valor) => alCambiar(i, puntos, valor)}
                      className="h-10 w-6 rounded-lg text-[13px] sm:w-[37px] sm:text-[15px]"
                    />
                  </Fragment>
                ))}
              </div>
            )}
          </Fragment>
        );
      })}

      {mensajes.map(({ id, texto, columna }, k) => (
        <div key={id} style={{ gridColumn: `${columna + 2} / -1`, gridRow: filaDeMensajes + k }}>
          <MensajeError id={id}>{texto}</MensajeError>
        </div>
      ))}

      {problemas.partido && (
        <div style={{ gridColumn: '1 / -1', gridRow: filaDeMensajes + mensajes.length }}>
          <MensajeError id="problema-partido">{problemas.partido}</MensajeError>
        </div>
      )}
    </div>
  );
}
