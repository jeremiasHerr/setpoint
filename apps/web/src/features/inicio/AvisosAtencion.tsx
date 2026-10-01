import { Numero } from '../../components/Numero';
import type { Aviso } from './torneosEjemplo';

// Lo único urgente de la pantalla: por eso va en rojo, que en el sistema solo significa vencimiento.
// Las acciones se conectan cuando existan el tablero y las inscripciones.
export function AvisosAtencion({ avisos }: { avisos: Aviso[] }) {
  return (
    <section className="flex flex-col gap-3 rounded-tarjeta border border-rojo-linea bg-rojo-fondo p-[18px]">
      <h2 className="text-[15px] font-semibold">Necesita tu atención</h2>
      <ul className="flex flex-col gap-2.5">
        {avisos.map((aviso, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-[7px] size-[7px] shrink-0 rounded-full bg-rojo" />
            {aviso.tipo === 'partidos-vencidos' ? (
              <p className="text-sm leading-[1.45]">
                <Numero>{aviso.partidos}</Numero> partidos de {aviso.categoria} vencieron sin resultado.{' '}
                <button type="button" className="font-medium underline hover:text-gris-500">
                  Resolver
                </button>
              </p>
            ) : (
              <p className="text-sm leading-[1.45]">
                {aviso.torneo} tiene <Numero>{aviso.pagaron}</Numero> de <Numero>{aviso.cupo}</Numero> inscriptos y cierra en{' '}
                {aviso.cierraEn}.{' '}
                <button type="button" className="font-medium underline hover:text-gris-500">
                  Copiar link
                </button>
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
