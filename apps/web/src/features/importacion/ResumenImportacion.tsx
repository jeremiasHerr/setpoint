import type { ConteosImportacion } from '@setpoint/shared';
import { Numero } from '../../components/Numero';

type Props = {
  conteos: ConteosImportacion;
  categoria: string | null;
  casilleros: string[];
  jugadores: number;
};

// Qué va a pasar, en números, antes de tocar nada.
export function ResumenImportacion({ conteos, categoria, casilleros, jugadores }: Props) {
  const paraRevisar = conteos.dudosos + conteos.conProblemas;
  const motivoRevision =
    conteos.conProblemas > 0
      ? 'hay números que no coinciden con la planilla'
      : 'hay nombres que no son exactos';

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <TarjetaConteo numero={conteos.existentes} titulo="ya están en el padrón" detalle="se les cargan los puntos" />
        <TarjetaConteo numero={conteos.nuevos} titulo="son nuevos" detalle={`se dan de alta en ${categoria ?? 'la categoría'}`} />
        {paraRevisar > 0 ? (
          <div className="flex items-baseline gap-3 rounded-tarjeta border border-rojo-linea bg-rojo-fondo px-[18px] py-4">
            <Numero className="text-[30px] font-medium tracking-[-0.03em] text-rojo-texto">{paraRevisar}</Numero>
            <div className="flex flex-col gap-0.5">
              <span className="text-[15px] font-semibold text-rojo-texto">
                {paraRevisar === 1 ? 'necesita que decidas' : 'necesitan que decidas'}
              </span>
              <span className="text-[13px] text-rojo-texto">{motivoRevision}</span>
            </div>
          </div>
        ) : (
          <TarjetaConteo numero={0} titulo="para revisar" detalle="todo coincide con la planilla" />
        )}
      </div>

      <div className="flex flex-col gap-[9px] rounded-tarjeta border border-linea px-[18px] py-4">
        <h2 className="text-[15px] font-semibold">Los casilleros quedaron así</h2>
        <div className="flex flex-wrap items-center gap-2">
          {casilleros.map((c) => (
            <span key={c} className="flex h-8 items-center rounded-lg bg-fondo px-[11px] font-mono text-xs text-gris-700">
              {c}
            </span>
          ))}
        </div>
        <p className="text-[13px] text-gris-500">
          Se leyeron <Numero>{jugadores}</Numero> jugadores. Las filas de títulos, encabezados, totales y notas se
          descartaron.
        </p>
      </div>
    </div>
  );
}

function TarjetaConteo({ numero, titulo, detalle }: { numero: number; titulo: string; detalle: string }) {
  return (
    <div className="flex items-baseline gap-3 rounded-tarjeta border border-linea px-[18px] py-4">
      <Numero className="text-[30px] font-medium tracking-[-0.03em]">{numero}</Numero>
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-semibold">{titulo}</span>
        <span className="text-[13px] text-gris-500">{detalle}</span>
      </div>
    </div>
  );
}
