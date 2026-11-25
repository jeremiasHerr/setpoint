import { BotonLink } from '../../components/Boton';
import { TarjetaDeColumna } from './TarjetaDeColumna';
import type { TorneoEnBorrador } from './tiposDeInicio';

// Los borradores no los ve ningún jugador: lo único que se puede hacer con ellos es terminarlos.
export function TarjetaBorrador({ torneo }: { torneo: TorneoEnBorrador }) {
  return (
    <TarjetaDeColumna
      calendario={torneo.calendario}
      nombre={torneo.nombre}
      detalle={torneo.detalle}
      acciones={
        <BotonLink className="grow" to={`/torneos/${torneo.id}`}>
          Seguir editando
        </BotonLink>
      }
    />
  );
}
