import { superficies, type PartidoDelCaraACara, type Superficie } from '@setpoint/shared';
import { Numero } from '../../components/Numero';
import { donde } from './PartidosDeLaFicha';

// "polvo", "cemento": la etiqueta que va dentro de una frase (decisión 126).
export const cortaDe = (superficie: Superficie) => superficies.find((s) => s.clave === superficie)!.corta;

const TEXTO_DEL_ESTADO = { jugada: '', walkover: ' por W.O.', abandono: ' por abandono' } as const;

type Props = { partidos: PartidoDelCaraACara[]; apellidoA: string; apellidoB: string; consuelo: string };

// Cada enfrentamiento, del más reciente al más viejo: quién ganó, en qué torneo e instancia, y el
// marcador desde el lado del primer jugador. Las filas que ganó el primero van en negrita y con el
// punto verde, como los partidos de la ficha.
export function PartidosDelCaraACara({ partidos, apellidoA, apellidoB, consuelo }: Props) {
  return (
    <ul className="flex flex-col">
      {partidos.map((partido) => {
        const gana = partido.ganador === 'a';
        return (
          <li
            key={partido.id}
            className="grid min-h-[58px] grid-cols-[14px_minmax(0,1fr)_auto] items-center gap-x-2.5 border-b border-linea-suave py-2 last:border-b-0"
          >
            <span className={`size-[7px] rounded-full ${gana ? 'bg-lona-texto' : 'bg-linea'}`} />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className={`text-base ${gana ? 'font-semibold' : 'text-pizarra-700'}`}>
                Ganó {gana ? apellidoA : apellidoB}
                {TEXTO_DEL_ESTADO[partido.estado]}
              </span>
              <span className="text-xs text-pizarra-500">
                {partido.torneo} · {donde(partido, consuelo)}
                {partido.superficie && ` · ${cortaDe(partido.superficie)}`}
              </span>
            </div>
            <Numero className={`text-right text-sm ${gana ? '' : 'text-pizarra-500'}`}>{partido.marcador}</Numero>
          </li>
        );
      })}
    </ul>
  );
}
