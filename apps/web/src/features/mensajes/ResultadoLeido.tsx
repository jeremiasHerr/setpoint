import type { DatosResultado, PartidoDeLaLista, ResultadoLeido as Leido } from '@setpoint/shared';
import { Link } from 'react-router-dom';
import { MensajeError } from '../../components/Aviso';
import { Boton } from '../../components/Boton';
import { Numero } from '../../components/Numero';
import { nombreDelCuadro } from '../cuadros/cuadro';
import { nombresDelPartido } from '../resultados/resultado';

type Props = {
  torneoId: number;
  consuelo: string;
  leido: Leido;
  // Solo en los que esperan a la organización.
  decidiendo?: boolean;
  error?: string;
  alDecidir?: (accion: 'cargar' | 'descartar') => void;
};

const ESTADO: Record<Leido['estado'], string> = {
  a_revisar: 'Para revisar',
  cargado: 'Cargado',
  ya_estaba: 'Ya estaba cargado',
  descartado: 'Descartado',
};

// "Zona A", o "Campeonato · ronda 2".
const donde = (p: PartidoDeLaLista, consuelo: string) =>
  p.fase === 'grupos' ? `Zona ${p.grupo}` : `${nombreDelCuadro(p.cuadro!, consuelo)} · ronda ${p.ronda}`;

// Lo que se carga, con los nombres en el orden del partido: "Antileo 4-6 3-6 Sanhueza".
function Marcador({ partido, resultado }: { partido: PartidoDeLaLista; resultado: DatosResultado }) {
  const [a, b] = nombresDelPartido(partido);
  if (resultado.tipo !== 'jugado') {
    const ganador = resultado.ganadorId === partido.jugadorA?.jugadorId ? a : b;
    return <span>{resultado.tipo === 'walkover' ? `W.O. para ${ganador}` : `Abandono: sigue ${ganador}`}</span>;
  }
  return (
    <span>
      {a} <Numero className="font-medium">{resultado.sets.map((s) => `${s.gamesA}-${s.gamesB}`).join(' ')}</Numero> {b}
    </span>
  );
}

// Un resultado leído de los mensajes: la línea del chat tal como llegó y, al lado, lo que se entendió
// de ella. Así se ve de un vistazo qué leyó la IA (decisión 119).
export function ResultadoLeido({ torneoId, consuelo, leido, decidiendo = false, error, alDecidir }: Props) {
  const aRevisar = leido.estado === 'a_revisar';
  return (
    <li className="grid gap-x-6 gap-y-3 border-b border-linea-suave px-4 py-4 last:border-b-0 sm:px-[18px] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <figure className="flex min-w-0 flex-col gap-1 border-l-2 border-linea pl-3">
        <figcaption className="font-mono text-xs text-pizarra-500">
          {[leido.hora, leido.remitente ?? 'sin remitente'].filter(Boolean).join(' · ')}
        </figcaption>
        <blockquote className="font-mono text-sm break-words whitespace-pre-line text-pizarra-700">{leido.texto}</blockquote>
      </figure>

      <div className="flex min-w-0 flex-col gap-2">
        {leido.partido && leido.resultado ? (
          <p className="text-[15px] font-semibold">
            <Marcador partido={leido.partido} resultado={leido.resultado} />
          </p>
        ) : (
          <p className="text-[15px] font-semibold text-pizarra-500">Sin resultado para cargar</p>
        )}
        {leido.partido && <p className="font-mono text-xs text-pizarra-500">{donde(leido.partido, consuelo).toLowerCase()}</p>}

        {aRevisar ? (
          <>
            <p className="text-[13px] font-medium text-noche">{leido.motivo}</p>
            <div className="flex flex-wrap gap-2">
              {leido.partido && leido.resultado && (
                <Boton variante="organizador" disabled={decidiendo} onClick={() => alDecidir?.('cargar')}>
                  Cargar así
                </Boton>
              )}
              {leido.partido && (
                <Link
                  to={`/torneos/${torneoId}/resultados/${leido.partido.id}`}
                  className="inline-flex h-10 items-center rounded-control border border-linea bg-papel px-4 text-[15px] font-medium hover:bg-niebla"
                >
                  Abrir en Cargar resultado
                </Link>
              )}
              <Boton disabled={decidiendo} onClick={() => alDecidir?.('descartar')}>
                Descartar
              </Boton>
            </div>
            <MensajeError>{error}</MensajeError>
          </>
        ) : (
          <p className="text-sm text-pizarra-500">
            {leido.estado === 'cargado' && leido.cargadoAMano ? 'Lo cargaste vos' : ESTADO[leido.estado]}
          </p>
        )}
      </div>
    </li>
  );
}
