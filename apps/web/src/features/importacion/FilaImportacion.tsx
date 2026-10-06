import type { AccionImportacion, DecisionImportacion, FilaPropuesta, JugadorPadron } from '@setpoint/shared';
import { Numero } from '../../components/Numero';
import { Selector } from '../../components/Selector';
import { casillerosComoTexto } from './decisiones';

// Mismas columnas que el encabezado de la tabla en ImportarPadronPage.
export const COLUMNAS = 'grid grid-cols-[200px_220px_minmax(0,1fr)_170px] items-center gap-x-4';

type Props = {
  fila: FilaPropuesta;
  decision: DecisionImportacion;
  problemas?: string[];
  padron: JugadorPadron[];
  expandida: boolean;
  alCambiar: (decision: DecisionImportacion) => void;
  alExpandir: () => void;
};

const QUE_PASA: Record<AccionImportacion, string> = {
  vincular: 'Cargar puntos',
  crear: 'Dar de alta',
  excluir: 'No se importa',
};

function nombreDe(j: { nombre: string; apellido: string }) {
  return `${j.nombre} ${j.apellido}`;
}

export function FilaImportacion({ fila, decision, problemas, padron, expandida, alCambiar, alExpandir }: Props) {
  const vinculado = decision.accion === 'vincular' ? padron.find((j) => j.id === decision.jugadorId) : undefined;
  const sugerido = fila.coincideCon !== null ? padron.find((j) => j.id === fila.coincideCon) : undefined;
  const marcada = problemas !== undefined || (fila.coincideCon !== null && fila.confianza !== 'alta');

  const resumen = (
    <div className={COLUMNAS}>
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-mono text-sm text-gris-700">{fila.enLaPlanilla || nombreDe(fila)}</span>
        <span className="font-mono text-xs text-gris-500">fila {fila.fila}</span>
      </div>
      <JugadorDestino decision={decision} fila={fila} vinculado={vinculado} marcada={marcada} />
      <Numero className="text-[13px] text-gris-500">{casillerosComoTexto(fila)}</Numero>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={alExpandir}
          aria-expanded={expandida}
          className={`text-sm hover:underline ${
            marcada ? 'text-rojo-texto' : decision.accion === 'crear' ? 'font-medium' : 'text-gris-500'
          }`}
        >
          {marcada && expandida ? 'Elegí qué hacer' : QUE_PASA[decision.accion]}
        </button>
      </div>
    </div>
  );

  if (!expandida) {
    return <li className="flex min-h-14 flex-col justify-center border-b border-linea-suave px-[18px] py-2.5">{resumen}</li>;
  }

  const otros = padron.filter((j) => j.activo && j.id !== fila.coincideCon);
  const otroElegido = decision.accion === 'vincular' && decision.jugadorId !== fila.coincideCon ? decision.jugadorId : undefined;

  return (
    <li
      className={`flex flex-col gap-[13px] border-b border-linea-suave px-[18px] py-4 ${marcada ? 'bg-rojo-fondo' : 'bg-fondo-tabla'}`}
    >
      {resumen}

      {problemas && (
        <ul className="flex flex-col gap-1">
          {problemas.map((p) => (
            <li key={p} className="text-[13px] text-rojo-texto">
              {p}
            </li>
          ))}
        </ul>
      )}
      {!problemas && sugerido && fila.confianza !== 'alta' && (
        <p className="text-[13px] text-rojo-texto">
          En la planilla dice “{fila.enLaPlanilla}”. Puede ser {nombreDe(sugerido)}, pero el nombre no es exacto.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {sugerido && (
          <Opcion
            elegida={decision.accion === 'vincular' && decision.jugadorId === sugerido.id}
            onClick={() => alCambiar({ fila: fila.fila, accion: 'vincular', jugadorId: sugerido.id })}
            titulo={nombreDe(sugerido)}
            detalle={descripcion(sugerido)}
          />
        )}
        <Opcion
          elegida={decision.accion === 'crear'}
          onClick={() => alCambiar({ fila: fila.fila, accion: 'crear' })}
          titulo={sugerido ? 'Es otro, darlo de alta' : 'Darlo de alta'}
          detalle={`como ${nombreDe(fila)}`}
        />
        <Opcion
          elegida={decision.accion === 'excluir'}
          onClick={() => alCambiar({ fila: fila.fila, accion: 'excluir' })}
          titulo="No importarlo"
          detalle="la fila queda afuera"
        />
      </div>

      {otros.length > 0 && (
        <Selector
          id={`importacion-otro-${fila.fila}`}
          rotulo="O vinculalo con otro jugador del padrón"
          className="max-w-[360px]"
          value={otroElegido ?? ''}
          onChange={(e) => {
            const jugadorId = Number(e.target.value);
            if (jugadorId) alCambiar({ fila: fila.fila, accion: 'vincular', jugadorId });
          }}
        >
          <option value="">Elegí un jugador</option>
          {otros.map((j) => (
            <option key={j.id} value={j.id}>
              {j.apellido}, {j.nombre}
              {j.categoria ? ` · ${j.categoria}` : ''}
            </option>
          ))}
        </Selector>
      )}
    </li>
  );
}

function JugadorDestino({
  decision,
  fila,
  vinculado,
  marcada,
}: {
  decision: DecisionImportacion;
  fila: FilaPropuesta;
  vinculado?: JugadorPadron;
  marcada: boolean;
}) {
  if (decision.accion === 'excluir') return <span className="text-[15px] text-gris-400">—</span>;
  if (decision.accion === 'crear') {
    return (
      <div className="flex min-w-0 items-center gap-[9px]">
        <span className="size-[7px] shrink-0 rounded-full bg-lima" aria-hidden="true" />
        <span className="truncate text-[15px] font-medium">{nombreDe(fila)}</span>
      </div>
    );
  }
  return (
    <span className={`truncate text-[15px] ${marcada ? 'font-semibold text-rojo-texto' : 'font-medium'}`}>
      {vinculado ? nombreDe(vinculado) : 'Jugador del padrón'}
    </span>
  );
}

// "Tercera · 24 partidos · desde 2023", para distinguir a dos jugadores parecidos.
function descripcion(j: JugadorPadron) {
  return [j.categoria ?? 'sin categoría', `${j.partidos} partidos`, `desde ${new Date(j.creadoEn).getFullYear()}`].join(' · ');
}

type PropsOpcion = { elegida: boolean; onClick: () => void; titulo: string; detalle: string };

function Opcion({ elegida, onClick, titulo, detalle }: PropsOpcion) {
  return (
    <button
      type="button"
      aria-pressed={elegida}
      onClick={onClick}
      className={`flex min-w-[220px] flex-1 items-center justify-between gap-3 rounded-xl bg-white px-[15px] py-[13px] text-left ${
        elegida ? 'border-2 border-negro' : 'border border-linea hover:bg-fondo'
      }`}
    >
      <span className="flex flex-col gap-[3px]">
        <span className={`text-[15px] ${elegida ? 'font-semibold' : 'font-medium'}`}>{titulo}</span>
        <span className="font-mono text-xs text-gris-500">{detalle}</span>
      </span>
      {elegida ? (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-negro">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-3 text-lima" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
      ) : (
        <span className="size-5 shrink-0 rounded-full border border-gris-300" aria-hidden="true" />
      )}
    </button>
  );
}
