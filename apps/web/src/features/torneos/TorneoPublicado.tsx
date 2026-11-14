import type { Convocatoria } from '@setpoint/shared';
import { useNavigate } from 'react-router-dom';
import { Boton } from '../../components/Boton';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import { BotonCopiarLink } from '../inicio/BotonCopiarLink';

// Después de publicar, el paso que sigue: pasar el link de cada categoría por el grupo. Es el mismo
// link que copia la tarjeta del torneo en el inicio.
export function TorneoPublicado({ slug, convocatoria }: { slug: string; convocatoria: Convocatoria }) {
  const navegar = useNavigate();
  const varias = convocatoria.torneos.length > 1;

  return (
    <main className="flex max-w-[720px] flex-col gap-5 px-7 pt-[26px] pb-7">
      <div className="flex flex-col gap-[7px]">
        <h1 className="text-[30px] font-semibold tracking-[-0.035em]">Publicaste {convocatoria.nombre}</h1>
        <p className="text-[15px] text-gris-500">
          La inscripción ya está abierta. Pasá {varias ? 'el link de cada categoría' : 'el link'} por el grupo: se anotan y pagan
          desde ahí.
        </p>
      </div>

      <Tarjeta className="flex flex-col overflow-hidden">
        {convocatoria.torneos.map((torneo) => (
          <div
            key={torneo.id}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-b border-linea-suave px-5 py-4 last:border-b-0"
          >
            <div className="flex min-w-0 flex-col gap-1">
              {varias && <span className="text-[15px] font-semibold">{torneo.categoria}</span>}
              <Numero className="text-[13px] break-all text-gris-500">
                {window.location.host}/c/{slug}/torneos/{torneo.id}
              </Numero>
            </div>
            <BotonCopiarLink ruta={`/torneos/${torneo.id}`} variante="organizador" className="shrink-0 font-semibold" />
          </div>
        ))}
      </Tarjeta>

      <Boton className="self-start" onClick={() => navegar('/inicio')}>
        Ir al inicio
      </Boton>
    </main>
  );
}
