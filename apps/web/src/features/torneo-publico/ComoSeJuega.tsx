import { JUGADORES_POR_GRUPO, letrasDeZonas, type Formato, type TorneoPublico } from '@setpoint/shared';
import { Numero } from '../../components/Numero';

// El formato del torneo dibujado (decisión 160): las zonas con sus marcas, quiénes van a cada cuadro
// y cuántos partidos juega cada uno como mínimo. "8 zonas de 4 · dos cuadros" se entiende si ya
// jugaste el circuito; dibujado, se entiende la primera vez. Las marcas van en los colores de cada
// cuadro: ámbar el Campeonato y petróleo el consuelo (design.md §3).
export function ComoSeJuega({ torneo, formato }: { torneo: TorneoPublico; formato: Formato }) {
  const clasifican = torneo.clasificanPorGrupo;
  const resto = JUGADORES_POR_GRUPO - clasifican;
  const consuelo = torneo.tieneCuadroConsuelo ? torneo.nombreCuadroConsuelo : null;

  return (
    <section className="flex flex-col gap-4 rounded-[16px] border border-linea bg-papel p-[18px]">
      <h2 className="text-base font-semibold">Cómo se juega</h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <ol className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(68px,1fr))] gap-[6px]" aria-label={`${torneo.cantidadGrupos} zonas de ${JUGADORES_POR_GRUPO}`}>
          {letrasDeZonas(torneo.cantidadGrupos).map((letra) => (
            <li key={letra} className="flex flex-col gap-1 rounded-[8px] border border-linea px-2 py-1.5">
              <span className="text-[12.5px] text-pizarra-500">Zona {letra}</span>
              <span className="flex gap-[2px]" aria-hidden>
                {Array.from({ length: JUGADORES_POR_GRUPO }, (_, i) => (
                  <span
                    key={i}
                    className={`h-2.5 flex-1 rounded-[2px] ${i < clasifican ? 'bg-ambar' : consuelo ? 'bg-petroleo' : 'bg-linea'}`}
                  />
                ))}
              </span>
            </li>
          ))}
        </ol>

        <ul className="flex flex-col gap-1.5 sm:w-[190px]">
          <li className="flex items-center justify-between gap-3 rounded-[8px] bg-ambar-fondo px-3 py-2 text-[15px] text-ambar">
            <span>Campeonato</span>
            <Numero>{formato.jugadoresCampeonato}</Numero>
          </li>
          {consuelo && (
            <li className="flex items-center justify-between gap-3 rounded-[8px] bg-petroleo-fondo px-3 py-2 text-[15px] text-petroleo">
              <span>{consuelo}</span>
              <Numero>{formato.jugadoresComplementaria}</Numero>
            </li>
          )}
        </ul>
      </div>

      <p className="max-w-[66ch] text-[15px] leading-[1.45] text-pizarra-700">
        Todos contra todos en tu zona: <Numero>{JUGADORES_POR_GRUPO - 1}</Numero> partidos.{' '}
        {clasifican === 1 ? 'El primero' : <>Los <Numero>{clasifican}</Numero> primeros</>} de cada zona{' '}
        {clasifican === 1 ? 'va' : 'van'} a Campeonato
        {consuelo ? (
          <>
            {' '}y {resto === 1 ? 'el otro' : <>los otros <Numero>{resto}</Numero></>} a {consuelo}, así que nadie queda afuera.
          </>
        ) : (
          <>
            ; {resto === 1 ? 'el otro termina' : <>los otros <Numero>{resto}</Numero> terminan</>} en la zona.
          </>
        )}{' '}
        Jugás al menos <Numero>{formato.minimoPartidosPorJugador}</Numero> partidos.
      </p>
    </section>
  );
}
