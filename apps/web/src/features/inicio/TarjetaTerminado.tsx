import { BotonLink } from '../../components/Boton';
import { ConCifras } from '../../components/Numero';
import { TarjetaDeColumna } from './TarjetaDeColumna';
import type { TorneoTerminado } from './tiposDeInicio';

// Un torneo cerrado: lleva a su cierre, con los campeones y los puntos (decisión 080).
export function TarjetaTerminado({ torneo }: { torneo: TorneoTerminado }) {
  return (
    <TarjetaDeColumna
      calendario={torneo.calendario}
      nombre={torneo.nombre}
      detalle={torneo.campeon ? `Campeón: ${torneo.campeon}` : 'Sin campeón del cuadro principal'}
      acciones={
        <>
          <span className="flex grow items-center text-[13px] text-pizarra-500">
            <ConCifras>{`${torneo.termino ?? '—'} · ${torneo.jugadores} jugadores`}</ConCifras>
          </span>
          <BotonLink to={`/torneos/${torneo.id}/cierre`}>Ver</BotonLink>
        </>
      }
    />
  );
}
