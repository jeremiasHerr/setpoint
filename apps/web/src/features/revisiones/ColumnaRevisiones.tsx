import type { Revisiones } from '@setpoint/shared';
import { Link } from 'react-router-dom';
import { Numero } from '../../components/Numero';
import { motivoCorto } from './textos';

// La columna derecha: los demás casos y cuántas vinculaciones se guardaron solas. Es el argumento
// de la revisión por excepción (decisión 051).
export function ColumnaRevisiones({ revisiones, actual }: { revisiones: Revisiones; actual: number | null }) {
  return (
    <aside className="flex flex-col gap-4">
      {revisiones.casos.length > 0 && (
        <nav className="overflow-hidden rounded-tarjeta border border-linea">
          <div className="flex items-center justify-between gap-2.5 border-b border-linea px-4 py-3.5">
            <h2 className="text-[15px] font-semibold">Para revisar</h2>
            <Numero className="text-[13px] text-gris-500">{revisiones.casos.length}</Numero>
          </div>
          <ul>
            {revisiones.casos.map((c) => {
              const nombre = `${c.nombre} ${c.apellido}`;
              const esActual = c.jugadorId === actual;
              return (
                <li key={c.jugadorId} className="border-b border-linea-suave last:border-b-0">
                  <Link
                    to={`/padron/revisar/${c.jugadorId}`}
                    aria-current={esActual ? 'page' : undefined}
                    className={`flex flex-col gap-[3px] px-4 py-3 hover:bg-fondo-tabla ${esActual ? 'bg-fondo-tabla' : ''}`}
                  >
                    <span className={`text-sm ${esActual ? 'font-semibold' : 'font-medium'}`}>{nombre}</span>
                    <span className="text-[13px] text-gris-500">
                      {c.categoria ? `${c.categoria} · ` : ''}
                      {motivoCorto(c.motivo, nombre)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <section className="flex flex-col gap-3 rounded-tarjeta bg-negro p-[18px]">
        <h2 className="text-[15px] font-semibold text-white">Se vincularon solos</h2>
        <div className="flex items-baseline gap-2.5">
          <Numero className="text-[34px] leading-none font-medium tracking-[-0.03em] text-white">{revisiones.vinculadosSolos}</Numero>
          <span className="text-sm text-gris-400">{revisiones.vinculadosSolos === 1 ? 'jugador' : 'jugadores'} de tu padrón</span>
        </div>
        <p className="text-[13px] leading-[1.45] text-gris-400">
          El sistema solo pide que decidas cuando hay dos perfiles iguales o parecidos, o cuando otra cuenta reclama un perfil.
        </p>
      </section>
    </aside>
  );
}
