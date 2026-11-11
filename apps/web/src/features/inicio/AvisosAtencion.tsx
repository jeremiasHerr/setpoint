import { Link } from 'react-router-dom';
import { Numero } from '../../components/Numero';
import type { Aviso } from './tiposDeInicio';

// Lo único urgente de la pantalla: por eso va en rojo, que en el sistema solo significa vencimiento.
// Los vencidos se resuelven en el tablero, con el W.O. (decisión 062).
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
                <Numero>{aviso.partidos}</Numero> {aviso.partidos === 1 ? 'partido' : 'partidos'} de {aviso.categoria}{' '}
                {aviso.partidos === 1 ? 'venció' : 'vencieron'} sin resultado.{' '}
                <Link to={`/torneos/${aviso.torneoId}/tablero`} className="font-medium underline hover:text-gris-500">
                  Resolver
                </Link>
              </p>
            ) : (
              // Todavía no se calcula: «Copiar link» se conecta cuando se calcule.
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
