import { Link } from 'react-router-dom';
import { Numero } from '../../components/Numero';
import type { Aviso } from './torneosEjemplo';

// Lo que pide atención. El rojo solo significa vencimiento: el recuadro va en rojo si algún aviso
// lo es, y si solo hay vinculaciones para revisar queda neutro (decisión 084).
// Las acciones de los avisos en rojo se conectan cuando se calculen.
export function AvisosAtencion({ avisos }: { avisos: Aviso[] }) {
  const urgente = avisos.some((aviso) => aviso.tipo !== 'vinculacion');

  return (
    <section
      className={`flex flex-col gap-3 rounded-tarjeta border p-[18px] ${urgente ? 'border-rojo-linea bg-rojo-fondo' : 'border-linea bg-white'}`}
    >
      <h2 className="text-[15px] font-semibold">Necesita tu atención</h2>
      <ul className="flex flex-col gap-2.5">
        {avisos.map((aviso, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className={`mt-[7px] size-[7px] shrink-0 rounded-full ${aviso.tipo === 'vinculacion' ? 'bg-negro' : 'bg-rojo'}`} />
            {aviso.tipo === 'partidos-vencidos' ? (
              <p className="text-sm leading-[1.45]">
                <Numero>{aviso.partidos}</Numero> partidos de {aviso.categoria} vencieron sin resultado.{' '}
                <button type="button" className="font-medium underline hover:text-gris-500">
                  Resolver
                </button>
              </p>
            ) : aviso.tipo === 'pocos-inscriptos' ? (
              <p className="text-sm leading-[1.45]">
                {aviso.torneo} tiene <Numero>{aviso.pagaron}</Numero> de <Numero>{aviso.cupo}</Numero> inscriptos y cierra en{' '}
                {aviso.cierraEn}.{' '}
                <button type="button" className="font-medium underline hover:text-gris-500">
                  Copiar link
                </button>
              </p>
            ) : (
              <p className="text-sm leading-[1.45]">
                {aviso.motivo === 'homonimo'
                  ? `La vinculación de ${aviso.nombre} quedó para revisar: hay otro ${aviso.nombre}${aviso.categoria ? ` en ${aviso.categoria}` : ''}.`
                  : `Otra cuenta dice que el perfil de ${aviso.nombre} es suyo.`}{' '}
                <Link to={`/padron/revisar/${aviso.jugadorId}`} className="font-medium underline hover:text-gris-500">
                  Revisar
                </Link>
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
