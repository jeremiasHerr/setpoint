import { Numero } from '../../components/Numero';

// Por excepción (decisión 118): los que se importan solos, existentes o nuevos, y los que van a revisión.
type Props = {
  conteos: { existentes: number; nuevos: number; aRevisar: number };
  categoria: string | null;
  casilleros: string[];
  jugadores: number;
};

// Qué va a pasar, en números, antes de tocar nada.
export function ResumenImportacion({ conteos, categoria, casilleros, jugadores }: Props) {
  const paraRevisar = conteos.aRevisar;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <TarjetaConteo numero={conteos.existentes} titulo="ya están en el padrón" detalle="se les cargan los puntos solos" />
        <TarjetaConteo numero={conteos.nuevos} titulo="son nuevos" detalle={`se dan de alta solos en ${categoria ?? 'la categoría'}`} />
        {paraRevisar > 0 ? (
          // Lo que hay que decidir no venció nada: borde noche, no rojo (design.md §3, decisión 099).
          <div className="flex items-baseline gap-3 rounded-tarjeta border-[1.5px] border-noche bg-papel px-[18px] py-4">
            <Numero className="text-[30px] font-medium tracking-[-0.03em]">{paraRevisar}</Numero>
            <div className="flex flex-col gap-0.5">
              <span className="text-[15px] font-semibold">
                {paraRevisar === 1 ? 'lo revisás después' : 'los revisás después'}
              </span>
              <span className="text-[13px] text-pizarra-700">no pudimos confirmarlos solos</span>
            </div>
          </div>
        ) : (
          <TarjetaConteo numero={0} titulo="para revisar" detalle="todo coincide con la planilla" />
        )}
      </div>

      <div className="flex flex-col gap-[9px] rounded-tarjeta border border-linea bg-papel px-[18px] py-4">
        <h2 className="text-[15px] font-semibold">Los casilleros quedaron así</h2>
        <div className="flex flex-wrap items-center gap-2">
          {casilleros.map((c) => (
            <span key={c} className="flex h-8 items-center rounded-lg bg-niebla px-[11px] text-[12.5px] font-medium text-noche">
              {c}
            </span>
          ))}
        </div>
        <p className="text-[13px] text-pizarra-500">
          Se leyeron <Numero>{jugadores}</Numero> jugadores. Las filas de títulos, encabezados, totales y notas se
          descartaron.
        </p>
      </div>
    </div>
  );
}

function TarjetaConteo({ numero, titulo, detalle }: { numero: number; titulo: string; detalle: string }) {
  return (
    <div className="flex items-baseline gap-3 rounded-tarjeta border border-linea bg-papel px-[18px] py-4">
      <Numero className="text-[30px] font-medium tracking-[-0.03em]">{numero}</Numero>
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-semibold">{titulo}</span>
        <span className="text-[13px] text-pizarra-500">{detalle}</span>
      </div>
    </div>
  );
}
