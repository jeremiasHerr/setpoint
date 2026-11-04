import type { PartidoEnVivo, TorneoEnVivo } from '@setpoint/shared';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { dondeSeJuega, hoy, laHora, marcador, porDia, tieneResultado, type DiaDelCalendario } from './enVivo';

// Un partido del calendario: la hora, quiénes juegan, dónde y en qué instancia. Si ya se jugó,
// el resultado; si la fecha la anotó un jugador y el rival no la confirmó, se dice.
function Fila({ partido, torneo }: { partido: PartidoEnVivo; torneo: TorneoEnVivo }) {
  const jugado = tieneResultado(partido);
  const nombre = (j: PartidoEnVivo['jugadorA']) => j?.apellido ?? 'a definir';
  const estilo = (j: PartidoEnVivo['jugadorA']) =>
    jugado && j !== null && partido.ganadorId === j.jugadorId ? 'font-semibold' : jugado ? 'text-gris-500' : '';
  const detalle = [dondeSeJuega(partido, torneo), partido.sede].filter(Boolean).join(' · ');

  return (
    <li className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 border-b border-linea-suave px-4 py-3 last:border-b-0">
      <Numero className={`text-[15px] ${jugado ? 'text-gris-400' : 'font-semibold'}`}>{laHora(partido.fechaAcordada!)}</Numero>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[15px]">
          <span className={estilo(partido.jugadorA)}>{nombre(partido.jugadorA)}</span>
          <span className="text-gris-400"> · </span>
          <span className={estilo(partido.jugadorB)}>{nombre(partido.jugadorB)}</span>
        </span>
        <span className="truncate text-[13px] text-gris-500">{detalle}</span>
      </div>
      {jugado ? (
        <Numero className="text-[13px] font-semibold">{marcador(partido)}</Numero>
      ) : partido.estado === 'anotada' ? (
        <span className="text-xs text-gris-500">a confirmar</span>
      ) : (
        <span />
      )}
    </li>
  );
}

function Dias({ lista, torneo }: { lista: DiaDelCalendario[]; torneo: TorneoEnVivo }) {
  return (
    <div className="flex flex-col gap-4">
      {lista.map(({ dia, titulo, partidos }) => (
        <Tarjeta key={dia} className="overflow-hidden">
          <h3 className="border-b border-linea bg-fondo-tabla px-4 py-2.5 text-sm font-semibold first-letter:uppercase">{titulo}</h3>
          <ul>
            {partidos.map((partido) => (
              <Fila key={partido.id} partido={partido} torneo={torneo} />
            ))}
          </ul>
        </Tarjeta>
      ))}
    </div>
  );
}

// Los partidos con fecha, día por día (F10). Arranca por hoy: los días que ya pasaron quedan
// abajo, para que lo primero que se vea sea lo que se juega.
export function CalendarioEnVivo({ torneo }: { torneo: TorneoEnVivo }) {
  const dias = porDia(torneo.calendario);
  const deHoy = hoy();
  const proximos = dias.filter((d) => d.dia >= deHoy);
  const pasados = dias.filter((d) => d.dia < deHoy).reverse();

  const sinFecha =
    torneo.sinFecha === 0
      ? null
      : torneo.sinFecha === 1
        ? 'Un partido todavía no tiene fecha: aparece acá cuando los jugadores la anotan.'
        : `${torneo.sinFecha} partidos todavía no tienen fecha: aparecen acá cuando los jugadores la anotan.`;

  if (dias.length === 0) {
    return <p className="text-[15px] text-gris-500">Todavía no hay partidos con fecha. {sinFecha}</p>;
  }

  return (
    <section className="flex max-w-[640px] flex-col gap-5">
      {sinFecha && <p className="text-[15px] text-gris-500">{sinFecha}</p>}
      {proximos.length > 0 ? (
        <Dias lista={proximos} torneo={torneo} />
      ) : (
        <p className="text-[15px] text-gris-500">No hay partidos con fecha para los próximos días.</p>
      )}
      {pasados.length > 0 && (
        <>
          <h2 className="pt-2 text-xl font-semibold tracking-[-0.02em]">Días anteriores</h2>
          <Dias lista={pasados} torneo={torneo} />
        </>
      )}
    </section>
  );
}
