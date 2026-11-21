import { Link } from 'react-router-dom';
import { Numero } from '../../components/Numero';
import { EnlaceParaRevisar } from '../revisiones/piezas';
import { motivoCorto } from '../revisiones/textos';
import { useRevisiones } from '../revisiones/useRevisiones';

// Cuántos casos se ven antes de mandar al padrón, que los junta todos en "Para revisar".
const VISIBLES = 3;

// Las vinculaciones que el sistema no resolvió solo (decisión 051). No venció nada: va sin rojo, con
// la misma marca que el padrón. Si no hay casos, o todavía no cargaron, no se muestra.
export function VinculacionesParaRevisar({ slug }: { slug: string }) {
  const revisiones = useRevisiones(slug);
  const casos = revisiones.data?.casos ?? [];
  if (casos.length === 0) return null;
  const ocultos = casos.length - VISIBLES;

  return (
    <section className="flex flex-col gap-3 rounded-tarjeta border border-linea bg-papel p-[18px]">
      <h2 className="text-[15px] font-semibold">
        Para revisar <Numero className="ml-1 text-[13px] text-pizarra-500">{casos.length}</Numero>
      </h2>
      <ul className="flex flex-col gap-2.5">
        {casos.slice(0, VISIBLES).map((caso) => (
          <li key={caso.jugadorId} className="flex flex-wrap items-center gap-x-[9px] gap-y-1">
            <span className="text-sm font-medium">
              {caso.nombre} {caso.apellido}
            </span>
            <EnlaceParaRevisar jugadorId={caso.jugadorId} />
            <span className="text-[13px] text-pizarra-500">{motivoCorto(caso.motivo, caso.nombre)}</span>
          </li>
        ))}
      </ul>
      {ocultos > 0 && (
        <Link to="/padron" className="text-sm font-medium underline hover:text-pizarra-500">
          Ver los <Numero>{ocultos}</Numero> restantes en el padrón
        </Link>
      )}
    </section>
  );
}
