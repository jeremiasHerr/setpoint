import { BotonLink } from '../../components/Boton';
import { Numero } from '../../components/Numero';
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
          <Numero className="flex grow items-center text-[13px] text-pizarra-500">
            {torneo.termino ?? '—'} · {torneo.jugadores} jugadores
          </Numero>
          <BotonLink to={`/torneos/${torneo.id}/cierre`}>Ver</BotonLink>
        </>
      }
    />
  );
}
